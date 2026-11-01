import { Router, Request, Response } from 'express';
import { cafeRepo } from './db/repository';
import { MOODS_METADATA, STATIONS_METADATA, TABLE_ZONES_METADATA } from './sampleData';
import { Mood, OrderStatus, PreparationStation, Table } from './types';

export const apiRouter = Router();

// Helper to broadcast Socket.IO events to all connected clients
function broadcast(req: Request, type: string, payload: any) {
  const io = req.app.get('io');
  if (io) {
    io.emit(type, payload);
  }
}

// 1. Health check for Google Cloud Run container probes
apiRouter.get('/health', async (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'mood-cafe-api',
    database: 'PostgreSQL / Cloud SQL ready',
  });
});

// 2. Metadata (Moods, Table Zones, Preparation Stations)
apiRouter.get('/meta', (req: Request, res: Response) => {
  res.json({
    moods: MOODS_METADATA,
    zones: TABLE_ZONES_METADATA,
    stations: STATIONS_METADATA,
  });
});

// 3. Menu items
apiRouter.get('/menu', async (req: Request, res: Response) => {
  try {
    const { mood } = req.query;
    const menu = await cafeRepo.getMenu(typeof mood === 'string' ? mood : undefined);
    res.json(menu);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Tables & Floor Plan
apiRouter.get('/tables', async (req: Request, res: Response) => {
  try {
    const tables = await cafeRepo.getTables();
    res.json(tables);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.patch('/tables/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['available', 'occupied', 'reserved'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required: available, occupied, reserved' });
    }
    const updated = await cafeRepo.updateTableStatus(id, status as Table['status']);
    broadcast(req, 'TABLE_UPDATED', updated);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 5. Orders & Shōkenki (Order Management)
apiRouter.get('/orders', async (req: Request, res: Response) => {
  try {
    const orders = await cafeRepo.getOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await cafeRepo.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: `Order ${req.params.id} not found` });
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Transactional order submission
apiRouter.post('/orders', async (req: Request, res: Response) => {
  try {
    const { customerName, orderType, tableId, tableZone, mood, items } = req.body;

    // Input Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    if (!mood) {
      return res.status(400).json({ error: 'Customer mood is required' });
    }

    const newOrder = await cafeRepo.createOrderTransactional({
      customerName: customerName || 'Café Guest',
      orderType: orderType === 'takeaway' ? 'takeaway' : 'dine-in',
      tableId,
      tableZone,
      mood: mood as Mood,
      items,
    });

    // Real-time broadcasts
    broadcast(req, 'ORDER_CREATED', newOrder);
    const queue = await cafeRepo.getQueue();
    broadcast(req, 'QUEUE_UPDATED', queue);
    const tables = await cafeRepo.getTables();
    broadcast(req, 'TABLE_UPDATED', tables.find(t => t.id === tableId));

    res.status(201).json(newOrder);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update order status (KDS actions)
apiRouter.patch('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Order status is required' });
    }

    const updated = await cafeRepo.updateOrderStatus(id, status as OrderStatus);
    broadcast(req, 'ORDER_UPDATED', updated);
    const queue = await cafeRepo.getQueue();
    broadcast(req, 'QUEUE_UPDATED', queue);
    const tables = await cafeRepo.getTables();
    if (updated.tableId) {
      const tbl = tables.find(t => t.id === updated.tableId);
      if (tbl) broadcast(req, 'TABLE_UPDATED', tbl);
    }

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update station preparation progress
apiRouter.patch('/orders/:id/station', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { station, status } = req.body;
    if (!station || !status) {
      return res.status(400).json({ error: 'Station and status are required' });
    }

    const updated = await cafeRepo.updateStationStatus(id, station as PreparationStation, status);
    broadcast(req, 'ORDER_UPDATED', updated);
    const queue = await cafeRepo.getQueue();
    broadcast(req, 'QUEUE_UPDATED', queue);

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Simulated Payment Endpoint
apiRouter.post('/orders/:id/pay', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { method } = req.body;
    const result = await cafeRepo.processSimulatedPayment(id, method || 'digital_ticket_pay');
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 6. Virtual Queue API
apiRouter.get('/queue', async (req: Request, res: Response) => {
  try {
    const queue = await cafeRepo.getQueue();
    res.json(queue);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Reset / Re-seed demo data
apiRouter.post('/reset', async (req: Request, res: Response) => {
  try {
    await cafeRepo.resetDatabase();
    const [tables, orders, queue] = await Promise.all([
      cafeRepo.getTables(),
      cafeRepo.getOrders(),
      cafeRepo.getQueue(),
    ]);

    broadcast(req, 'RESET_DATA', { tables, orders, queue });
    res.json({ message: 'Database reset and re-seeded successfully', tables, orders, queue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

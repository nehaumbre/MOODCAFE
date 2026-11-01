import { MenuItem, Order, OrderItem, OrderStatus, PreparationStation, QueueEntry, StationProgress, Table, TableZone } from './types';
import { SAMPLE_MENU, SAMPLE_TABLES } from './sampleData';
import { WebSocket } from 'ws';

class CafeStore {
  private menu: MenuItem[] = [...SAMPLE_MENU];
  private tables: Table[] = JSON.parse(JSON.stringify(SAMPLE_TABLES));
  private orders: Order[] = [];
  private orderCounter: number = 101;
  private wsClients: Set<WebSocket> = new Set();

  constructor() {
    this.seedInitialOrders();
  }

  // Register WebSocket clients for real-time synchronization
  public addWsClient(ws: WebSocket) {
    this.wsClients.add(ws);
    // Send initial snapshot
    ws.send(JSON.stringify({
      type: 'INIT_STATE',
      payload: {
        tables: this.tables,
        orders: this.orders,
        queue: this.getQueue(),
      }
    }));

    ws.on('close', () => {
      this.wsClients.delete(ws);
    });
  }

  public broadcast(type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    for (const client of this.wsClients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (e) {
          console.error('Failed to broadcast to client:', e);
        }
      }
    }
  }

  // Initial seed orders for immediate rich demonstration
  private seedInitialOrders() {
    const now = Date.now();

    const order1: Order = {
      id: 'ord-seed-1',
      ticketNumber: '№ A-101',
      customerName: 'Kenji Takahashi',
      orderType: 'dine-in',
      tableId: 'F2',
      tableZone: 'Focus',
      mood: 'Focus',
      items: [
        {
          menuItemId: 'matcha-japanese-latte',
          name: 'Japanese Matcha Latte',
          japaneseName: '宇治抹茶ラテ',
          size: 'R',
          unitPrice: 309,
          quantity: 1,
          preparationStation: 'MatchaTea',
          customization: {
            temperature: 'Hot',
            milk: 'Oat Milk',
            sweetness: '25%',
          },
          itemStatus: 'in_prep',
        },
        {
          menuItemId: 'sourdough-roasted-tomato-feta',
          name: 'Roasted Tomato & Feta Sourdough',
          japaneseName: 'ローストトマトとフェタチーズの天然酵母トースト',
          size: 'R',
          unitPrice: 329,
          quantity: 1,
          preparationStation: 'HotKitchen',
          itemStatus: 'pending',
        }
      ],
      totalAmount: 638,
      status: 'preparing',
      estimatedMinutes: 8,
      estimatedReadyAt: new Date(now + 8 * 60000).toISOString(),
      createdAt: new Date(now - 4 * 60000).toISOString(),
      updatedAt: new Date(now - 1 * 60000).toISOString(),
      stationProgress: [
        { station: 'MatchaTea', stationName: 'Matcha & Tea Bar', status: 'in_prep', itemCount: 1 },
        { station: 'HotKitchen', stationName: 'Hot Kitchen', status: 'pending', itemCount: 1 },
      ],
      queuePosition: 1,
    };

    const order2: Order = {
      id: 'ord-seed-2',
      ticketNumber: '№ B-104',
      customerName: 'Aoi & Hiroshi',
      orderType: 'dine-in',
      tableId: 'S2',
      tableZone: 'Social',
      mood: 'Comfort',
      items: [
        {
          menuItemId: 'twc-french-vanilla-latte',
          name: 'French Vanilla Latte',
          japaneseName: 'フレンチバニララテ',
          size: 'L',
          unitPrice: 379,
          quantity: 2,
          preparationStation: 'Espresso',
          customization: {
            temperature: 'Hot',
            sweetness: '50%',
          },
          itemStatus: 'ready',
        },
        {
          menuItemId: 'pasta-creamy-alfredo',
          name: 'Creamy Alfredo Pasta Veg',
          japaneseName: '濃厚アルフレード・クリームパスタ',
          size: 'R',
          unitPrice: 449,
          quantity: 1,
          preparationStation: 'HotKitchen',
          itemStatus: 'in_prep',
        }
      ],
      totalAmount: 1207,
      status: 'plating',
      estimatedMinutes: 5,
      estimatedReadyAt: new Date(now + 3 * 60000).toISOString(),
      createdAt: new Date(now - 9 * 60000).toISOString(),
      updatedAt: new Date(now - 2 * 60000).toISOString(),
      stationProgress: [
        { station: 'Espresso', stationName: 'Espresso Bar', status: 'ready', itemCount: 2 },
        { station: 'HotKitchen', stationName: 'Hot Kitchen', status: 'in_prep', itemCount: 1 },
      ],
      queuePosition: 2,
    };

    const order3: Order = {
      id: 'ord-seed-3',
      ticketNumber: '№ C-202',
      customerName: 'Ren Tanaka',
      orderType: 'takeaway',
      mood: 'Energetic',
      items: [
        {
          menuItemId: 'twc-vietnamese-shakerato',
          name: 'Vietnamese Shakerato',
          japaneseName: 'ベトナム風シェケラート',
          size: 'L',
          unitPrice: 349,
          quantity: 1,
          preparationStation: 'Espresso',
          customization: {
            temperature: 'Iced',
            iceLevel: 'Normal',
          },
          itemStatus: 'ready',
        }
      ],
      totalAmount: 349,
      status: 'ready',
      estimatedMinutes: 0,
      estimatedReadyAt: new Date(now - 1 * 60000).toISOString(),
      createdAt: new Date(now - 6 * 60000).toISOString(),
      updatedAt: new Date(now).toISOString(),
      stationProgress: [
        { station: 'Espresso', stationName: 'Espresso Bar', status: 'ready', itemCount: 1 },
      ],
      queuePosition: 0,
      isReadyNotificationSent: true,
    };

    this.orders.push(order1, order2, order3);
    this.orderCounter = 105;
  }

  // Getters
  public getMenu(): MenuItem[] {
    return this.menu;
  }

  public getTables(): Table[] {
    return this.tables;
  }

  public getOrders(): Order[] {
    return this.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id || o.ticketNumber === id);
  }

  public getQueue(): QueueEntry[] {
    // Only active orders that are not yet completed
    return this.orders
      .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
      .map((o, idx) => ({
        ticketNumber: o.ticketNumber,
        orderId: o.id,
        customerName: o.customerName,
        queuePosition: idx + 1,
        status: o.status,
        estimatedMinutes: o.estimatedMinutes,
        orderType: o.orderType,
        tableId: o.tableId,
        mood: o.mood,
        itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
        createdAt: o.createdAt,
      }));
  }

  // Create an authentic Shōkenki Order
  public createOrder(data: {
    customerName: string;
    orderType: 'dine-in' | 'takeaway';
    tableId?: string;
    tableZone?: TableZone;
    mood: MenuItem['primaryMood'];
    items: {
      menuItemId: string;
      size: 'R' | 'L';
      quantity: number;
      customization?: any;
    }[];
  }): Order {
    const ticketLetter = data.mood[0].toUpperCase();
    const ticketNumber = `№ ${ticketLetter}-${this.orderCounter++}`;
    const now = new Date();

    const orderItems: OrderItem[] = data.items.map(reqItem => {
      const menuItem = this.menu.find(m => m.id === reqItem.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item not found: ${reqItem.menuItemId}`);
      }
      const unitPrice = reqItem.size === 'L' && menuItem.priceLarge
        ? menuItem.priceLarge
        : menuItem.priceRegular;

      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        japaneseName: menuItem.japaneseName,
        size: reqItem.size,
        unitPrice,
        quantity: reqItem.quantity,
        preparationStation: menuItem.preparationStation,
        customization: reqItem.customization,
        itemStatus: 'pending',
      };
    });

    const totalAmount = orderItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);

    // Group items by station
    const stationMap: Record<PreparationStation, number> = {
      Espresso: 0,
      MatchaTea: 0,
      HotKitchen: 0,
      ColdPrep: 0,
    };

    let maxBasePrep = 3;
    for (const item of orderItems) {
      stationMap[item.preparationStation] += item.quantity;
      const menuItem = this.menu.find(m => m.id === item.menuItemId);
      if (menuItem && menuItem.basePrepMinutes > maxBasePrep) {
        maxBasePrep = menuItem.basePrepMinutes;
      }
    }

    const stationProgress: StationProgress[] = (Object.keys(stationMap) as PreparationStation[])
      .filter(st => stationMap[st] > 0)
      .map(st => ({
        station: st,
        stationName: st === 'Espresso' ? 'Espresso Bar'
          : st === 'MatchaTea' ? 'Matcha & Tea Bar'
          : st === 'HotKitchen' ? 'Hot Kitchen' : 'Bakery & Cold Bar',
        status: 'pending',
        itemCount: stationMap[st],
      }));

    // Active load estimation
    const activeOrdersAtStations = this.orders.filter(o => o.status === 'preparing' || o.status === 'received').length;
    const estimatedMinutes = maxBasePrep + Math.ceil(activeOrdersAtStations * 1.5);
    const estimatedReadyAt = new Date(now.getTime() + estimatedMinutes * 60000).toISOString();

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticketNumber,
      customerName: data.customerName || 'Café Guest',
      orderType: data.orderType,
      tableId: data.tableId,
      tableZone: data.tableZone,
      mood: data.mood,
      items: orderItems,
      totalAmount,
      status: 'received',
      estimatedMinutes,
      estimatedReadyAt,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      stationProgress,
      queuePosition: this.getQueue().length + 1,
    };

    this.orders.unshift(newOrder);

    // Update table status if dine-in
    if (data.tableId) {
      const table = this.tables.find(t => t.id === data.tableId);
      if (table) {
        table.status = 'occupied';
        table.currentOrderNumber = ticketNumber;
        this.broadcast('TABLE_UPDATED', table);
      }
    }

    this.broadcast('ORDER_CREATED', newOrder);
    this.broadcast('QUEUE_UPDATED', this.getQueue());

    return newOrder;
  }

  // Update order status (KDS Action)
  public updateOrderStatus(orderId: string, newStatus: OrderStatus): Order {
    const order = this.orders.find(o => o.id === orderId || o.ticketNumber === orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'preparing') {
      order.stationProgress.forEach(sp => {
        if (sp.status === 'pending') sp.status = 'in_prep';
      });
      order.items.forEach(it => {
        if (it.itemStatus === 'pending') it.itemStatus = 'in_prep';
      });
    } else if (newStatus === 'ready') {
      order.stationProgress.forEach(sp => sp.status = 'ready');
      order.items.forEach(it => it.itemStatus = 'ready');
      order.estimatedMinutes = 0;
      order.isReadyNotificationSent = true;
    } else if (newStatus === 'completed') {
      if (order.tableId) {
        const table = this.tables.find(t => t.id === order.tableId);
        if (table && table.currentOrderNumber === order.ticketNumber) {
          table.status = 'available';
          table.currentOrderNumber = undefined;
          this.broadcast('TABLE_UPDATED', table);
        }
      }
    }

    this.broadcast('ORDER_UPDATED', order);
    this.broadcast('QUEUE_UPDATED', this.getQueue());

    return order;
  }

  // Update specific preparation station progress
  public updateStationProgress(orderId: string, station: PreparationStation, stationStatus: 'pending' | 'in_prep' | 'ready'): Order {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error(`Order not found: ${orderId}`);

    const progress = order.stationProgress.find(sp => sp.station === station);
    if (progress) {
      progress.status = stationStatus;
    }

    order.items
      .filter(it => it.preparationStation === station)
      .forEach(it => it.itemStatus = stationStatus);

    // If all stations are ready, elevate overall status to 'ready'
    const allReady = order.stationProgress.every(sp => sp.status === 'ready');
    if (allReady && order.status !== 'ready' && order.status !== 'completed') {
      order.status = 'ready';
      order.estimatedMinutes = 0;
      order.isReadyNotificationSent = true;
    }

    order.updatedAt = new Date().toISOString();
    this.broadcast('ORDER_UPDATED', order);
    this.broadcast('QUEUE_UPDATED', this.getQueue());

    return order;
  }

  // Table status toggle
  public updateTableStatus(tableId: string, status: Table['status']): Table {
    const table = this.tables.find(t => t.id === tableId);
    if (!table) throw new Error(`Table not found: ${tableId}`);

    table.status = status;
    if (status === 'available') {
      table.currentOrderNumber = undefined;
    }
    this.broadcast('TABLE_UPDATED', table);
    return table;
  }

  // Reset to default demo data
  public resetData() {
    this.menu = [...SAMPLE_MENU];
    this.tables = JSON.parse(JSON.stringify(SAMPLE_TABLES));
    this.orders = [];
    this.orderCounter = 101;
    this.seedInitialOrders();

    this.broadcast('RESET_DATA', {
      tables: this.tables,
      orders: this.orders,
      queue: this.getQueue(),
    });
  }
}

export const cafeStore = new CafeStore();

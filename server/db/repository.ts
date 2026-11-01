import fs from 'fs';
import path from 'path';
import { MenuItem, Mood, Order, OrderItem, OrderStatus, PreparationStation, QueueEntry, StationProgress, Table, TableZone } from '../types';
import { pool, withTransaction, testDbConnection } from './index';
import { runMigrations } from './migrate';
import { SAMPLE_MENU, SAMPLE_TABLES } from '../sampleData';

// Persistent disk storage fallback ensuring data survives restarts even when local PostgreSQL credentials are not configured
class DiskPersistentFallback {
  public menu: MenuItem[] = [...SAMPLE_MENU];
  public tables: Table[] = JSON.parse(JSON.stringify(SAMPLE_TABLES));
  public orders: Order[] = [];
  public orderCounter: number = 105;
  private filePath = path.resolve(process.cwd(), 'cafe_storage.json');

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const data = JSON.parse(raw);
        if (data.tables && Array.isArray(data.tables)) this.tables = data.tables;
        if (data.orders && Array.isArray(data.orders)) this.orders = data.orders;
        if (typeof data.orderCounter === 'number') this.orderCounter = data.orderCounter;
        return;
      }
    } catch (e: any) {
      console.warn('Could not read cafe_storage.json, initializing seeds:', e.message);
    }
    this.seedFallback();
    this.saveToFile();
  }

  public saveToFile() {
    try {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify({ tables: this.tables, orders: this.orders, orderCounter: this.orderCounter }, null, 2),
        'utf8'
      );
    } catch (e: any) {
      console.warn('Could not persist cafe_storage.json:', e.message);
    }
  }

  private seedFallback() {
    const now = Date.now();
    this.orders = [
      {
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
            customization: { temperature: 'Hot', milk: 'Oat Milk', sweetness: '25%' },
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
      },
      {
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
            customization: { temperature: 'Hot', sweetness: '50%' },
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
        estimatedMinutes: 3,
        estimatedReadyAt: new Date(now + 3 * 60000).toISOString(),
        createdAt: new Date(now - 9 * 60000).toISOString(),
        updatedAt: new Date(now - 2 * 60000).toISOString(),
        stationProgress: [
          { station: 'Espresso', stationName: 'Espresso Bar', status: 'ready', itemCount: 2 },
          { station: 'HotKitchen', stationName: 'Hot Kitchen', status: 'in_prep', itemCount: 1 },
        ],
        queuePosition: 2,
      }
    ];
  }
}

class CafeRepository {
  private isPgAvailable = false;
  private fallback = new DiskPersistentFallback();

  public async init() {
    this.isPgAvailable = await testDbConnection();
    if (this.isPgAvailable) {
      try {
        await runMigrations();
        console.log('🚀 PostgreSQL Relational Database ready and connected.');
      } catch (err: any) {
        console.warn('⚠️ PostgreSQL migration notice:', err.message);
      }
    } else {
      console.log('📦 Operating in Resilient Disk-Persistent Storage mode.');
    }
  }

  // --- MENU ---
  public async getMenu(moodFilter?: string): Promise<MenuItem[]> {
    if (this.isPgAvailable) {
      try {
        let sql = `SELECT * FROM menu_items`;
        const params: any[] = [];
        if (moodFilter) {
          sql += ` WHERE primary_mood = $1 OR moods @> $2::jsonb`;
          params.push(moodFilter, JSON.stringify([moodFilter]));
        }
        sql += ` ORDER BY name ASC`;
        const res = await pool.query(sql, params);
        return res.rows.map(r => ({
          id: r.id,
          name: r.name,
          japaneseName: r.japanese_name,
          category: r.category,
          description: r.description,
          priceRegular: parseFloat(r.price_regular),
          priceLarge: r.price_large ? parseFloat(r.price_large) : undefined,
          calories: r.calories || undefined,
          preparationStation: r.preparation_station as PreparationStation,
          basePrepMinutes: r.base_prep_minutes,
          primaryMood: r.primary_mood as Mood,
          moods: typeof r.moods === 'string' ? JSON.parse(r.moods) : r.moods,
          tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags,
          isVeg: r.is_veg,
          isNew: r.is_new,
          temperatureOptions: r.temperature_options ? (typeof r.temperature_options === 'string' ? JSON.parse(r.temperature_options) : r.temperature_options) : undefined,
        }));
      } catch (e: any) {
        console.warn('Database fallback on getMenu:', e.message);
      }
    }

    if (moodFilter) {
      return this.fallback.menu.filter(m => m.primaryMood === moodFilter || m.moods.includes(moodFilter as Mood));
    }
    return this.fallback.menu;
  }

  // --- TABLES ---
  public async getTables(): Promise<Table[]> {
    if (this.isPgAvailable) {
      try {
        const res = await pool.query(`SELECT * FROM cafe_tables ORDER BY id ASC`);
        return res.rows.map(r => ({
          id: r.id,
          zone: r.zone as TableZone,
          name: r.name,
          capacity: r.capacity,
          status: r.status as Table['status'],
          features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features,
          currentOrderNumber: r.current_order_number || undefined,
        }));
      } catch (e: any) {
        console.warn('Database fallback on getTables:', e.message);
      }
    }
    return this.fallback.tables;
  }

  public async updateTableStatus(tableId: string, status: Table['status']): Promise<Table> {
    if (this.isPgAvailable) {
      try {
        let res;
        if (status === 'available') {
          res = await pool.query(
            `UPDATE cafe_tables SET status = $1, current_order_number = NULL, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [status, tableId]
          );
        } else {
          res = await pool.query(
            `UPDATE cafe_tables SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [status, tableId]
          );
        }
        if (res.rows[0]) {
          const r = res.rows[0];
          return {
            id: r.id,
            zone: r.zone as TableZone,
            name: r.name,
            capacity: r.capacity,
            status: r.status as Table['status'],
            features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features,
            currentOrderNumber: r.current_order_number || undefined,
          };
        }
      } catch (e: any) {
        console.warn('Database fallback on updateTableStatus:', e.message);
      }
    }

    const t = this.fallback.tables.find(tbl => tbl.id === tableId);
    if (!t) throw new Error(`Table ${tableId} not found`);
    t.status = status;
    if (status === 'available') t.currentOrderNumber = undefined;
    this.fallback.saveToFile();
    return t;
  }

  // --- ORDERS ---
  public async getOrders(): Promise<Order[]> {
    if (this.isPgAvailable) {
      try {
        const ordersRes = await pool.query(`SELECT * FROM orders ORDER BY created_at DESC`);
        const itemsRes = await pool.query(`SELECT * FROM order_items ORDER BY created_at ASC`);

        return ordersRes.rows.map(o => {
          const items: OrderItem[] = itemsRes.rows
            .filter(i => i.order_id === o.id)
            .map(i => ({
              menuItemId: i.menu_item_id,
              name: i.name,
              japaneseName: i.japanese_name,
              size: i.size as 'R' | 'L',
              unitPrice: parseFloat(i.unit_price),
              quantity: i.quantity,
              preparationStation: i.preparation_station as PreparationStation,
              customization: i.customization ? (typeof i.customization === 'string' ? JSON.parse(i.customization) : i.customization) : undefined,
              itemStatus: i.item_status as OrderItem['itemStatus'],
            }));

          const stationMap: Record<PreparationStation, { count: number; readyCount: number; prepCount: number }> = {
            Espresso: { count: 0, readyCount: 0, prepCount: 0 },
            MatchaTea: { count: 0, readyCount: 0, prepCount: 0 },
            HotKitchen: { count: 0, readyCount: 0, prepCount: 0 },
            ColdPrep: { count: 0, readyCount: 0, prepCount: 0 },
          };

          items.forEach(it => {
            stationMap[it.preparationStation].count += it.quantity;
            if (it.itemStatus === 'ready') stationMap[it.preparationStation].readyCount += it.quantity;
            if (it.itemStatus === 'in_prep') stationMap[it.preparationStation].prepCount += it.quantity;
          });

          const stationProgress: StationProgress[] = (Object.keys(stationMap) as PreparationStation[])
            .filter(st => stationMap[st].count > 0)
            .map(st => {
              const info = stationMap[st];
              const status: 'pending' | 'in_prep' | 'ready' =
                info.readyCount === info.count ? 'ready'
                : info.prepCount > 0 || info.readyCount > 0 ? 'in_prep' : 'pending';

              return {
                station: st,
                stationName: st === 'Espresso' ? 'Espresso Bar'
                  : st === 'MatchaTea' ? 'Matcha & Tea Bar'
                  : st === 'HotKitchen' ? 'Hot Kitchen' : 'Bakery & Cold Bar',
                status,
                itemCount: info.count,
              };
            });

          return {
            id: o.id,
            ticketNumber: o.ticket_number,
            customerName: o.customer_name,
            orderType: o.order_type as 'dine-in' | 'takeaway',
            tableId: o.table_id || undefined,
            tableZone: o.table_zone as TableZone || undefined,
            mood: o.mood as Mood,
            items,
            totalAmount: parseFloat(o.total_amount),
            status: o.status as OrderStatus,
            estimatedMinutes: o.estimated_minutes,
            estimatedReadyAt: o.estimated_ready_at,
            createdAt: o.created_at,
            updatedAt: o.updated_at,
            stationProgress,
            queuePosition: 1,
            isReadyNotificationSent: o.is_ready_notification_sent,
          };
        });
      } catch (e: any) {
        console.warn('Database fallback on getOrders:', e.message);
      }
    }
    return this.fallback.orders;
  }

  public async getOrderById(id: string): Promise<Order | undefined> {
    const orders = await this.getOrders();
    return orders.find(o => o.id === id || o.ticketNumber === id);
  }

  // Transactional creation of Order, OrderItems, MoodPreference, TablePreference, and QueueEntry
  public async createOrderTransactional(data: {
    customerName: string;
    orderType: 'dine-in' | 'takeaway';
    tableId?: string;
    tableZone?: TableZone;
    mood: Mood;
    items: {
      menuItemId: string;
      size: 'R' | 'L';
      quantity: number;
      customization?: any;
    }[];
  }): Promise<Order> {
    const menu = await this.getMenu();
    const orderItems: OrderItem[] = data.items.map(reqItem => {
      const menuItem = menu.find(m => m.id === reqItem.menuItemId);
      if (!menuItem) throw new Error(`Menu item not found: ${reqItem.menuItemId}`);
      const unitPrice = reqItem.size === 'L' && menuItem.priceLarge ? menuItem.priceLarge : menuItem.priceRegular;
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

    let maxBasePrep = 3;
    for (const item of orderItems) {
      const menuItem = menu.find(m => m.id === item.menuItemId);
      if (menuItem && menuItem.basePrepMinutes > maxBasePrep) {
        maxBasePrep = menuItem.basePrepMinutes;
      }
    }

    const currentOrders = await this.getOrders();
    const activeLoad = currentOrders.filter(o => o.status === 'preparing' || o.status === 'received').length;
    const estimatedMinutes = maxBasePrep + Math.ceil(activeLoad * 1.5);
    const now = new Date();
    const estimatedReadyAt = new Date(now.getTime() + estimatedMinutes * 60000).toISOString();

    const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const ticketLetter = data.mood[0].toUpperCase();
    const ticketCounter = 100 + currentOrders.length + 1;
    const ticketNumber = `№ ${ticketLetter}-${ticketCounter}`;

    if (this.isPgAvailable) {
      try {
        return await withTransaction(async (client) => {
          const customerId = `cust-${Date.now()}`;
          await client.query(
            `INSERT INTO customers (id, name) VALUES ($1, $2)`,
            [customerId, data.customerName || 'Café Guest']
          );

          await client.query(
            `INSERT INTO orders (
              id, ticket_number, customer_id, customer_name, order_type,
              table_id, table_zone, mood, total_amount, status, estimated_minutes,
              estimated_ready_at, payment_status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [
              orderId, ticketNumber, customerId, data.customerName || 'Café Guest',
              data.orderType, data.tableId || null, data.tableZone || null,
              data.mood, totalAmount, 'received', estimatedMinutes,
              estimatedReadyAt, 'completed', now.toISOString(), now.toISOString(),
            ]
          );

          for (const it of orderItems) {
            await client.query(
              `INSERT INTO order_items (
                id, order_id, menu_item_id, name, japanese_name, size, unit_price, quantity,
                preparation_station, customization, item_status
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [
                `oi-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                orderId, it.menuItemId, it.name, it.japaneseName, it.size,
                it.unitPrice, it.quantity, it.preparationStation,
                it.customization ? JSON.stringify(it.customization) : null,
                'pending',
              ]
            );
          }

          await client.query(
            `INSERT INTO mood_preferences (id, customer_id, order_id, selected_mood, sensory_notes)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              `mp-${Date.now()}`, customerId, orderId, data.mood,
              JSON.stringify({ mood: data.mood, time: now.toISOString() })
            ]
          );

          if (data.tableId) {
            await client.query(
              `INSERT INTO table_preferences (id, order_id, preferred_zone, table_id, seating_preference)
               VALUES ($1, $2, $3, $4, $5)`,
              [`tp-${Date.now()}`, orderId, data.tableZone || 'Social', data.tableId, 'Assigned Table']
            );

            await client.query(
              `UPDATE cafe_tables SET status = 'occupied', current_order_number = $1, updated_at = NOW() WHERE id = $2`,
              [ticketNumber, data.tableId]
            );
          }

          const queueCountRes = await client.query(`SELECT COUNT(*) AS count FROM queue_entries WHERE status != 'completed'`);
          const queuePosition = parseInt(queueCountRes.rows[0].count, 10) + 1;

          await client.query(
            `INSERT INTO queue_entries (id, ticket_number, order_id, queue_position, status, estimated_minutes)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [`qe-${Date.now()}`, ticketNumber, orderId, queuePosition, 'received', estimatedMinutes]
          );

          const created = await this.getOrderById(orderId);
          if (created) return created;
        });
      } catch (err: any) {
        console.warn('Database error on createOrderTransactional:', err.message);
      }
    }

    // Fallback disk-persistent execution
    const stationMap: Record<PreparationStation, number> = {
      Espresso: 0, MatchaTea: 0, HotKitchen: 0, ColdPrep: 0,
    };
    orderItems.forEach(it => stationMap[it.preparationStation] += it.quantity);

    const stationProgress: StationProgress[] = (Object.keys(stationMap) as PreparationStation[])
      .filter(st => stationMap[st] > 0)
      .map(st => ({
        station: st,
        stationName: st === 'Espresso' ? 'Espresso Bar' : st === 'MatchaTea' ? 'Matcha & Tea Bar' : st === 'HotKitchen' ? 'Hot Kitchen' : 'Bakery & Cold Bar',
        status: 'pending',
        itemCount: stationMap[st],
      }));

    const newOrder: Order = {
      id: orderId,
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
      queuePosition: this.fallback.orders.length + 1,
    };

    this.fallback.orders.unshift(newOrder);

    if (data.tableId) {
      const t = this.fallback.tables.find(tbl => tbl.id === data.tableId);
      if (t) {
        t.status = 'occupied';
        t.currentOrderNumber = ticketNumber;
      }
    }

    this.fallback.saveToFile();
    return newOrder;
  }

  // Update order status with transactional cascade
  public async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    if (this.isPgAvailable) {
      try {
        await withTransaction(async (client) => {
          await client.query(
            `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 OR ticket_number = $2`,
            [newStatus, orderId]
          );

          await client.query(
            `UPDATE queue_entries SET status = $1, updated_at = NOW() WHERE order_id = $2 OR ticket_number = $2`,
            [newStatus, orderId]
          );

          if (newStatus === 'preparing') {
            await client.query(
              `UPDATE order_items SET item_status = 'in_prep' WHERE order_id = (SELECT id FROM orders WHERE id = $1 OR ticket_number = $1)`,
              [orderId]
            );
          } else if (newStatus === 'ready') {
            await client.query(
              `UPDATE order_items SET item_status = 'ready' WHERE order_id = (SELECT id FROM orders WHERE id = $1 OR ticket_number = $1)`,
              [orderId]
            );
            await client.query(
              `UPDATE orders SET is_ready_notification_sent = true, estimated_minutes = 0 WHERE id = $1 OR ticket_number = $1`,
              [orderId]
            );
          } else if (newStatus === 'completed') {
            const ordRes = await client.query(`SELECT table_id, ticket_number FROM orders WHERE id = $1 OR ticket_number = $1`, [orderId]);
            if (ordRes.rows[0]?.table_id) {
              await client.query(
                `UPDATE cafe_tables SET status = 'available', current_order_number = NULL, updated_at = NOW() WHERE id = $1 AND current_order_number = $2`,
                [ordRes.rows[0].table_id, ordRes.rows[0].ticket_number]
              );
            }
          }
        });

        const updated = await this.getOrderById(orderId);
        if (updated) return updated;
      } catch (err: any) {
        console.warn('Database error on updateOrderStatus:', err.message);
      }
    }

    const order = this.fallback.orders.find(o => o.id === orderId || o.ticketNumber === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'preparing') {
      order.stationProgress.forEach(sp => sp.status = 'in_prep');
      order.items.forEach(it => it.itemStatus = 'in_prep');
    } else if (newStatus === 'ready') {
      order.stationProgress.forEach(sp => sp.status = 'ready');
      order.items.forEach(it => it.itemStatus = 'ready');
      order.estimatedMinutes = 0;
      order.isReadyNotificationSent = true;
    } else if (newStatus === 'completed') {
      if (order.tableId) {
        const t = this.fallback.tables.find(tbl => tbl.id === order.tableId);
        if (t && t.currentOrderNumber === order.ticketNumber) {
          t.status = 'available';
          t.currentOrderNumber = undefined;
        }
      }
    }

    this.fallback.saveToFile();
    return order;
  }

  // Update specific station item progress
  public async updateStationStatus(orderId: string, station: PreparationStation, status: 'pending' | 'in_prep' | 'ready'): Promise<Order> {
    if (this.isPgAvailable) {
      try {
        await withTransaction(async (client) => {
          await client.query(
            `UPDATE order_items SET item_status = $1 WHERE order_id = (SELECT id FROM orders WHERE id = $2 OR ticket_number = $2) AND preparation_station = $3`,
            [status, orderId, station]
          );

          const checkRes = await client.query(
            `SELECT COUNT(*) AS pending_count FROM order_items
             WHERE order_id = (SELECT id FROM orders WHERE id = $1 OR ticket_number = $1)
             AND item_status != 'ready'`,
            [orderId]
          );

          if (parseInt(checkRes.rows[0].pending_count, 10) === 0) {
            await client.query(
              `UPDATE orders SET status = 'ready', is_ready_notification_sent = true, estimated_minutes = 0, updated_at = NOW() WHERE id = $1 OR ticket_number = $1`,
              [orderId]
            );
            await client.query(
              `UPDATE queue_entries SET status = 'ready', estimated_minutes = 0, updated_at = NOW() WHERE order_id = (SELECT id FROM orders WHERE id = $1 OR ticket_number = $1)`,
              [orderId]
            );
          }
        });

        const updated = await this.getOrderById(orderId);
        if (updated) return updated;
      } catch (err: any) {
        console.warn('Database error on updateStationStatus:', err.message);
      }
    }

    const order = this.fallback.orders.find(o => o.id === orderId || o.ticketNumber === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    const sp = order.stationProgress.find(p => p.station === station);
    if (sp) sp.status = status;

    order.items.filter(it => it.preparationStation === station).forEach(it => it.itemStatus = status);

    const allReady = order.stationProgress.every(p => p.status === 'ready');
    if (allReady && order.status !== 'ready' && order.status !== 'completed') {
      order.status = 'ready';
      order.estimatedMinutes = 0;
      order.isReadyNotificationSent = true;
    }

    this.fallback.saveToFile();
    return order;
  }

  // --- VIRTUAL QUEUE ---
  public async getQueue(): Promise<QueueEntry[]> {
    if (this.isPgAvailable) {
      try {
        const res = await pool.query(
          `SELECT q.*, o.customer_name, o.order_type, o.table_id, o.mood,
                  (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE order_id = o.id) AS item_count
           FROM queue_entries q
           JOIN orders o ON q.order_id = o.id
           WHERE o.status != 'completed' AND o.status != 'cancelled'
           ORDER BY q.created_at ASC`
        );

        return res.rows.map((r, idx) => ({
          ticketNumber: r.ticket_number,
          orderId: r.order_id,
          customerName: r.customer_name,
          queuePosition: idx + 1,
          status: r.status as OrderStatus,
          estimatedMinutes: r.estimated_minutes,
          orderType: r.order_type as 'dine-in' | 'takeaway',
          tableId: r.table_id || undefined,
          mood: r.mood as Mood,
          itemCount: parseInt(r.item_count, 10),
          createdAt: r.created_at,
        }));
      } catch (e: any) {
        console.warn('Database fallback on getQueue:', e.message);
      }
    }

    return this.fallback.orders
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

  // --- SIMULATED PAYMENT ---
  public async processSimulatedPayment(orderId: string, paymentMethod = 'digital_ticket_pay'): Promise<{ success: boolean; paymentReference: string }> {
    const paymentReference = `PAY-SIM-${Date.now().toString(36).toUpperCase()}`;

    if (this.isPgAvailable) {
      try {
        await pool.query(
          `UPDATE orders SET payment_status = 'completed', payment_reference = $1, updated_at = NOW() WHERE id = $2 OR ticket_number = $2`,
          [paymentReference, orderId]
        );
      } catch (e: any) {
        console.warn('Database error on processSimulatedPayment:', e.message);
      }
    }

    return { success: true, paymentReference };
  }

  // --- RESET / RE-SEED ---
  public async resetDatabase(): Promise<void> {
    if (this.isPgAvailable) {
      try {
        await withTransaction(async (client) => {
          await client.query(`DELETE FROM queue_entries`);
          await client.query(`DELETE FROM table_preferences`);
          await client.query(`DELETE FROM mood_preferences`);
          await client.query(`DELETE FROM order_items`);
          await client.query(`DELETE FROM orders`);
          await client.query(`DELETE FROM customers`);
          await client.query(`UPDATE cafe_tables SET status = 'available', current_order_number = NULL`);
        });
        await runMigrations();
        return;
      } catch (e: any) {
        console.warn('Database error on resetDatabase:', e.message);
      }
    }

    if (fs.existsSync(this.fallback['filePath'])) {
      try { fs.unlinkSync(this.fallback['filePath']); } catch {}
    }
    this.fallback = new DiskPersistentFallback();
  }
}

export const cafeRepo = new CafeRepository();

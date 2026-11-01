import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, withTransaction } from './index';
import { SAMPLE_MENU, SAMPLE_TABLES } from '../sampleData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('🔄 Running database migrations...');
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Execute schema definitions
  await pool.query(schemaSql);
  console.log('✅ PostgreSQL Schema tables verified/created successfully.');

  // Seed menu items if table is empty
  const menuCountRes = await pool.query('SELECT COUNT(*) AS count FROM menu_items');
  const menuCount = parseInt(menuCountRes.rows[0].count, 10);

  if (menuCount === 0) {
    console.log('🌱 Seeding initial Menu Items from Third Wave Coffee...');
    await withTransaction(async (client) => {
      for (const item of SAMPLE_MENU) {
        await client.query(
          `INSERT INTO menu_items (
            id, name, japanese_name, category, description,
            price_regular, price_large, calories, preparation_station,
            base_prep_minutes, primary_mood, moods, tags, is_veg, is_new, temperature_options
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            item.id,
            item.name,
            item.japaneseName,
            item.category,
            item.description,
            item.priceRegular,
            item.priceLarge || null,
            item.calories || null,
            item.preparationStation,
            item.basePrepMinutes,
            item.primaryMood,
            JSON.stringify(item.moods),
            JSON.stringify(item.tags),
            item.isVeg,
            item.isNew || false,
            JSON.stringify(item.temperatureOptions || []),
          ]
        );
      }
    });
    console.log(`✅ Seeded ${SAMPLE_MENU.length} menu items.`);
  }

  // Seed café tables if empty
  const tableCountRes = await pool.query('SELECT COUNT(*) AS count FROM cafe_tables');
  const tableCount = parseInt(tableCountRes.rows[0].count, 10);

  if (tableCount === 0) {
    console.log('🌱 Seeding initial Café Table zones...');
    await withTransaction(async (client) => {
      for (const t of SAMPLE_TABLES) {
        await client.query(
          `INSERT INTO cafe_tables (id, zone, name, capacity, status, features, current_order_number)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [t.id, t.zone, t.name, t.capacity, t.status, JSON.stringify(t.features), t.currentOrderNumber || null]
        );
      }
    });
    console.log(`✅ Seeded ${SAMPLE_TABLES.length} café tables.`);
  }

  // Seed sample initial orders if orders table is empty
  const orderCountRes = await pool.query('SELECT COUNT(*) AS count FROM orders');
  const orderCount = parseInt(orderCountRes.rows[0].count, 10);

  if (orderCount === 0) {
    console.log('🌱 Seeding demonstration orders, mood preferences, and queue entries...');
    await withTransaction(async (client) => {
      const now = Date.now();

      // Seed Customer 1
      const custId1 = 'cust-seed-1';
      await client.query(
        `INSERT INTO customers (id, name, email) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [custId1, 'Kenji Takahashi', 'kenji@example.com']
      );

      // Seed Order 1
      const ordId1 = 'ord-seed-1';
      const ticket1 = '№ A-101';
      await client.query(
        `INSERT INTO orders (
          id, ticket_number, customer_id, customer_name, order_type,
          table_id, table_zone, mood, total_amount, status, estimated_minutes,
          estimated_ready_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          ordId1, ticket1, custId1, 'Kenji Takahashi', 'dine-in',
          'F2', 'Focus', 'Focus', 638, 'preparing', 8,
          new Date(now + 8 * 60000).toISOString(),
          new Date(now - 4 * 60000).toISOString(),
          new Date(now - 1 * 60000).toISOString(),
        ]
      );

      // Order 1 Items
      await client.query(
        `INSERT INTO order_items (id, order_id, menu_item_id, name, japanese_name, size, unit_price, quantity, preparation_station, customization, item_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        ['oi-seed-1', ordId1, 'matcha-japanese-latte', 'Japanese Matcha Latte', '宇治抹茶ラテ', 'R', 309, 1, 'MatchaTea', JSON.stringify({ temperature: 'Hot', milk: 'Oat Milk', sweetness: '25%' }), 'in_prep']
      );
      await client.query(
        `INSERT INTO order_items (id, order_id, menu_item_id, name, japanese_name, size, unit_price, quantity, preparation_station, customization, item_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        ['oi-seed-2', ordId1, 'sourdough-roasted-tomato-feta', 'Roasted Tomato & Feta Sourdough', 'ローストトマトとフェタチーズの天然酵母トースト', 'R', 329, 1, 'HotKitchen', null, 'pending']
      );

      // Mood Preference 1
      await client.query(
        `INSERT INTO mood_preferences (id, customer_id, order_id, selected_mood, sensory_notes)
         VALUES ($1, $2, $3, $4, $5)`,
        ['mp-seed-1', custId1, ordId1, 'Focus', JSON.stringify(['Clean Caffeine', 'L-Theanine Clarity'])]
      );

      // Table Preference 1
      await client.query(
        `INSERT INTO table_preferences (id, order_id, preferred_zone, table_id, seating_preference)
         VALUES ($1, $2, $3, $4, $5)`,
        ['tp-seed-1', ordId1, 'Focus', 'F2', 'Silent Booth with Power']
      );

      // Queue Entry 1
      await client.query(
        `INSERT INTO queue_entries (id, ticket_number, order_id, queue_position, status, estimated_minutes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['qe-seed-1', ticket1, ordId1, 1, 'preparing', 8]
      );

      // Seed Customer 2
      const custId2 = 'cust-seed-2';
      await client.query(
        `INSERT INTO customers (id, name, email) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [custId2, 'Aoi & Hiroshi', 'aoi@example.com']
      );

      // Seed Order 2
      const ordId2 = 'ord-seed-2';
      const ticket2 = '№ B-104';
      await client.query(
        `INSERT INTO orders (
          id, ticket_number, customer_id, customer_name, order_type,
          table_id, table_zone, mood, total_amount, status, estimated_minutes,
          estimated_ready_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          ordId2, ticket2, custId2, 'Aoi & Hiroshi', 'dine-in',
          'S2', 'Social', 'Comfort', 1207, 'plating', 3,
          new Date(now + 3 * 60000).toISOString(),
          new Date(now - 9 * 60000).toISOString(),
          new Date(now - 2 * 60000).toISOString(),
        ]
      );

      await client.query(
        `INSERT INTO order_items (id, order_id, menu_item_id, name, japanese_name, size, unit_price, quantity, preparation_station, customization, item_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        ['oi-seed-3', ordId2, 'twc-french-vanilla-latte', 'French Vanilla Latte', 'フレンチバニララテ', 'L', 379, 2, 'Espresso', JSON.stringify({ temperature: 'Hot', sweetness: '50%' }), 'ready']
      );
      await client.query(
        `INSERT INTO order_items (id, order_id, menu_item_id, name, japanese_name, size, unit_price, quantity, preparation_station, customization, item_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        ['oi-seed-4', ordId2, 'pasta-creamy-alfredo', 'Creamy Alfredo Pasta Veg', '濃厚アルフレード・クリームパスタ', 'R', 449, 1, 'HotKitchen', null, 'in_prep']
      );

      await client.query(
        `INSERT INTO mood_preferences (id, customer_id, order_id, selected_mood, sensory_notes)
         VALUES ($1, $2, $3, $4, $5)`,
        ['mp-seed-2', custId2, ordId2, 'Comfort', JSON.stringify(['Velvety Milk Foam', 'Warmth'])]
      );

      await client.query(
        `INSERT INTO table_preferences (id, order_id, preferred_zone, table_id, seating_preference)
         VALUES ($1, $2, $3, $4, $5)`,
        ['tp-seed-2', ordId2, 'Social', 'S2', 'Garden Table']
      );

      await client.query(
        `INSERT INTO queue_entries (id, ticket_number, order_id, queue_position, status, estimated_minutes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['qe-seed-2', ticket2, ordId2, 2, 'plating', 3]
      );
    });
    console.log('✅ Seeded initial orders and queue records.');
  }
}

-- Mood Café PostgreSQL Relational Schema for Google Cloud SQL & Local PostgreSQL

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    japanese_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price_regular NUMERIC(10, 2) NOT NULL,
    price_large NUMERIC(10, 2),
    calories VARCHAR(50),
    preparation_station VARCHAR(50) NOT NULL,
    base_prep_minutes INTEGER NOT NULL DEFAULT 4,
    primary_mood VARCHAR(50) NOT NULL,
    moods JSONB NOT NULL DEFAULT '[]',
    tags JSONB NOT NULL DEFAULT '[]',
    is_veg BOOLEAN NOT NULL DEFAULT true,
    is_new BOOLEAN NOT NULL DEFAULT false,
    temperature_options JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Café Tables (Spatial & Personality Zones)
CREATE TABLE IF NOT EXISTS cafe_tables (
    id VARCHAR(32) PRIMARY KEY,
    zone VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 2,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    features JSONB NOT NULL DEFAULT '[]',
    current_order_number VARCHAR(50),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders Table (Shōkenki Ticket Records)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    order_type VARCHAR(50) NOT NULL DEFAULT 'dine-in',
    table_id VARCHAR(32) REFERENCES cafe_tables(id) ON DELETE SET NULL,
    table_zone VARCHAR(50),
    mood VARCHAR(50) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'received',
    estimated_minutes INTEGER NOT NULL DEFAULT 5,
    estimated_ready_at TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'completed',
    payment_reference VARCHAR(100),
    is_ready_notification_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id VARCHAR(64) REFERENCES menu_items(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    japanese_name VARCHAR(255) NOT NULL,
    size VARCHAR(10) NOT NULL DEFAULT 'R',
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    preparation_station VARCHAR(50) NOT NULL,
    customization JSONB,
    item_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Mood Preferences Table
CREATE TABLE IF NOT EXISTS mood_preferences (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
    selected_mood VARCHAR(50) NOT NULL,
    sensory_notes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table Preferences Table
CREATE TABLE IF NOT EXISTS table_preferences (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
    preferred_zone VARCHAR(50),
    table_id VARCHAR(32) REFERENCES cafe_tables(id) ON DELETE SET NULL,
    seating_preference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Virtual Queue Entries Table
CREATE TABLE IF NOT EXISTS queue_entries (
    id VARCHAR(64) PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    queue_position INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'received',
    estimated_minutes INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_station ON order_items(preparation_station);
CREATE INDEX IF NOT EXISTS idx_queue_entries_status ON queue_entries(status);
CREATE INDEX IF NOT EXISTS idx_cafe_tables_zone ON cafe_tables(zone);

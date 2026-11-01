import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Detect Google Cloud SQL Unix Socket vs TCP connection
const isCloudSqlSocket = Boolean(process.env.INSTANCE_UNIX_SOCKET);

const poolConfig: pg.PoolConfig = isCloudSqlSocket
  ? {
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE || 'mood_cafe',
      host: process.env.INSTANCE_UNIX_SOCKET,
      max: 10,
      idleTimeoutMillis: 30000,
    }
  : process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'mood_cafe',
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.warn('⚠️ Unexpected error on idle PostgreSQL client:', err.message);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const getClient = () => {
  return pool.connect();
};

// Safe transactional helper ensuring atomic BEGIN / COMMIT / ROLLBACK
export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Test connectivity
export async function testDbConnection(): Promise<boolean> {
  try {
    const res = await pool.query('SELECT NOW() AS current_time');
    console.log(`✅ PostgreSQL Connected successfully. Server time: ${res.rows[0].current_time}`);
    return true;
  } catch (err: any) {
    console.warn(`⚠️ PostgreSQL connection attempt: ${err.message}`);
    return false;
  }
}

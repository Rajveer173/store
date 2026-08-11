import pg from 'pg';
import { config } from '../config/env.js';

pg.types.setTypeParser(20, (value) => (value === null ? null : Number(value)));
pg.types.setTypeParser(1700, (value) => (value === null ? null : Number(value)));

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
});

export function query(text, params) {
  return pool.query(text, params);
}

export async function withTransaction(handler) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await handler(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function closePool() {
  await pool.end();
}

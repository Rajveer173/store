import app from './app.js';
import { config } from './config/env.js';
import { pool, closePool } from './db/index.js';

async function start() {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    process.stderr.write(`Unable to reach the database: ${error.message}\n`);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    process.stdout.write(`API listening on http://localhost:${config.port}\n`);
  });

  const shutdown = async (signal) => {
    process.stdout.write(`\nReceived ${signal}, shutting down\n`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();

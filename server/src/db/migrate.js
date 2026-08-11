import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, closePool } from './index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const shouldDrop = process.argv.includes('--drop');

const DROP_STATEMENTS = `
DROP VIEW IF EXISTS store_rating_summary;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS user_role;
`;

async function run() {
  const schema = await fs.readFile(path.join(currentDir, 'schema.sql'), 'utf8');

  if (shouldDrop) {
    process.stdout.write('Dropping existing schema objects\n');
    await pool.query(DROP_STATEMENTS);
  }

  await pool.query(schema);
  process.stdout.write('Migration completed\n');
}

run()
  .catch((error) => {
    process.stderr.write(`Migration failed: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(closePool);

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, '../../.env') });

function required(key, fallback) {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  databaseUrl: required('DATABASE_URL'),
  databaseSsl: process.env.DATABASE_SSL === 'true',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 10),
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL ?? 'admin@storeratings.com',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345',
};

export const ROLES = Object.freeze({
  ADMIN: 'SYSTEM_ADMIN',
  USER: 'NORMAL_USER',
  OWNER: 'STORE_OWNER',
});

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config, ROLES } from '../config/env.js';
import { query } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';

function toPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    role: row.role,
  };
}

function issueToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export async function register({ name, email, address, password }) {
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role`,
    [name, email, passwordHash, address, ROLES.USER],
  );

  const user = toPublicUser(rows[0]);
  return { user, token: issueToken(user) };
}

export async function login({ email, password }) {
  const { rows } = await query(
    'SELECT id, name, email, address, role, password_hash FROM users WHERE email = $1',
    [email],
  );

  const record = rows[0];
  const passwordMatches = record ? await bcrypt.compare(password, record.password_hash) : false;

  if (!record || !passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const user = toPublicUser(record);
  return { user, token: issueToken(user) };
}

export async function updatePassword(userId, { currentPassword, newPassword }) {
  const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);

  if (rows.length === 0) {
    throw ApiError.notFound('Account not found');
  }

  const matches = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!matches) {
    throw ApiError.badRequest('Validation failed', {
      currentPassword: 'Current password is incorrect',
    });
  }

  const passwordHash = await bcrypt.hash(newPassword, config.bcryptRounds);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
}

import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { query } from '../db/index.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized();
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch {
      throw ApiError.unauthorized('Session expired, please sign in again');
    }

    const { rows } = await query(
      'SELECT id, name, email, address, role FROM users WHERE id = $1',
      [payload.sub],
    );

    if (rows.length === 0) {
      throw ApiError.unauthorized('Account no longer exists');
    }

    req.user = rows[0];
    return next();
  } catch (error) {
    return next(error);
  }
}

export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    return next();
  };
}

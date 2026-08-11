import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const PG_UNIQUE_VIOLATION = '23505';
const PG_CHECK_VIOLATION = '23514';
const PG_FOREIGN_KEY_VIOLATION = '23503';

const UNIQUE_MESSAGES = {
  users_email_unique: 'An account with this email already exists',
  stores_email_unique: 'A store with this email already exists',
  ratings_user_store_unique: 'A rating already exists for this store',
};

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      ...(error.details ? { errors: error.details } : {}),
    });
  }

  if (error?.code === PG_UNIQUE_VIOLATION) {
    return res.status(409).json({
      message: UNIQUE_MESSAGES[error.constraint] ?? 'This record already exists',
    });
  }

  if (error?.code === PG_CHECK_VIOLATION) {
    return res.status(400).json({ message: 'One or more fields failed validation' });
  }

  if (error?.code === PG_FOREIGN_KEY_VIOLATION) {
    return res.status(400).json({ message: 'Referenced record does not exist' });
  }

  if (config.env !== 'test') {
    process.stderr.write(`${error.stack ?? error.message}\n`);
  }

  return res.status(500).json({ message: 'Something went wrong, please try again' });
}

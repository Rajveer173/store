import bcrypt from 'bcryptjs';
import { config, ROLES } from '../config/env.js';
import { query } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { resolvePagination, resolveSort, buildMeta } from '../utils/pagination.js';

const SORTABLE_COLUMNS = {
  name: 'u.name',
  email: 'u.email',
  address: 'u.address',
  role: 'u.role',
  rating: 'owner_stats.average_rating',
};

const OWNER_STATS_JOIN = `
  LEFT JOIN LATERAL (
    SELECT
      ROUND(AVG(r.score)::numeric, 2) AS average_rating,
      COUNT(r.id)                     AS rating_count,
      COUNT(DISTINCT s.id)            AS store_count
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE s.owner_id = u.id
  ) owner_stats ON TRUE
`;

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    role: row.role,
    rating: row.role === ROLES.OWNER ? Number(row.average_rating ?? 0) : null,
    storeCount: row.role === ROLES.OWNER ? Number(row.store_count ?? 0) : null,
    ratingCount: row.role === ROLES.OWNER ? Number(row.rating_count ?? 0) : null,
  };
}

function buildFilters(filters) {
  const conditions = [];
  const values = [];

  const textFilters = [
    ['u.name', filters.name],
    ['u.email', filters.email],
    ['u.address', filters.address],
  ];

  for (const [column, rawValue] of textFilters) {
    const value = String(rawValue ?? '').trim();
    if (value) {
      values.push(`%${value}%`);
      conditions.push(`${column} ILIKE $${values.length}`);
    }
  }

  const role = String(filters.role ?? '').trim();
  if (role && Object.values(ROLES).includes(role)) {
    values.push(role);
    conditions.push(`u.role = $${values.length}`);
  }

  return {
    clause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
}

export async function listUsers(queryParams) {
  const pagination = resolvePagination(queryParams);
  const sort = resolveSort(queryParams, SORTABLE_COLUMNS, 'name');
  const { clause, values } = buildFilters(queryParams);

  const totalResult = await query(`SELECT COUNT(*)::int AS total FROM users u ${clause}`, values);

  const rowsResult = await query(
    `SELECT u.id, u.name, u.email, u.address, u.role,
            owner_stats.average_rating, owner_stats.rating_count, owner_stats.store_count
     FROM users u
     ${OWNER_STATS_JOIN}
     ${clause}
     ORDER BY ${sort.column} ${sort.order} NULLS LAST, u.id ASC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, pagination.limit, pagination.offset],
  );

  return {
    data: rowsResult.rows.map(mapUser),
    meta: buildMeta(pagination, totalResult.rows[0].total),
    sort: { sortBy: sort.key, order: sort.order.toLowerCase() },
  };
}

export async function getUserById(id) {
  const { rows } = await query(
    `SELECT u.id, u.name, u.email, u.address, u.role,
            owner_stats.average_rating, owner_stats.rating_count, owner_stats.store_count
     FROM users u
     ${OWNER_STATS_JOIN}
     WHERE u.id = $1`,
    [id],
  );

  if (rows.length === 0) {
    throw ApiError.notFound('User not found');
  }

  const user = mapUser(rows[0]);

  if (user.role === ROLES.OWNER) {
    const stores = await query(
      `SELECT s.id, s.name, s.email, s.address,
              COALESCE(ROUND(AVG(r.score)::numeric, 2), 0) AS average_rating,
              COUNT(r.id)::int AS rating_count
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1
       GROUP BY s.id
       ORDER BY s.name ASC`,
      [id],
    );
    user.stores = stores.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      averageRating: Number(row.average_rating),
      ratingCount: row.rating_count,
    }));
  }

  return user;
}

export async function createUser({ name, email, address, password, role }) {
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role`,
    [name, email, passwordHash, address, role],
  );
  return mapUser(rows[0]);
}

export async function listOwnerCandidates() {
  const { rows } = await query(
    `SELECT u.id, u.name, u.email
     FROM users u
     WHERE u.role = $1
     ORDER BY u.name ASC`,
    [ROLES.OWNER],
  );
  return rows;
}

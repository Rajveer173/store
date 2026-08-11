import { ROLES } from '../config/env.js';
import { query } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { resolvePagination, resolveSort, buildMeta } from '../utils/pagination.js';

const ADMIN_SORTABLE_COLUMNS = {
  name: 's.name',
  email: 's.email',
  address: 's.address',
  owner: 'o.name',
  rating: 'summary.average_rating',
};

const PUBLIC_SORTABLE_COLUMNS = {
  name: 's.name',
  address: 's.address',
  rating: 'summary.average_rating',
  userRating: 'user_rating.score',
};

const SUMMARY_JOIN = `
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(ROUND(AVG(r.score)::numeric, 2), 0) AS average_rating,
      COUNT(r.id)::int                             AS rating_count
    FROM ratings r
    WHERE r.store_id = s.id
  ) summary ON TRUE
`;

function buildTextFilters(filters, columns, startIndex = 0) {
  const conditions = [];
  const values = [];

  for (const [column, rawValue] of columns) {
    const value = String(filters[rawValue] ?? '').trim();
    if (value) {
      values.push(`%${value}%`);
      conditions.push(`${column} ILIKE $${startIndex + values.length}`);
    }
  }

  return { conditions, values };
}

export async function listStoresForAdmin(queryParams) {
  const pagination = resolvePagination(queryParams);
  const sort = resolveSort(queryParams, ADMIN_SORTABLE_COLUMNS, 'name');
  const { conditions, values } = buildTextFilters(queryParams, [
    ['s.name', 'name'],
    ['s.email', 'email'],
    ['s.address', 'address'],
  ]);

  const clause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalResult = await query(`SELECT COUNT(*)::int AS total FROM stores s ${clause}`, values);

  const rowsResult = await query(
    `SELECT s.id, s.name, s.email, s.address,
            o.id AS owner_id, o.name AS owner_name, o.email AS owner_email,
            summary.average_rating, summary.rating_count
     FROM stores s
     LEFT JOIN users o ON o.id = s.owner_id
     ${SUMMARY_JOIN}
     ${clause}
     ORDER BY ${sort.column} ${sort.order} NULLS LAST, s.id ASC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, pagination.limit, pagination.offset],
  );

  return {
    data: rowsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      averageRating: Number(row.average_rating),
      ratingCount: row.rating_count,
      owner: row.owner_id ? { id: row.owner_id, name: row.owner_name, email: row.owner_email } : null,
    })),
    meta: buildMeta(pagination, totalResult.rows[0].total),
    sort: { sortBy: sort.key, order: sort.order.toLowerCase() },
  };
}

export async function listStoresForUser(userId, queryParams) {
  const pagination = resolvePagination(queryParams);
  const sort = resolveSort(queryParams, PUBLIC_SORTABLE_COLUMNS, 'name');

  const filterColumns = [
    ['s.name', 'name'],
    ['s.address', 'address'],
  ];

  const countFilters = buildTextFilters(queryParams, filterColumns, 0);
  const countClause = countFilters.conditions.length
    ? `WHERE ${countFilters.conditions.join(' AND ')}`
    : '';

  const listFilters = buildTextFilters(queryParams, filterColumns, 1);
  const clause = listFilters.conditions.length
    ? `WHERE ${listFilters.conditions.join(' AND ')}`
    : '';
  const values = [userId, ...listFilters.values];

  const totalResult = await query(
    `SELECT COUNT(*)::int AS total FROM stores s ${countClause}`,
    countFilters.values,
  );

  const rowsResult = await query(
    `SELECT s.id, s.name, s.address, s.email,
            summary.average_rating, summary.rating_count,
            user_rating.score AS user_score
     FROM stores s
     ${SUMMARY_JOIN}
     LEFT JOIN LATERAL (
       SELECT r.score FROM ratings r WHERE r.store_id = s.id AND r.user_id = $1
     ) user_rating ON TRUE
     ${clause}
     ORDER BY ${sort.column} ${sort.order} NULLS LAST, s.id ASC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, pagination.limit, pagination.offset],
  );

  return {
    data: rowsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      averageRating: Number(row.average_rating),
      ratingCount: row.rating_count,
      userRating: row.user_score === null ? null : Number(row.user_score),
    })),
    meta: buildMeta(pagination, totalResult.rows[0].total),
    sort: { sortBy: sort.key, order: sort.order.toLowerCase() },
  };
}

export async function createStore({ name, email, address, ownerId }) {
  if (ownerId) {
    const owner = await query('SELECT id, role FROM users WHERE id = $1', [ownerId]);
    if (owner.rows.length === 0) {
      throw ApiError.badRequest('Validation failed', { ownerId: 'Selected owner does not exist' });
    }
    if (owner.rows[0].role !== ROLES.OWNER) {
      throw ApiError.badRequest('Validation failed', {
        ownerId: 'Selected user is not a store owner',
      });
    }
  }

  const { rows } = await query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, address, owner_id`,
    [name, email, address, ownerId ?? null],
  );

  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    address: rows[0].address,
    ownerId: rows[0].owner_id,
    averageRating: 0,
    ratingCount: 0,
  };
}

export async function upsertRating(userId, storeId, score) {
  const store = await query('SELECT id FROM stores WHERE id = $1', [storeId]);
  if (store.rows.length === 0) {
    throw ApiError.notFound('Store not found');
  }

  const { rows } = await query(
    `INSERT INTO ratings (user_id, store_id, score)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, store_id) DO UPDATE SET score = EXCLUDED.score
     RETURNING score`,
    [userId, storeId, score],
  );

  const summary = await query(
    `SELECT COALESCE(ROUND(AVG(score)::numeric, 2), 0) AS average_rating,
            COUNT(*)::int AS rating_count
     FROM ratings WHERE store_id = $1`,
    [storeId],
  );

  return {
    storeId,
    userRating: Number(rows[0].score),
    averageRating: Number(summary.rows[0].average_rating),
    ratingCount: summary.rows[0].rating_count,
  };
}

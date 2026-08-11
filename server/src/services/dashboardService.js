import { ROLES } from '../config/env.js';
import { query } from '../db/index.js';
import { resolvePagination, resolveSort, buildMeta } from '../utils/pagination.js';

const RATER_SORTABLE_COLUMNS = {
  name: 'u.name',
  email: 'u.email',
  address: 'u.address',
  store: 's.name',
  rating: 'r.score',
  ratedAt: 'r.updated_at',
};

export async function getAdminOverview() {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*)::int FROM users)                         AS total_users,
       (SELECT COUNT(*)::int FROM stores)                        AS total_stores,
       (SELECT COUNT(*)::int FROM ratings)                       AS total_ratings,
       (SELECT COUNT(*)::int FROM users WHERE role = $1)         AS total_admins,
       (SELECT COUNT(*)::int FROM users WHERE role = $2)         AS total_normal_users,
       (SELECT COUNT(*)::int FROM users WHERE role = $3)         AS total_store_owners,
       (SELECT COALESCE(ROUND(AVG(score)::numeric, 2), 0) FROM ratings) AS platform_average`,
    [ROLES.ADMIN, ROLES.USER, ROLES.OWNER],
  );

  const summary = rows[0];

  const topStores = await query(
    `SELECT s.id, s.name,
            COALESCE(ROUND(AVG(r.score)::numeric, 2), 0) AS average_rating,
            COUNT(r.id)::int AS rating_count
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     GROUP BY s.id
     HAVING COUNT(r.id) > 0
     ORDER BY average_rating DESC, rating_count DESC
     LIMIT 5`,
  );

  const distribution = await query(
    `SELECT score, COUNT(*)::int AS count
     FROM ratings
     GROUP BY score
     ORDER BY score ASC`,
  );

  const distributionMap = new Map(distribution.rows.map((row) => [Number(row.score), row.count]));

  return {
    totalUsers: summary.total_users,
    totalStores: summary.total_stores,
    totalRatings: summary.total_ratings,
    totalAdmins: summary.total_admins,
    totalNormalUsers: summary.total_normal_users,
    totalStoreOwners: summary.total_store_owners,
    platformAverage: Number(summary.platform_average),
    topStores: topStores.rows.map((row) => ({
      id: row.id,
      name: row.name,
      averageRating: Number(row.average_rating),
      ratingCount: row.rating_count,
    })),
    ratingDistribution: [1, 2, 3, 4, 5].map((score) => ({
      score,
      count: distributionMap.get(score) ?? 0,
    })),
  };
}

export async function getOwnerOverview(ownerId) {
  const stores = await query(
    `SELECT s.id, s.name, s.email, s.address,
            COALESCE(ROUND(AVG(r.score)::numeric, 2), 0) AS average_rating,
            COUNT(r.id)::int AS rating_count
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = $1
     GROUP BY s.id
     ORDER BY s.name ASC`,
    [ownerId],
  );

  const totals = await query(
    `SELECT COALESCE(ROUND(AVG(r.score)::numeric, 2), 0) AS average_rating,
            COUNT(r.id)::int AS rating_count
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = $1`,
    [ownerId],
  );

  const distribution = await query(
    `SELECT r.score, COUNT(*)::int AS count
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     WHERE s.owner_id = $1
     GROUP BY r.score`,
    [ownerId],
  );

  const distributionMap = new Map(distribution.rows.map((row) => [Number(row.score), row.count]));

  return {
    averageRating: Number(totals.rows[0].average_rating),
    totalRatings: totals.rows[0].rating_count,
    totalStores: stores.rowCount,
    stores: stores.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      averageRating: Number(row.average_rating),
      ratingCount: row.rating_count,
    })),
    ratingDistribution: [1, 2, 3, 4, 5].map((score) => ({
      score,
      count: distributionMap.get(score) ?? 0,
    })),
  };
}

export async function listOwnerRaters(ownerId, queryParams) {
  const pagination = resolvePagination(queryParams);
  const sort = resolveSort(queryParams, RATER_SORTABLE_COLUMNS, 'ratedAt');

  const values = [ownerId];
  const conditions = ['s.owner_id = $1'];

  const search = String(queryParams.name ?? '').trim();
  if (search) {
    values.push(`%${search}%`);
    conditions.push(`u.name ILIKE $${values.length}`);
  }

  const email = String(queryParams.email ?? '').trim();
  if (email) {
    values.push(`%${email}%`);
    conditions.push(`u.email ILIKE $${values.length}`);
  }

  const storeId = Number.parseInt(queryParams.storeId, 10);
  if (Number.isInteger(storeId) && storeId > 0) {
    values.push(storeId);
    conditions.push(`s.id = $${values.length}`);
  }

  const clause = `WHERE ${conditions.join(' AND ')}`;

  const totalResult = await query(
    `SELECT COUNT(*)::int AS total
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     JOIN users u ON u.id = r.user_id
     ${clause}`,
    values,
  );

  const rowsResult = await query(
    `SELECT r.id, r.score, r.updated_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email, u.address AS user_address,
            s.id AS store_id, s.name AS store_name
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     JOIN users u ON u.id = r.user_id
     ${clause}
     ORDER BY ${sort.column} ${sort.order} NULLS LAST, r.id DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, pagination.limit, pagination.offset],
  );

  return {
    data: rowsResult.rows.map((row) => ({
      id: row.id,
      score: Number(row.score),
      ratedAt: row.updated_at,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        address: row.user_address,
      },
      store: { id: row.store_id, name: row.store_name },
    })),
    meta: buildMeta(pagination, totalResult.rows[0].total),
    sort: { sortBy: sort.key, order: sort.order.toLowerCase() },
  };
}

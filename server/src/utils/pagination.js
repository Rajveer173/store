const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export function resolvePagination(queryParams) {
  const page = Math.max(DEFAULT_PAGE, Number.parseInt(queryParams.page, 10) || DEFAULT_PAGE);
  const requestedLimit = Number.parseInt(queryParams.limit, 10) || DEFAULT_LIMIT;
  const limit = Math.min(MAX_LIMIT, Math.max(1, requestedLimit));
  return { page, limit, offset: (page - 1) * limit };
}

export function resolveSort(queryParams, allowedColumns, fallbackKey) {
  const requestedKey = String(queryParams.sortBy ?? fallbackKey);
  const key = Object.prototype.hasOwnProperty.call(allowedColumns, requestedKey)
    ? requestedKey
    : fallbackKey;
  const order = String(queryParams.order ?? 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return { key, column: allowedColumns[key], order };
}

export function buildMeta({ page, limit }, totalItems) {
  const total = Number(totalItems);
  return {
    page,
    limit,
    totalItems: total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

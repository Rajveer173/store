import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, extractError } from '../api/client';

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useTableData(endpoint, options = {}) {
  const { initialFilters = {}, initialSortBy = 'name', initialOrder = 'asc', limit = 10 } = options;

  const initialFiltersRef = useRef(initialFilters);
  const [filters, setFilters] = useState(initialFiltersRef.current);
  const [sort, setSort] = useState({ sortBy: initialSortBy, order: initialOrder });
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedFilters = useDebouncedValue(filters);
  const serialisedFilters = JSON.stringify(debouncedFilters);

  useEffect(() => {
    setPage(1);
  }, [serialisedFilters]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError('');

      try {
        const params = { page, limit, sortBy: sort.sortBy, order: sort.order };
        for (const [key, value] of Object.entries(JSON.parse(serialisedFilters))) {
          if (value !== '' && value !== null && value !== undefined) {
            params[key] = value;
          }
        }

        const { data } = await api.get(endpoint, { params, signal: controller.signal });
        setRows(data.data ?? []);
        setMeta(data.meta ?? null);
      } catch (requestError) {
        if (requestError.name === 'CanceledError') return;
        setError(extractError(requestError).message);
        setRows([]);
        setMeta(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => controller.abort();
  }, [endpoint, page, limit, sort.sortBy, sort.order, serialisedFilters, reloadToken]);

  const setFilter = useCallback((key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFiltersRef.current);
  }, []);

  const changeSort = useCallback((sortBy, order) => {
    setSort({ sortBy, order });
    setPage(1);
  }, []);

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  const isFiltered = useMemo(
    () => Object.entries(filters).some(([key, value]) => value !== initialFiltersRef.current[key]),
    [filters],
  );

  return {
    rows,
    setRows,
    meta,
    loading,
    error,
    filters,
    setFilter,
    resetFilters,
    isFiltered,
    sort,
    changeSort,
    page,
    setPage,
    refresh,
  };
}

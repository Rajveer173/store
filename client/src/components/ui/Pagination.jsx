function buildPageList(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  return [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
    .reduce((accumulator, page, index, list) => {
      if (index > 0 && page - list[index - 1] > 1) {
        accumulator.push('gap');
      }
      accumulator.push(page);
      return accumulator;
    }, []);
}

export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalItems === 0) {
    return null;
  }

  const { page, limit, totalItems, totalPages } = meta;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalItems);

  return (
    <div className="pagination">
      <span className="pagination-summary">
        Showing {start} to {end} of {totalItems} {totalItems === 1 ? 'record' : 'records'}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          className="page-button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>
        {buildPageList(page, totalPages).map((entry, index) =>
          entry === 'gap' ? (
            <span key={`gap-${index}`} className="pagination-summary">
              ...
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              className={`page-button${entry === page ? ' active' : ''}`}
              onClick={() => onPageChange(entry)}
            >
              {entry}
            </button>
          ),
        )}
        <button
          type="button"
          className="page-button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

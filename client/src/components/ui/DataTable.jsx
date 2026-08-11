import { EmptyState, LoadingBlock } from './Primitives';

function SortIndicator({ active, order }) {
  if (!active) {
    return <span className="sort-indicator">&#9650;&#9660;</span>;
  }
  return <span className="sort-indicator active">{order === 'asc' ? '▲' : '▼'}</span>;
}

export function DataTable({
  columns,
  rows,
  loading,
  sortBy,
  order,
  onSortChange,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or search terms.',
  getRowKey = (row) => row.id,
}) {
  if (loading) {
    return <LoadingBlock label="Loading records" />;
  }

  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const handleSort = (key) => {
    if (!onSortChange) return;
    const nextOrder = sortBy === key && order === 'asc' ? 'desc' : 'asc';
    onSortChange(key, nextOrder);
  };

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={column.width ? { width: column.width } : undefined}>
                {column.sortable ? (
                  <button
                    type="button"
                    className="table-sort-button"
                    onClick={() => handleSort(column.sortKey ?? column.key)}
                    aria-label={`Sort by ${column.header}`}
                  >
                    {column.header}
                    <SortIndicator
                      active={sortBy === (column.sortKey ?? column.key)}
                      order={order}
                    />
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

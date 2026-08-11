import { useTableData } from '../../hooks/useTableData';
import { DataTable } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { TextField } from '../../components/ui/Field';
import { Alert, Badge, Button, Card, CardBody } from '../../components/ui/Primitives';
import { formatDateTime } from '../../utils/format';

const INITIAL_FILTERS = { name: '', email: '' };

export function OwnerRatingsPage() {
  const table = useTableData('/owner/raters', {
    initialFilters: INITIAL_FILTERS,
    initialSortBy: 'ratedAt',
    initialOrder: 'desc',
  });

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      render: (row) => <span className="cell-primary">{row.user.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (row) => <span className="cell-muted">{row.user.email}</span>,
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      render: (row) => (
        <span className="cell-muted cell-truncate" title={row.user.address}>
          {row.user.address}
        </span>
      ),
    },
    {
      key: 'store',
      header: 'Store',
      sortable: true,
      render: (row) => <span>{row.store.name}</span>,
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      render: (row) => <Badge variant="primary">{row.score} out of 5</Badge>,
    },
    {
      key: 'ratedAt',
      header: 'Submitted',
      sortable: true,
      render: (row) => <span className="cell-muted">{formatDateTime(row.ratedAt)}</span>,
    },
  ];

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer ratings</h1>
          <p className="page-subtitle">
            Every rating submitted for your stores, with the customer who left it.
          </p>
        </div>
      </div>

      <Alert variant="error">{table.error}</Alert>

      <Card>
        <div className="filter-bar">
          <TextField
            label="Customer name"
            value={table.filters.name}
            onChange={(value) => table.setFilter('name', value)}
            placeholder="Search by name"
          />
          <TextField
            label="Customer email"
            value={table.filters.email}
            onChange={(value) => table.setFilter('email', value)}
            placeholder="Search by email"
          />
          <div className="filter-actions">
            <Button variant="secondary" onClick={table.resetFilters} disabled={!table.isFiltered}>
              Reset filters
            </Button>
          </div>
        </div>

        <CardBody tight>
          <DataTable
            columns={columns}
            rows={table.rows}
            loading={table.loading}
            sortBy={table.sort.sortBy}
            order={table.sort.order}
            onSortChange={table.changeSort}
            emptyTitle="No ratings yet"
            emptyDescription="Ratings appear here as soon as customers submit them."
          />
        </CardBody>

        <Pagination meta={table.meta} onPageChange={table.setPage} />
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { useTableData } from '../../hooks/useTableData';
import { DataTable } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { TextField } from '../../components/ui/Field';
import { Alert, Button, Card, CardBody } from '../../components/ui/Primitives';
import { RatingDisplay } from '../../components/ui/Rating';
import { AddStoreModal } from './AddStoreModal';

const INITIAL_FILTERS = { name: '', email: '', address: '' };

export function AdminStoresPage() {
  const table = useTableData('/admin/stores', { initialFilters: INITIAL_FILTERS });
  const [addOpen, setAddOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (row) => <span className="cell-primary">{row.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (row) => <span className="cell-muted">{row.email}</span>,
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      render: (row) => (
        <span className="cell-muted cell-truncate" title={row.address}>
          {row.address}
        </span>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      sortable: true,
      render: (row) =>
        row.owner ? (
          <span>{row.owner.name}</span>
        ) : (
          <span className="cell-muted">Not assigned</span>
        ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      render: (row) => <RatingDisplay value={row.averageRating} count={row.ratingCount} />,
    },
  ];

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores</h1>
          <p className="page-subtitle">
            Every store registered on the platform with its current average rating.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>Add store</Button>
      </div>

      <Alert variant="success">{notice}</Alert>
      <Alert variant="error">{table.error}</Alert>

      <Card>
        <div className="filter-bar">
          <TextField
            label="Name"
            value={table.filters.name}
            onChange={(value) => table.setFilter('name', value)}
            placeholder="Search by store name"
          />
          <TextField
            label="Email"
            value={table.filters.email}
            onChange={(value) => table.setFilter('email', value)}
            placeholder="Search by email"
          />
          <TextField
            label="Address"
            value={table.filters.address}
            onChange={(value) => table.setFilter('address', value)}
            placeholder="Search by address"
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
            emptyTitle="No stores found"
            emptyDescription="Adjust the filters above or register a new store."
          />
        </CardBody>

        <Pagination meta={table.meta} onPageChange={table.setPage} />
      </Card>

      <AddStoreModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(store) => {
          setAddOpen(false);
          setNotice(`${store.name} has been registered.`);
          table.refresh();
        }}
      />
    </div>
  );
}

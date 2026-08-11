import { useState } from 'react';
import { useTableData } from '../../hooks/useTableData';
import { DataTable } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { SelectField, TextField } from '../../components/ui/Field';
import { Alert, Badge, Button, Card, CardBody, CardHeader } from '../../components/ui/Primitives';
import { ROLES, ROLE_BADGE_VARIANT, ROLE_LABELS } from '../../constants/roles';
import { formatRating } from '../../utils/format';
import { AddUserModal } from './AddUserModal';
import { UserDetailModal } from './UserDetailModal';

const INITIAL_FILTERS = { name: '', email: '', address: '', role: '' };

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: ROLES.ADMIN, label: ROLE_LABELS[ROLES.ADMIN] },
  { value: ROLES.USER, label: ROLE_LABELS[ROLES.USER] },
  { value: ROLES.OWNER, label: ROLE_LABELS[ROLES.OWNER] },
];

export function AdminUsersPage() {
  const table = useTableData('/admin/users', { initialFilters: INITIAL_FILTERS });
  const [addOpen, setAddOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
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
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (row) => <Badge variant={ROLE_BADGE_VARIANT[row.role]}>{ROLE_LABELS[row.role]}</Badge>,
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      render: (row) =>
        row.role === ROLES.OWNER ? (
          <span className="rating-value">{formatRating(row.rating)}</span>
        ) : (
          <span className="cell-muted">-</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button variant="secondary" size="sm" onClick={() => setSelectedUserId(row.id)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">
            Manage administrators, customers and store owners registered on the platform.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>Add user</Button>
      </div>

      <Alert variant="success">{notice}</Alert>
      <Alert variant="error">{table.error}</Alert>

      <Card>
        <div className="filter-bar">
          <TextField
            label="Name"
            value={table.filters.name}
            onChange={(value) => table.setFilter('name', value)}
            placeholder="Search by name"
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
          <SelectField
            label="Role"
            value={table.filters.role}
            onChange={(value) => table.setFilter('role', value)}
            options={ROLE_OPTIONS}
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
            emptyTitle="No users found"
            emptyDescription="Adjust the filters above or add a new user."
          />
        </CardBody>

        <Pagination meta={table.meta} onPageChange={table.setPage} />
      </Card>

      <AddUserModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(user) => {
          setAddOpen(false);
          setNotice(`${user.name} has been added as a ${ROLE_LABELS[user.role].toLowerCase()}.`);
          table.refresh();
        }}
      />

      <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
}

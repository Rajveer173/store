import { useState } from 'react';
import { api, extractError } from '../../api/client';
import { useTableData } from '../../hooks/useTableData';
import { DataTable } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { TextField } from '../../components/ui/Field';
import { Alert, Badge, Button, Card, CardBody } from '../../components/ui/Primitives';
import { RatingDisplay, RatingInput } from '../../components/ui/Rating';
import { Modal } from '../../components/ui/Modal';

const INITIAL_FILTERS = { name: '', address: '' };

export function StoreListPage() {
  const table = useTableData('/stores', { initialFilters: INITIAL_FILTERS });
  const [activeStore, setActiveStore] = useState(null);
  const [selectedScore, setSelectedScore] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [notice, setNotice] = useState('');

  const openRatingModal = (store) => {
    setActiveStore(store);
    setSelectedScore(store.userRating ?? null);
    setModalError('');
  };

  const closeRatingModal = () => {
    setActiveStore(null);
    setSelectedScore(null);
    setModalError('');
  };

  const submitRating = async () => {
    if (!selectedScore) {
      setModalError('Select a rating between 1 and 5 before submitting.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      const { data } = await api.put(`/stores/${activeStore.id}/rating`, { score: selectedScore });
      table.setRows((previous) =>
        previous.map((store) =>
          store.id === data.storeId
            ? {
                ...store,
                userRating: data.userRating,
                averageRating: data.averageRating,
                ratingCount: data.ratingCount,
              }
            : store,
        ),
      );
      setNotice(
        `Your rating of ${data.userRating} for ${activeStore.name} has been ${
          activeStore.userRating ? 'updated' : 'submitted'
        }.`,
      );
      closeRatingModal();
    } catch (error) {
      setModalError(extractError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Store name',
      sortable: true,
      render: (row) => <span className="cell-primary">{row.name}</span>,
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
      key: 'rating',
      header: 'Overall rating',
      sortable: true,
      render: (row) => <RatingDisplay value={row.averageRating} count={row.ratingCount} />,
    },
    {
      key: 'userRating',
      header: 'Your rating',
      sortable: true,
      render: (row) =>
        row.userRating ? (
          <Badge variant="primary">{row.userRating} out of 5</Badge>
        ) : (
          <span className="cell-muted">Not rated</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button variant={row.userRating ? 'secondary' : 'primary'} size="sm" onClick={() => openRatingModal(row)}>
          {row.userRating ? 'Modify rating' : 'Submit rating'}
        </Button>
      ),
    },
  ];

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Registered stores</h1>
          <p className="page-subtitle">
            Search the directory and rate the stores you have visited.
          </p>
        </div>
      </div>

      <Alert variant="success">{notice}</Alert>
      <Alert variant="error">{table.error}</Alert>

      <Card>
        <div className="filter-bar">
          <TextField
            label="Store name"
            value={table.filters.name}
            onChange={(value) => table.setFilter('name', value)}
            placeholder="Search by name"
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
            emptyDescription="Try a different name or address."
          />
        </CardBody>

        <Pagination meta={table.meta} onPageChange={table.setPage} />
      </Card>

      <Modal
        open={Boolean(activeStore)}
        title={activeStore?.userRating ? 'Modify your rating' : 'Submit a rating'}
        description={activeStore?.name}
        onClose={closeRatingModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeRatingModal} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submitRating} loading={submitting}>
              {activeStore?.userRating ? 'Update rating' : 'Submit rating'}
            </Button>
          </>
        }
      >
        <Alert variant="error">{modalError}</Alert>

        <div className="stack">
          <div>
            <p className="detail-label">Store address</p>
            <p className="detail-value">{activeStore?.address}</p>
          </div>

          <div>
            <p className="detail-label">Current overall rating</p>
            <div className="detail-value">
              <RatingDisplay
                value={activeStore?.averageRating ?? 0}
                count={activeStore?.ratingCount ?? 0}
              />
            </div>
          </div>

          <div>
            <p className="detail-label">Your rating</p>
            <div className="detail-value">
              <RatingInput
                value={selectedScore}
                onSelect={setSelectedScore}
                disabled={submitting}
                name="Store rating"
              />
              <p className="field-hint" style={{ marginTop: 8 }}>
                Select a score from 1 (poor) to 5 (excellent).
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

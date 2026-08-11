import { useEffect, useState } from 'react';
import { api, extractError } from '../../api/client';
import {
  Alert,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  LoadingBlock,
  StatCard,
} from '../../components/ui/Primitives';
import { RatingDisplay, RatingDistribution } from '../../components/ui/Rating';
import { formatRating } from '../../utils/format';

export function OwnerDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    api
      .get('/owner/dashboard')
      .then(({ data }) => {
        if (!cancelled) setOverview(data);
      })
      .catch((requestError) => {
        if (!cancelled) setError(extractError(requestError).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingBlock label="Loading dashboard" />;
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Performance summary for the stores registered under your account.
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Average rating"
          value={formatRating(overview.averageRating)}
          hint="Across all of your stores"
        />
        <StatCard
          label="Total ratings"
          value={overview.totalRatings}
          hint="Ratings received from customers"
        />
        <StatCard
          label="Stores"
          value={overview.totalStores}
          hint="Stores assigned to your account"
        />
      </div>

      <div className="grid-2">
        <Card>
          <CardHeader title="Your stores" description="Average rating per registered store." />
          <CardBody tight>
            {overview.stores.length === 0 ? (
              <EmptyState
                title="No stores assigned"
                description="An administrator has not linked a store to your account yet."
              />
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Address</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.stores.map((store) => (
                      <tr key={store.id}>
                        <td className="cell-primary">{store.name}</td>
                        <td className="cell-muted cell-truncate" title={store.address}>
                          {store.address}
                        </td>
                        <td>
                          <RatingDisplay
                            value={store.averageRating}
                            count={store.ratingCount}
                            showBar={false}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Rating distribution"
            description="How your customers scored your stores."
          />
          <CardBody>
            <RatingDistribution distribution={overview.ratingDistribution} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

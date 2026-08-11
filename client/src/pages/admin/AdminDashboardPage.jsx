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

export function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data } = await api.get('/admin/dashboard');
        if (!cancelled) setOverview(data);
      } catch (requestError) {
        if (!cancelled) setError(extractError(requestError).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
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
            Platform activity across users, stores and submitted ratings.
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Total users"
          value={overview.totalUsers}
          hint={`${overview.totalNormalUsers} customers, ${overview.totalStoreOwners} owners, ${overview.totalAdmins} admins`}
        />
        <StatCard
          label="Total stores"
          value={overview.totalStores}
          hint="Stores registered on the platform"
        />
        <StatCard
          label="Total ratings"
          value={overview.totalRatings}
          hint="Ratings submitted by customers"
        />
        <StatCard
          label="Platform average"
          value={formatRating(overview.platformAverage)}
          hint="Mean score across all ratings"
        />
      </div>

      <div className="grid-2">
        <Card>
          <CardHeader
            title="Highest rated stores"
            description="Top five stores by average rating."
          />
          <CardBody tight>
            {overview.topStores.length === 0 ? (
              <EmptyState
                title="No ratings yet"
                description="Store rankings appear once customers start submitting ratings."
              />
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.topStores.map((store) => (
                      <tr key={store.id}>
                        <td className="cell-primary">{store.name}</td>
                        <td>
                          <RatingDisplay value={store.averageRating} count={store.ratingCount} />
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
            description="How scores are spread across the platform."
          />
          <CardBody>
            <RatingDistribution distribution={overview.ratingDistribution} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

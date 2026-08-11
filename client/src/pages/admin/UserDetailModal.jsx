import { useEffect, useState } from 'react';
import { api, extractError } from '../../api/client';
import { Modal } from '../../components/ui/Modal';
import { Alert, Badge, Button, LoadingBlock } from '../../components/ui/Primitives';
import { RatingDisplay } from '../../components/ui/Rating';
import { ROLES, ROLE_BADGE_VARIANT, ROLE_LABELS } from '../../constants/roles';
import { formatRating } from '../../utils/format';

function DetailItem({ label, children }) {
  return (
    <div>
      <p className="detail-label">{label}</p>
      <div className="detail-value">{children}</div>
    </div>
  );
}

export function UserDetailModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .get(`/admin/users/${userId}`)
      .then(({ data }) => {
        if (!cancelled) setUser(data);
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
  }, [userId]);

  return (
    <Modal
      open={Boolean(userId)}
      title="User details"
      description="Full profile information for the selected account."
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {loading ? <LoadingBlock label="Loading user" /> : null}
      <Alert variant="error">{error}</Alert>

      {user && !loading ? (
        <div className="stack">
          <div className="detail-grid">
            <DetailItem label="Name">{user.name}</DetailItem>
            <DetailItem label="Email">{user.email}</DetailItem>
            <DetailItem label="Role">
              <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{ROLE_LABELS[user.role]}</Badge>
            </DetailItem>
            {user.role === ROLES.OWNER ? (
              <DetailItem label="Average rating">
                <RatingDisplay value={user.rating} count={user.ratingCount ?? 0} />
              </DetailItem>
            ) : null}
          </div>

          <DetailItem label="Address">{user.address}</DetailItem>

          {user.role === ROLES.OWNER ? (
            <div>
              <p className="detail-label" style={{ marginBottom: 8 }}>
                Owned stores ({user.stores?.length ?? 0})
              </p>
              {user.stores?.length ? (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Store</th>
                        <th>Rating</th>
                        <th>Ratings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.stores.map((store) => (
                        <tr key={store.id}>
                          <td className="cell-primary">{store.name}</td>
                          <td className="rating-value">{formatRating(store.averageRating)}</td>
                          <td className="cell-muted">{store.ratingCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="cell-muted">This owner has no stores assigned yet.</p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}

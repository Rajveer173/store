import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME_PATH } from '../constants/roles';

export function NotFoundPage() {
  const { user } = useAuth();
  const target = user ? (ROLE_HOME_PATH[user.role] ?? '/login') : '/login';

  return (
    <div className="not-found">
      <div>
        <h1 className="page-title">Page not found</h1>
        <p className="page-subtitle" style={{ marginBottom: 20 }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to={target}>Return to your dashboard</Link>
      </div>
    </div>
  );
}

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME_PATH } from '../constants/roles';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, initialising } = useAuth();
  const location = useLocation();

  if (initialising) {
    return (
      <div className="loading-block" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <span className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME_PATH[user.role] ?? '/login'} replace />;
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { user, initialising } = useAuth();

  if (initialising) {
    return (
      <div className="loading-block" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <span className="spinner" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={ROLE_HOME_PATH[user.role] ?? '/login'} replace />;
  }

  return children;
}

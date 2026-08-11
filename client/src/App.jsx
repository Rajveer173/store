import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './routes/ProtectedRoute';
import { ROLES } from './constants/roles';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminStoresPage } from './pages/admin/AdminStoresPage';
import { StoreListPage } from './pages/user/StoreListPage';
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage';
import { OwnerRatingsPage } from './pages/owner/OwnerRatingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuth } from './context/AuthContext';
import { ROLE_HOME_PATH } from './constants/roles';

function RootRedirect() {
  const { user, initialising } = useAuth();

  if (initialising) {
    return (
      <div className="loading-block" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <span className="spinner" />
      </div>
    );
  }

  return <Navigate to={user ? (ROLE_HOME_PATH[user.role] ?? '/login') : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminStoresPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stores"
          element={
            <ProtectedRoute allowedRoles={[ROLES.USER]}>
              <StoreListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
              <OwnerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/ratings"
          element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
              <OwnerRatingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/account/password" element={<ChangePasswordPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

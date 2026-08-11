import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import { getInitials } from '../../utils/format';
import { Button } from '../ui/Primitives';

const NAV_ITEMS = {
  [ROLES.ADMIN]: [
    { section: 'Overview', items: [{ to: '/admin/dashboard', label: 'Dashboard' }] },
    {
      section: 'Management',
      items: [
        { to: '/admin/stores', label: 'Stores' },
        { to: '/admin/users', label: 'Users' },
      ],
    },
    { section: 'Account', items: [{ to: '/account/password', label: 'Change Password' }] },
  ],
  [ROLES.USER]: [
    { section: 'Browse', items: [{ to: '/stores', label: 'Stores' }] },
    { section: 'Account', items: [{ to: '/account/password', label: 'Change Password' }] },
  ],
  [ROLES.OWNER]: [
    { section: 'Overview', items: [{ to: '/owner/dashboard', label: 'Dashboard' }] },
    { section: 'Feedback', items: [{ to: '/owner/ratings', label: 'Customer Ratings' }] },
    { section: 'Account', items: [{ to: '/account/password', label: 'Change Password' }] },
  ],
};

const PAGE_TITLES = {
  '/admin/dashboard': 'Administrator Dashboard',
  '/admin/stores': 'Store Management',
  '/admin/users': 'User Management',
  '/stores': 'Registered Stores',
  '/owner/dashboard': 'Store Owner Dashboard',
  '/owner/ratings': 'Customer Ratings',
  '/account/password': 'Change Password',
};

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const sections = NAV_ITEMS[user.role] ?? [];
  const title = PAGE_TITLES[location.pathname] ?? 'Store Ratings';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <p className="sidebar-brand-name">Store Ratings</p>
          <p className="sidebar-brand-role">{ROLE_LABELS[user.role]}</p>
        </div>

        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section.section}>
              <p className="sidebar-section-label">{section.section}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">Store Ratings Platform v1.0</div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <p className="topbar-title">{title}</p>
          <div className="topbar-actions">
            <div className="topbar-user">
              <p className="topbar-user-name">{user.name}</p>
              <p className="topbar-user-email">{user.email}</p>
            </div>
            <span className="avatar">{getInitials(user.name)}</span>
            <Button variant="secondary" size="sm" onClick={logout}>
              Log out
            </Button>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';
import { COLORS } from '../../styles/theme';

// Icons (you would need to install a library like react-icons)
// For now, let's create placeholders
const HomeIcon = () => <span>🏠</span>;
const MapIcon = () => <span>🗺️</span>;
const HistoryIcon = () => <span>📜</span>;
const ProfileIcon = () => <span>👤</span>;
const NotificationIcon = () => <span>🔔</span>;
const SettingsIcon = () => <span>⚙️</span>;
const LogoutIcon = () => <span>🚪</span>;
const MenuIcon = () => <span>☰</span>;

// Create a CSS file for MainLayout - this would typically be in a separate file
const styles = `
.sidebar {
  width: 250px;
  background-color: ${COLORS.card};
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: -250px;
  transition: left 0.3s ease;
  z-index: 1000;
}

.sidebar.open {
  left: 0;
}

@media (min-width: 768px) {
  .sidebar {
    left: 0;
    position: sticky;
  }
}

.main-content {
  flex: 1;
  margin-left: 0;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

@media (min-width: 768px) {
  .main-content {
    margin-left: 250px;
  }
}

.menu-button {
  background-color: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
}

@media (min-width: 768px) {
  .menu-button {
    display: none;
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 999;
}

@media (min-width: 768px) {
  .overlay {
    display: none;
  }
}
`;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notification);

  // Add the styles to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Helper function to safely get user initial
  const getUserInitial = () => {
    if (user && user.name && typeof user.name === 'string') {
      return user.name.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: COLORS.background,
      }}
    >
      {/* Sidebar - Desktop */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: `1px solid ${COLORS.border}` }}>
          <h1 style={{ fontSize: '1.5rem', margin: '0 0 1rem' }}>IShare</h1>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: COLORS.primary,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.5rem',
                }}
              >
                {getUserInitial()}
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>{user.name || 'User'}</div>
                <div style={{ fontSize: '0.875rem', color: COLORS.textSecondary }}>
                  {user.email || ''}
                </div>
              </div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '1rem 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
              <Link
                to="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  textDecoration: 'none',
                  color: isActive('/') ? COLORS.primary : COLORS.text,
                  backgroundColor: isActive('/') ? `${COLORS.primary}10` : 'transparent',
                  borderLeft: isActive('/') ? `4px solid ${COLORS.primary}` : '4px solid transparent',
                }}
                onClick={closeSidebar}
              >
                <HomeIcon />
                <span style={{ marginLeft: '0.75rem' }}>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/map"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  textDecoration: 'none',
                  color: isActive('/map') ? COLORS.primary : COLORS.text,
                  backgroundColor: isActive('/map') ? `${COLORS.primary}10` : 'transparent',
                  borderLeft: isActive('/map') ? `4px solid ${COLORS.primary}` : '4px solid transparent',
                }}
                onClick={closeSidebar}
              >
                <MapIcon />
                <span style={{ marginLeft: '0.75rem' }}>Map</span>
              </Link>
            </li>
            <li>
              <Link
                to="/ride-history"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  textDecoration: 'none',
                  color: isActive('/ride-history') ? COLORS.primary : COLORS.text,
                  backgroundColor: isActive('/ride-history') ? `${COLORS.primary}10` : 'transparent',
                  borderLeft: isActive('/ride-history') ? `4px solid ${COLORS.primary}` : '4px solid transparent',
                }}
                onClick={closeSidebar}
              >
                <HistoryIcon />
                <span style={{ marginLeft: '0.75rem' }}>Ride History</span>
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  textDecoration: 'none',
                  color: isActive('/profile') ? COLORS.primary : COLORS.text,
                  backgroundColor: isActive('/profile') ? `${COLORS.primary}10` : 'transparent',
                  borderLeft: isActive('/profile') ? `4px solid ${COLORS.primary}` : '4px solid transparent',
                }}
                onClick={closeSidebar}
              >
                <ProfileIcon />
                <span style={{ marginLeft: '0.75rem' }}>Profile</span>
              </Link>
            </li>
            <li>
              <Link
                to="/notifications"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  textDecoration: 'none',
                  color: isActive('/notifications') ? COLORS.primary : COLORS.text,
                  backgroundColor: isActive('/notifications') ? `${COLORS.primary}10` : 'transparent',
                  borderLeft: isActive('/notifications') ? `4px solid ${COLORS.primary}` : '4px solid transparent',
                }}
                onClick={closeSidebar}
              >
                <div style={{ position: 'relative' }}>
                  <NotificationIcon />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: COLORS.notification,
                        color: 'white',
                        fontSize: '0.7rem',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span style={{ marginLeft: '0.75rem' }}>Notifications</span>
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  textDecoration: 'none',
                  color: isActive('/settings') ? COLORS.primary : COLORS.text,
                  backgroundColor: isActive('/settings') ? `${COLORS.primary}10` : 'transparent',
                  borderLeft: isActive('/settings') ? `4px solid ${COLORS.primary}` : '4px solid transparent',
                }}
                onClick={closeSidebar}
              >
                <SettingsIcon />
                <span style={{ marginLeft: '0.75rem' }}>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div style={{ padding: '1rem', borderTop: `1px solid ${COLORS.border}` }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: COLORS.text,
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: '4px',
            }}
          >
            <LogoutIcon />
            <span style={{ marginLeft: '0.75rem' }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Header - Mobile */}
        <header
          style={{
            backgroundColor: COLORS.primary,
            padding: '1rem',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            onClick={toggleSidebar}
            className="menu-button"
          >
            <MenuIcon />
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>IShare</h1>
          <div style={{ width: '24px' }} />
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1rem' }}>{children}</main>
      </div>

      {/* Overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="overlay"
        />
      )}
    </div>
  );
};

export default MainLayout; 
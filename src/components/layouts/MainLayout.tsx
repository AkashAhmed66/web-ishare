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
const DriverIcon = () => <span>🚗</span>;
const LogoutIcon = () => <span>🚪</span>;
const MenuIcon = () => <span>☰</span>;

// Create a CSS file for MainLayout - this would typically be in a separate file
const styles = `
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
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notification);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add minimal styles to the document (only overlay)
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

  // Sidebar styles
  const sidebarStyles = {
    width: '250px',
    backgroundColor: COLORS.card,
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    padding: '1rem 0',
    display: 'flex',
    flexDirection: 'column' as const,
    position: isDesktop ? 'fixed' as const : 'fixed' as const,
    top: 0,
    bottom: 0,
    left: isDesktop ? 0 : (isSidebarOpen ? 0 : -250),
    transition: 'left 0.3s ease',
    zIndex: 1000,
  };

  // Main content styles
  const mainContentStyles = {
    flex: 1,
    marginLeft: isDesktop ? 250 : 0,
    transition: 'margin-left 0.3s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
  };

  // Menu button styles
  const menuButtonStyles = {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1.5rem',
    display: isDesktop ? 'none' : 'flex',
    alignItems: 'center',
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: COLORS.background,
      }}
    >
      {/* Sidebar */}
      <aside style={sidebarStyles}>
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
            {user?.role === 'driver' && (
              <li>
                <Link
                  to="/driver"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    textDecoration: 'none',
                    color: isActive('/driver') ? COLORS.primary : COLORS.text,
                    backgroundColor: isActive('/driver') ? `${COLORS.primary}10` : 'transparent',
                    borderLeft: isActive('/driver') ? `4px solid ${COLORS.primary}` : '4px solid transparent',
                  }}
                  onClick={closeSidebar}
                >
                  <DriverIcon />
                  <span style={{ marginLeft: '0.75rem' }}>Driver Dashboard</span>
                </Link>
              </li>
            )}
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
      <div style={mainContentStyles}>
        {/* Header - Mobile only */}
        {!isDesktop && (
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
              style={menuButtonStyles}
            >
              <MenuIcon />
            </button>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>IShare</h1>
            <div style={{ width: '24px' }} />
          </header>
        )}

        {/* Page content */}
        <main style={{ flex: 1, padding: '1rem' }}>
          {children}
        </main>
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
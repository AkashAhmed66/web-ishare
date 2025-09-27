import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../../styles/theme';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: COLORS.background,
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: COLORS.primary,
          padding: '1rem',
          color: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>IShare</h1>
          </Link>
          <div>
            <Link 
              to="/login" 
              style={{ 
                textDecoration: 'none', 
                color: 'white',
                marginRight: '1rem',
              }}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              style={{ 
                textDecoration: 'none', 
                color: 'white',
                backgroundColor: COLORS.secondary,
                padding: '0.5rem 1rem',
                borderRadius: '4px',
              }}
            >
              Register
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: '2rem',
          maxWidth: '480px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {children}
      </main>
      
      {/* Footer */}
      <footer
        style={{
          backgroundColor: COLORS.card,
          padding: '1rem',
          textAlign: 'center',
          color: COLORS.textSecondary,
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} IShare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout; 
import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS, STYLES } from '../styles/theme';

const ForgotPasswordScreen: React.FC = () => {
  return (
    <div>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: COLORS.text
      }}>
        Forgot Password
      </h2>
      
      <p style={{ marginBottom: '2rem', color: COLORS.textSecondary }}>
        Forgot password form would be implemented here.
      </p>
      
      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: COLORS.textSecondary,
      }}>
        Remember your password?{' '}
        <Link 
          to="/login"
          style={{
            color: COLORS.primary,
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          Log in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen; 
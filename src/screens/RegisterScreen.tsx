import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS, STYLES } from '../styles/theme';

const RegisterScreen: React.FC = () => {
  return (
    <div>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: COLORS.text
      }}>
        Create Your Account
      </h2>
      
      <p style={{ marginBottom: '2rem', color: COLORS.textSecondary }}>
        Registration form would be implemented here.
      </p>
      
      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: COLORS.textSecondary,
      }}>
        Already have an account?{' '}
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

export default RegisterScreen; 
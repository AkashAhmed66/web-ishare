import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS, STYLES } from '../styles/theme';

const TermsScreen: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold',
        marginBottom: '2rem',
        color: COLORS.text,
        textAlign: 'center'
      }}>
        Terms of Service
      </h1>
      
      <div style={{
        backgroundColor: COLORS.background,
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        lineHeight: '1.6',
        color: COLORS.text
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          color: COLORS.primary
        }}>
          1. Acceptance of Terms
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          By accessing and using IShare ride-sharing service, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          marginTop: '2rem',
          color: COLORS.primary
        }}>
          2. Service Description
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          IShare provides a platform that connects passengers with drivers for transportation services. We are a technology platform and do not provide transportation services directly.
        </p>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          marginTop: '2rem',
          color: COLORS.primary
        }}>
          3. User Responsibilities
        </h2>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Provide accurate and current information</li>
          <li style={{ marginBottom: '0.5rem' }}>Maintain the security of your account</li>
          <li style={{ marginBottom: '0.5rem' }}>Use the service in compliance with all applicable laws</li>
          <li style={{ marginBottom: '0.5rem' }}>Treat other users with respect and courtesy</li>
        </ul>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          marginTop: '2rem',
          color: COLORS.primary
        }}>
          4. Safety and Conduct
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          Users must follow all safety guidelines and maintain appropriate conduct during rides. Any violation may result in account suspension or termination.
        </p>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          marginTop: '2rem',
          color: COLORS.primary
        }}>
          5. Payment and Fees
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          Payment for rides is processed through the platform. Service fees and pricing are subject to change with notice.
        </p>

        <p style={{ 
          marginTop: '2rem',
          fontSize: '0.875rem',
          color: COLORS.textSecondary
        }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link 
          to="/register"
          style={{
            ...STYLES.buttonPrimary,
            display: 'inline-block',
            padding: '0.75rem 2rem',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '1rem'
          }}
        >
          Back to Registration
        </Link>
        <Link 
          to="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            color: COLORS.primary,
            textDecoration: 'none',
            border: `1px solid ${COLORS.primary}`,
            borderRadius: '4px'
          }}
        >
          Home
        </Link>
      </div>
    </div>
  );
};

export default TermsScreen; 
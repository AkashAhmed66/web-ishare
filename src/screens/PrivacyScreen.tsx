import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS, STYLES } from '../styles/theme';

const PrivacyScreen: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold',
        marginBottom: '2rem',
        color: COLORS.text,
        textAlign: 'center'
      }}>
        Privacy Policy
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
          1. Information We Collect
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          We collect information you provide when creating an account, including name, email, phone number, and profile information. We also collect location data to provide our ride-sharing services.
        </p>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          marginTop: '2rem',
          color: COLORS.primary
        }}>
          2. How We Use Your Information
        </h2>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>To provide and improve our ride-sharing services</li>
          <li style={{ marginBottom: '0.5rem' }}>To connect passengers with drivers</li>
          <li style={{ marginBottom: '0.5rem' }}>To process payments and transactions</li>
          <li style={{ marginBottom: '0.5rem' }}>To ensure safety and security</li>
          <li style={{ marginBottom: '0.5rem' }}>To communicate important updates</li>
        </ul>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          marginTop: '2rem',
          color: COLORS.primary
        }}>
          3. Information Sharing
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          We share limited information with drivers and passengers to facilitate rides. We do not sell your personal information to third parties.
        </p>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          marginTop: '2rem',
          color: COLORS.primary
        }}>
          4. Location Data
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          We collect location data to provide ride-matching and navigation services. You can control location sharing through your device settings.
        </p>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          marginTop: '2rem',
          color: COLORS.primary
        }}>
          5. Data Security
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
        </p>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          marginTop: '2rem',
          color: COLORS.primary
        }}>
          6. Your Rights
        </h2>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Access your personal information</li>
          <li style={{ marginBottom: '0.5rem' }}>Update or correct your information</li>
          <li style={{ marginBottom: '0.5rem' }}>Delete your account and data</li>
          <li style={{ marginBottom: '0.5rem' }}>Opt-out of marketing communications</li>
        </ul>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          marginTop: '2rem',
          color: COLORS.primary
        }}>
          7. Cookies and Tracking
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          We use cookies and similar technologies to improve your experience and analyze usage patterns. You can manage cookie preferences in your browser settings.
        </p>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          marginTop: '2rem',
          color: COLORS.primary
        }}>
          8. Children's Privacy
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
        </p>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          marginTop: '2rem',
          color: COLORS.primary
        }}>
          9. Changes to This Policy
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page.
        </p>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          marginTop: '2rem',
          color: COLORS.primary
        }}>
          10. Contact Us
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          If you have any questions about this privacy policy, please contact us at privacy@ishare.com.
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

export default PrivacyScreen; 
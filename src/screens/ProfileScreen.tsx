import React from 'react';
import { useAppSelector } from '../redux/store';
import { COLORS, STYLES } from '../styles/theme';

const ProfileScreen: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: COLORS.text
      }}>
        My Profile
      </h2>
      
      <div style={{
        ...STYLES.card,
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '1.5rem' 
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: COLORS.primary,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            marginRight: '1rem'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              marginBottom: '0.25rem' 
            }}>
              {user.name}
            </h3>
            <p style={{ color: COLORS.textSecondary }}>
              {user.email}
            </p>
          </div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Role</div>
          <div style={{ 
            display: 'inline-block',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: `${COLORS.primary}20`,
            color: COLORS.primary,
            textTransform: 'capitalize'
          }}>
            {user.role}
          </div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Phone</div>
          <div>{user.phone || 'Not provided'}</div>
        </div>
        
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Member Since</div>
          <div>{new Date(user.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
      
      <button
        style={{
          ...STYLES.buttonPrimary,
          width: '100%',
          marginBottom: '1rem'
        }}
      >
        Edit Profile
      </button>
      
      <button
        style={{
          backgroundColor: 'transparent',
          border: `1px solid ${COLORS.border}`,
          color: COLORS.text,
          padding: `${STYLES.buttonPrimary.padding}`,
          borderRadius: STYLES.buttonPrimary.borderRadius,
          fontWeight: STYLES.buttonPrimary.fontWeight,
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Change Password
      </button>
    </div>
  );
};

export default ProfileScreen; 
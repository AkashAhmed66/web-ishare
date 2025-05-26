import React, { useState } from 'react';
import { useAppSelector } from '../redux/store';
import { COLORS, STYLES } from '../styles/theme';

const DriverHomeScreen: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        ...STYLES.card,
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2>Welcome, {user?.firstName}!</h2>
          <p style={{ color: COLORS.textSecondary }}>Ready to drive?</p>
        </div>
        <button
          onClick={() => setIsOnline(!isOnline)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isOnline ? COLORS.success : COLORS.danger,
            color: COLORS.white,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {/* Earnings Summary */}
      <div style={{
        ...STYLES.card,
        marginBottom: '1rem'
      }}>
        <h3>Today's Earnings</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: COLORS.success }}>$125.50</p>
            <p style={{ color: COLORS.textSecondary }}>8 trips completed</p>
          </div>
          <div>
            <p style={{ fontSize: '1.2rem', color: COLORS.primary }}>$15.69/hr</p>
            <p style={{ color: COLORS.textSecondary }}>Average rate</p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div style={{
        ...STYLES.card,
        marginBottom: '1rem'
      }}>
        <h3>Current Status</h3>
        {isOnline ? (
          <div>
            <p style={{ color: COLORS.success }}>🟢 Online - Looking for rides</p>
            <p style={{ color: COLORS.textSecondary }}>Stay in busy areas for more requests</p>
          </div>
        ) : (
          <div>
            <p style={{ color: COLORS.danger }}>🔴 Offline</p>
            <p style={{ color: COLORS.textSecondary }}>Go online to start receiving ride requests</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{
        ...STYLES.card
      }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <button style={{
            ...STYLES.buttonSecondary,
            padding: '1rem',
            textAlign: 'center'
          }}>
            📊 View Earnings
          </button>
          <button style={{
            ...STYLES.buttonSecondary,
            padding: '1rem',
            textAlign: 'center'
          }}>
            🗺️ Hot Zones
          </button>
          <button style={{
            ...STYLES.buttonSecondary,
            padding: '1rem',
            textAlign: 'center'
          }}>
            📋 Trip History
          </button>
          <button style={{
            ...STYLES.buttonSecondary,
            padding: '1rem',
            textAlign: 'center'
          }}>
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverHomeScreen; 
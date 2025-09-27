import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { getNotifications, markAllNotificationsAsRead, clearAllNotifications } from '../redux/slices/notificationSlice';
import { COLORS, STYLES } from '../styles/theme';

const NotificationsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, loading } = useAppSelector((state) => state.notification);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  if (loading && notifications.length === 0) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          color: COLORS.text,
          margin: 0
        }}>
          Notifications
        </h2>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleMarkAllAsRead}
            disabled={notifications.length === 0 || notifications.every(n => n.read)}
            style={{
              backgroundColor: 'transparent',
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              opacity: notifications.length === 0 || notifications.every(n => n.read) ? 0.5 : 1
            }}
          >
            Mark all as read
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            style={{
              backgroundColor: 'transparent',
              border: `1px solid ${COLORS.danger}`,
              color: COLORS.danger,
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              opacity: notifications.length === 0 ? 0.5 : 1
            }}
          >
            Clear all
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div style={{
          ...STYLES.card,
          padding: '2rem',
          textAlign: 'center',
          color: COLORS.textSecondary
        }}>
          <p>You don't have any notifications.</p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              style={{
                ...STYLES.card,
                padding: '1rem',
                marginBottom: '1rem',
                borderLeft: notification.read 
                  ? `4px solid ${COLORS.border}` 
                  : `4px solid ${COLORS.primary}`,
                backgroundColor: notification.read ? COLORS.card : `${COLORS.primary}05`
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: 'bold',
                  marginTop: 0,
                  marginBottom: '0.25rem'
                }}>
                  {notification.title}
                </h3>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: COLORS.textSecondary 
                }}>
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
              
              <p style={{ 
                margin: '0 0 0.5rem 0', 
                fontSize: '0.9rem' 
              }}>
                {notification.body}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                gap: '0.75rem',
                marginTop: '0.75rem'
              }}>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: COLORS.primary,
                    padding: 0,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  View Details
                </button>
                {!notification.read && (
                  <button
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: COLORS.textSecondary,
                      padding: 0,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen; 
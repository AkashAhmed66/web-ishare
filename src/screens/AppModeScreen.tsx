import React from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { COLORS, STYLES } from '../styles/theme';

// Define app modes
export enum AppMode {
  PASSENGER = 'passenger',
  RIDER = 'rider'
}

const AppModeScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const currentMode = useAppSelector((state) => state.ui.appMode) || AppMode.PASSENGER;

  const handleSelectMode = (mode: AppMode) => {
    // Update app mode in Redux
    dispatch({ type: 'ui/setAppMode', payload: mode });
    
    if (mode === AppMode.PASSENGER) {
      navigate('/');
    } else {
      navigate('/driver');
    }
  };

  const modeCards = [
    {
      mode: AppMode.PASSENGER,
      title: 'Passenger',
      description: 'Book rides to your destination',
      icon: '👤',
      bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      mode: AppMode.RIDER,
      title: 'Driver',
      description: user?.role === 'driver'
        ? 'Accept ride requests and earn money' 
        : 'Sign up as a driver to access this mode',
      icon: '🚗',
      bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      disabled: user?.role !== 'driver',
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        right: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            ...STYLES.buttonSecondary,
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: COLORS.white,
            fontSize: '1.2rem'
          }}
        >
          ←
        </button>
        <h1 style={{
          color: COLORS.white,
          fontSize: '1.5rem',
          fontWeight: 'bold',
          margin: 0
        }}>
          Choose Mode
        </h1>
        <div style={{ width: '48px' }} />
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h2 style={{
          color: COLORS.white,
          fontSize: '1.2rem',
          marginBottom: '3rem',
          opacity: 0.9,
          fontWeight: 'normal'
        }}>
          Select how you want to use IShare today
        </h2>

        {/* Mode Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {modeCards.map((card) => (
            <button
              key={card.mode}
              onClick={() => !card.disabled && handleSelectMode(card.mode)}
              disabled={card.disabled}
              style={{
                background: card.disabled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)',
                border: currentMode === card.mode ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: card.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                transform: currentMode === card.mode ? 'scale(1.02)' : 'scale(1)',
                boxShadow: currentMode === card.mode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
                  : '0 4px 16px rgba(0, 0, 0, 0.1)',
                opacity: card.disabled ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!card.disabled) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!card.disabled) {
                  e.currentTarget.style.transform = currentMode === card.mode ? 'scale(1.02)' : 'scale(1)';
                  e.currentTarget.style.boxShadow = currentMode === card.mode 
                    ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
                    : '0 4px 16px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {/* Icon */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: card.disabled ? 'rgba(0, 0, 0, 0.1)' : card.bgGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                flexShrink: 0
              }}>
                {card.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 style={{
                  color: card.disabled ? COLORS.textSecondary : COLORS.text,
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  margin: '0 0 0.5rem 0'
                }}>
                  {card.title}
                </h3>
                <p style={{
                  color: card.disabled ? COLORS.textSecondary : COLORS.textSecondary,
                  fontSize: '0.9rem',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  {card.description}
                </p>
              </div>

              {/* Selection Indicator */}
              {currentMode === card.mode && !card.disabled && (
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: COLORS.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: COLORS.white,
                  fontSize: '0.8rem',
                  flexShrink: 0
                }}>
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Become Driver Button */}
        {user?.role !== 'driver' && (
          <button
            onClick={() => navigate('/driver-signup')}
            style={{
              ...STYLES.buttonPrimary,
              width: '100%',
              marginTop: '2rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: COLORS.white,
              fontWeight: 'bold'
            }}
          >
            Become a Driver
          </button>
        )}
      </div>
    </div>
  );
};

export default AppModeScreen; 
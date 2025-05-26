import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { toggleTheme } from '../redux/slices/uiSlice';
import { COLORS, STYLES } from '../styles/theme';

// CSS-in-JS for SettingsScreen
const toggleSwitchStyles = `
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: ${COLORS.primary};
}

input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

input:not(:checked) + .toggle-slider {
  background-color: ${COLORS.border};
}
`;

const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector(state => state.ui);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [locationServices, setLocationServices] = useState(true);

  // Add the styles to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = toggleSwitchStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: COLORS.text
      }}>
        Settings
      </h2>
      
      {/* Appearance Section */}
      <div style={{
        ...STYLES.card,
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          marginTop: 0,
          marginBottom: '1rem',
        }}>
          Appearance
        </h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>Dark Mode</div>
            <div style={{ fontSize: '0.875rem', color: COLORS.textSecondary }}>
              Switch between light and dark themes
            </div>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={theme === 'dark'}
              onChange={handleThemeToggle}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      {/* Notifications Section */}
      <div style={{
        ...STYLES.card,
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          marginTop: 0,
          marginBottom: '1rem',
        }}>
          Notifications
        </h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>Push Notifications</div>
            <div style={{ fontSize: '0.875rem', color: COLORS.textSecondary }}>
              Receive notifications for ride updates
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>Email Updates</div>
            <div style={{ fontSize: '0.875rem', color: COLORS.textSecondary }}>
              Receive ride receipts and promotions
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={emailUpdates}
            onChange={() => setEmailUpdates(!emailUpdates)}
          />
        </div>
      </div>
      
      {/* Privacy Section */}
      <div style={{
        ...STYLES.card,
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          marginTop: 0,
          marginBottom: '1rem',
        }}>
          Privacy
        </h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>Location Services</div>
            <div style={{ fontSize: '0.875rem', color: COLORS.textSecondary }}>
              Allow app to access your location
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={locationServices}
            onChange={() => setLocationServices(!locationServices)}
          />
        </div>
        
        <button
          style={{
            backgroundColor: 'transparent',
            border: `1px solid ${COLORS.danger}`,
            color: COLORS.danger,
            padding: '0.75rem',
            borderRadius: '4px',
            width: '100%',
            marginTop: '1rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Delete Account
        </button>
      </div>
      
      {/* About Section */}
      <div style={{
        ...STYLES.card,
        padding: '1.5rem',
      }}>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          marginTop: 0,
          marginBottom: '1rem',
        }}>
          About
        </h3>
        
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ fontWeight: 'bold' }}>Version</div>
          <div style={{ fontSize: '0.9rem' }}>1.0.0</div>
        </div>
        
        <div>
          <div style={{ fontWeight: 'bold' }}>Terms of Service</div>
          <button
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: COLORS.primary,
              padding: '0',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              textAlign: 'left',
            }}
          >
            View Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen; 
import React, { useState } from 'react';
import { useAppSelector } from '../redux/store';
import { COLORS, STYLES } from '../styles/theme';

const rideTypes = [
  { id: 'economy', name: 'Economy', description: 'Affordable rides', price: 15 },
  { id: 'standard', name: 'Standard', description: 'Comfortable rides', price: 20 },
  { id: 'premium', name: 'Premium', description: 'Luxury rides', price: 30 },
];

const RideOptionsScreen: React.FC = () => {
  const { pickup, destination } = useAppSelector((state) => state.location);
  const [selectedType, setSelectedType] = useState('standard');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      padding: '1rem'
    }}>
      <div style={{
        ...STYLES.card,
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1>Choose Ride Type</h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <p><strong>From:</strong> {pickup?.address || 'Not selected'}</p>
          <p><strong>To:</strong> {destination?.address || 'Not selected'}</p>
        </div>

        <div>
          {rideTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              style={{
                padding: '1rem',
                border: `2px solid ${selectedType === type.id ? COLORS.primary : COLORS.border}`,
                borderRadius: '8px',
                marginBottom: '1rem',
                cursor: 'pointer',
                backgroundColor: selectedType === type.id ? COLORS.background : COLORS.white
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{type.name}</h3>
                  <p style={{ color: COLORS.textSecondary }}>{type.description}</p>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  ${type.price}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button style={{
          ...STYLES.buttonPrimary,
          width: '100%',
          padding: '1rem'
        }}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default RideOptionsScreen; 
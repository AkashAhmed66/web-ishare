import React, { useState } from 'react';
import { COLORS, STYLES } from '../styles/theme';

const PaymentScreen: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState('card');

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'cash', name: 'Cash', icon: '💵' },
    { id: 'digital', name: 'Digital Wallet', icon: '📱' },
  ];

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
        <h1>Payment Method</h1>
        
        <div style={{ marginBottom: '2rem' }}>
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              style={{
                padding: '1rem',
                border: `2px solid ${selectedMethod === method.id ? COLORS.primary : COLORS.border}`,
                borderRadius: '8px',
                marginBottom: '1rem',
                cursor: 'pointer',
                backgroundColor: selectedMethod === method.id ? COLORS.background : COLORS.white,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '2rem', marginRight: '1rem' }}>{method.icon}</span>
              <span style={{ fontSize: '1.1rem' }}>{method.name}</span>
            </div>
          ))}
        </div>

        {selectedMethod === 'card' && (
          <div style={{ marginBottom: '2rem' }}>
            <h3>Card Details</h3>
            <input
              type="text"
              placeholder="Card Number"
              style={{ ...STYLES.input, marginBottom: '0.5rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="MM/YY"
                style={{ ...STYLES.input, flex: 1 }}
              />
              <input
                type="text"
                placeholder="CVV"
                style={{ ...STYLES.input, flex: 1 }}
              />
            </div>
          </div>
        )}

        <button style={{
          ...STYLES.buttonPrimary,
          width: '100%',
          padding: '1rem'
        }}>
          Save Payment Method
        </button>
      </div>
    </div>
  );
};

export default PaymentScreen; 
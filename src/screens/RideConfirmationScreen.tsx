import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { COLORS, STYLES } from '../styles/theme';
import { createRide } from '../redux/slices/rideSlice';

const RideConfirmationScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pickup, destination } = useAppSelector((state) => state.location);
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.ride);

  const [selectedRideType, setSelectedRideType] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showFareBreakdown, setShowFareBreakdown] = useState(false);

  const rideTypes = [
    {
      id: 'standard',
      name: 'Standard',
      icon: '🚗',
      description: 'Comfortable and affordable',
      baseFare: 12.50,
      priceMultiplier: 1,
      eta: '5-8 min',
      capacity: '4 seats'
    },
    {
      id: 'comfort',
      name: 'Comfort',
      icon: '🚙',
      description: 'Premium cars with extra space',
      baseFare: 18.75,
      priceMultiplier: 1.5,
      eta: '8-12 min',
      capacity: '4 seats'
    },
    {
      id: 'xl',
      name: 'XL',
      icon: '🚐',
      description: 'Larger vehicles for groups',
      baseFare: 25.00,
      priceMultiplier: 2,
      eta: '10-15 min',
      capacity: '6 seats'
    }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit Card', icon: '💳', details: '**** 1234' },
    { id: 'cash', name: 'Cash', icon: '💵', details: 'Pay driver directly' },
    { id: 'wallet', name: 'IShare Wallet', icon: '💰', details: '$45.20 available' }
  ];

  const selectedRide = rideTypes.find(type => type.id === selectedRideType);
  const estimatedFare = selectedRide ? selectedRide.baseFare : 12.50;
  const tax = estimatedFare * 0.1;
  const serviceFee = 2.50;
  const totalFare = estimatedFare + tax + serviceFee;

  const handleConfirmRide = async () => {
    if (!pickup || !destination) return;

    try {
      const rideData = {
        pickup,
        destination,
        rideType: selectedRideType,
        paymentMethod,
        estimatedFare: totalFare
      };

      const result = await dispatch(createRide(rideData)).unwrap();
      navigate(`/ride-status/${result.id}`);
    } catch (error) {
      console.error('Failed to create ride:', error);
    }
  };

  if (!pickup || !destination) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>No ride details found</h2>
        <button onClick={() => navigate('/')} style={STYLES.buttonPrimary}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem',
        backgroundColor: COLORS.white,
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: STYLES.card.boxShadow
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
            marginRight: '1rem'
          }}
        >
          ←
        </button>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: COLORS.text,
          margin: 0
        }}>
          Confirm Your Ride
        </h1>
      </div>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {/* Route Information */}
        <div style={{
          backgroundColor: COLORS.white,
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: STYLES.card.boxShadow,
          height: 'fit-content'
        }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: COLORS.text,
            marginBottom: '1.5rem'
          }}>
            🛣️ Route Details
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: COLORS.accent,
              borderRadius: '12px',
              marginBottom: '0.75rem'
            }}>
              <span style={{ marginRight: '1rem', fontSize: '1.2rem' }}>📍</span>
              <div>
                <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>From</div>
                <div style={{ fontWeight: '500', color: COLORS.text }}>
                  {pickup.address}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: COLORS.accent,
              borderRadius: '12px'
            }}>
              <span style={{ marginRight: '1rem', fontSize: '1.2rem' }}>🎯</span>
              <div>
                <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>To</div>
                <div style={{ fontWeight: '500', color: COLORS.text }}>
                  {destination.address}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: COLORS.background,
            borderRadius: '12px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>Distance</div>
              <div style={{ fontWeight: 'bold', color: COLORS.text }}>5.2 km</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>Duration</div>
              <div style={{ fontWeight: 'bold', color: COLORS.text }}>12 min</div>
            </div>
          </div>
        </div>

        {/* Ride Type Selection */}
        <div style={{
          backgroundColor: COLORS.white,
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: STYLES.card.boxShadow,
          height: 'fit-content'
        }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: COLORS.text,
            marginBottom: '1.5rem'
          }}>
            🚗 Choose Ride Type
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {rideTypes.map((ride) => (
              <button
                key={ride.id}
                onClick={() => setSelectedRideType(ride.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: selectedRideType === ride.id ? COLORS.accent : COLORS.background,
                  border: selectedRideType === ride.id ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{ride.icon}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: COLORS.text }}>
                      {ride.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                      {ride.description}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                      {ride.eta} • {ride.capacity}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: COLORS.text }}>
                    ${ride.baseFare.toFixed(2)}
                  </div>
                  {selectedRideType === ride.id && (
                    <div style={{ fontSize: '0.8rem', color: COLORS.primary }}>
                      ✓ Selected
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div style={{
          backgroundColor: COLORS.white,
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: STYLES.card.boxShadow,
          height: 'fit-content'
        }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: COLORS.text,
            marginBottom: '1.5rem'
          }}>
            💳 Payment Method
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: paymentMethod === method.id ? COLORS.accent : COLORS.background,
                  border: paymentMethod === method.id ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: COLORS.text }}>
                    {method.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                    {method.details}
                  </div>
                </div>
                {paymentMethod === method.id && (
                  <span style={{ color: COLORS.primary, fontSize: '1.2rem' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Fare Breakdown */}
        <div style={{
          backgroundColor: COLORS.white,
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: STYLES.card.boxShadow,
          height: 'fit-content'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: COLORS.text,
              margin: 0
            }}>
              💰 Fare Details
            </h2>
            <button
              onClick={() => setShowFareBreakdown(!showFareBreakdown)}
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.primary,
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {showFareBreakdown ? 'Hide' : 'Show'} breakdown
            </button>
          </div>

          {showFareBreakdown && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: `1px solid ${COLORS.border}`
              }}>
                <span style={{ color: COLORS.textSecondary }}>Base fare</span>
                <span style={{ color: COLORS.text }}>${estimatedFare.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: `1px solid ${COLORS.border}`
              }}>
                <span style={{ color: COLORS.textSecondary }}>Tax (10%)</span>
                <span style={{ color: COLORS.text }}>${tax.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: `1px solid ${COLORS.border}`
              }}>
                <span style={{ color: COLORS.textSecondary }}>Service fee</span>
                <span style={{ color: COLORS.text }}>${serviceFee.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: COLORS.accent,
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: COLORS.text }}>
              Total
            </span>
            <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: COLORS.primary }}>
              ${totalFare.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleConfirmRide}
            disabled={loading}
            style={{
              ...STYLES.buttonPrimary,
              width: '100%',
              height: '3.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '🔄 Booking...' : '🚗 Confirm Ride'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideConfirmationScreen; 
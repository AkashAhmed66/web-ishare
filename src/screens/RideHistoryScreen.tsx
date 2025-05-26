import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { getUserRides } from '../redux/slices/rideSlice';
import { COLORS, STYLES } from '../styles/theme';

// CSS-in-JS for RideHistoryScreen
const rideCardStyles = `
.ride-card {
  background-color: ${COLORS.card};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: ${STYLES.card.boxShadow};
  cursor: pointer;
  transition: transform 0.2s;
}

.ride-card:hover {
  transform: translateY(-2px);
}
`;

const RideHistoryScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { rides, loading } = useAppSelector((state) => state.ride);

  useEffect(() => {
    dispatch(getUserRides(undefined));
  }, [dispatch]);

  // Add the styles to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = rideCardStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleRideClick = (rideId: string) => {
    navigate(`/ride/${rideId}`);
  };

  if (loading && rides.length === 0) {
    return <div>Loading ride history...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: COLORS.text
      }}>
        Ride History
      </h2>

      {rides.length === 0 ? (
        <div style={{
          ...STYLES.card,
          padding: '2rem',
          textAlign: 'center',
          color: COLORS.textSecondary
        }}>
          <p>You haven't taken any rides yet.</p>
        </div>
      ) : (
        <div>
          {rides.map((ride) => (
            <div 
              key={ride.id}
              onClick={() => handleRideClick(ride.id)}
              className="ride-card"
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <div style={{ fontWeight: 'bold' }}>
                  {new Date(ride.createdAt).toLocaleDateString()}
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: ride.status === 'completed' 
                    ? `${COLORS.success}20` 
                    : ride.status === 'cancelled' 
                      ? `${COLORS.danger}20` 
                      : `${COLORS.primary}20`,
                  color: ride.status === 'completed' 
                    ? COLORS.success 
                    : ride.status === 'cancelled' 
                      ? COLORS.danger 
                      : COLORS.primary,
                  textTransform: 'capitalize',
                  fontSize: '0.8rem'
                }}>
                  {ride.status.replace('_', ' ')}
                </div>
              </div>
              
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>From</div>
                <div style={{ marginBottom: '0.5rem' }}>{ride.pickup.address}</div>
                <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>To</div>
                <div>{ride.destination.address}</div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                borderTop: `1px solid ${COLORS.border}`,
                paddingTop: '0.5rem',
                marginTop: '0.5rem'
              }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>${ride.fare.toFixed(2)}</span>
                </div>
                <div style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>
                  {ride.distance.toFixed(1)} km • {Math.ceil(ride.duration / 60)} min
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RideHistoryScreen; 
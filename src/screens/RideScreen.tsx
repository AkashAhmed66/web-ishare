import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { getRideById, cancelRide } from '../redux/slices/rideSlice';
import { COLORS, STYLES } from '../styles/theme';

const RideScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { activeRide, loading } = useAppSelector(state => state.ride);

  useEffect(() => {
    if (id) {
      dispatch(getRideById(id));
    }
  }, [id, dispatch]);

  const handleCancelRide = () => {
    if (id && activeRide) {
      dispatch(cancelRide({ rideId: id }))
        .unwrap()
        .then(() => {
          navigate('/');
        })
        .catch(error => {
          console.error('Failed to cancel ride:', error);
        });
    }
  };

  if (loading) {
    return <div>Loading ride details...</div>;
  }

  if (!activeRide) {
    return <div>Ride not found.</div>;
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: COLORS.text
      }}>
        Ride Details
      </h2>
      
      <div style={{
        ...STYLES.card,
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
        }}>
          Ride #{activeRide.id.slice(0, 8)}
        </h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Status</div>
          <div style={{
            display: 'inline-block',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: activeRide.status === 'completed' 
              ? `${COLORS.success}20` 
              : activeRide.status === 'cancelled' 
                ? `${COLORS.danger}20` 
                : `${COLORS.primary}20`,
            color: activeRide.status === 'completed' 
              ? COLORS.success 
              : activeRide.status === 'cancelled' 
                ? COLORS.danger 
                : COLORS.primary,
            textTransform: 'capitalize',
          }}>
            {activeRide.status.replace('_', ' ')}
          </div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Pickup</div>
          <div>{activeRide.pickup.address}</div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Destination</div>
          <div>{activeRide.destination.address}</div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Fare</div>
          <div>${activeRide.fare.toFixed(2)}</div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Distance</div>
            <div>{activeRide.distance.toFixed(1)} km</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Duration</div>
            <div>{Math.ceil(activeRide.duration / 60)} min</div>
          </div>
        </div>
      </div>
      
      {activeRide.status !== 'completed' && activeRide.status !== 'cancelled' && (
        <button
          onClick={handleCancelRide}
          style={{
            backgroundColor: 'transparent',
            border: `1px solid ${COLORS.danger}`,
            color: COLORS.danger,
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            fontWeight: '500',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Cancel Ride
        </button>
      )}
    </div>
  );
};

export default RideScreen; 
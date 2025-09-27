import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { scheduleRide } from '../redux/slices/rideSlice';
import { COLORS, STYLES } from '../styles/theme';

// Add a button style for the map selector
const mapButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: COLORS.background,
  border: `1px solid ${COLORS.border}`,
  borderRadius: '4px',
  padding: '0.5rem',
  cursor: 'pointer',
};

const ScheduleRideScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.ride);
  const { pickup, destination } = useAppSelector((state) => state.location);
  
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  
  // Update form when pickup or destination changes in Redux
  useEffect(() => {
    if (pickup) {
      setPickupAddress(pickup.address);
    }
    if (destination) {
      setDestinationAddress(destination.address);
    }
  }, [pickup, destination]);
  
  const handleDayToggle = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };
  
  const handleOpenMap = () => {
    // Navigate to the map screen
    navigate('/map');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!pickupAddress || !destinationAddress || !scheduleDate || !scheduleTime) {
      return;
    }
    
    // Create scheduled time string
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    
    // Create recurring data if needed
    const recurringData = isRecurring ? {
      frequency,
      days: frequency === 'weekly' ? selectedDays : undefined,
      endDate: new Date(endDate).toISOString(),
    } : undefined;
    
    // Use actual pickup and destination from Redux if available
    const pickupLocation = pickup || {
      address: pickupAddress,
      latitude: 40.7128,
      longitude: -74.0060,
    };
    
    const destinationLocation = destination || {
      address: destinationAddress,
      latitude: 40.7580,
      longitude: -73.9855,
    };
    
    dispatch(scheduleRide({
      pickup: pickupLocation,
      destination: destinationLocation,
      scheduledFor: scheduledDateTime,
      recurring: recurringData,
    }))
      .unwrap()
      .then(() => {
        navigate('/ride-history');
      })
      .catch((error) => {
        console.error('Failed to schedule ride:', error);
      });
  };
  
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: COLORS.text
      }}>
        Schedule a Ride
      </h2>
      
      <div style={{
        ...STYLES.card,
        padding: '1.5rem',
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="pickup"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: COLORS.text,
              }}
            >
              Pickup Location
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="pickup"
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Enter pickup address"
                required
                style={{
                  ...STYLES.input,
                  height: '2.5rem',
                  flex: 1
                }}
              />
              <button 
                type="button" 
                onClick={handleOpenMap}
                style={mapButtonStyle}
                title="Select on map"
              >
                <span role="img" aria-label="map pin" style={{ color: COLORS.primary, fontSize: '20px' }}>📍</span>
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="destination"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: COLORS.text,
              }}
            >
              Destination
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="destination"
                type="text"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="Enter destination address"
                required
                style={{
                  ...STYLES.input,
                  height: '2.5rem',
                  flex: 1
                }}
              />
              <button 
                type="button" 
                onClick={handleOpenMap}
                style={mapButtonStyle}
                title="Select on map"
              >
                <span role="img" aria-label="map pin" style={{ color: COLORS.accent, fontSize: '20px' }}>📍</span>
              </button>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ flex: 1 }}>
              <label 
                htmlFor="date"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: COLORS.text,
                }}
              >
                Date
              </label>
              <input
                id="date"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                style={{
                  ...STYLES.input,
                  height: '2.5rem',
                }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label 
                htmlFor="time"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: COLORS.text,
                }}
              >
                Time
              </label>
              <input
                id="time"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                required
                style={{
                  ...STYLES.input,
                  height: '2.5rem',
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                id="recurring"
                type="checkbox"
                checked={isRecurring}
                onChange={() => setIsRecurring(!isRecurring)}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="recurring" style={{ fontWeight: '500', color: COLORS.text }}>
                Recurring Ride
              </label>
            </div>
          </div>
          
          {isRecurring && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: COLORS.text,
                }}>
                  Frequency
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      id="daily"
                      type="radio"
                      name="frequency"
                      checked={frequency === 'daily'}
                      onChange={() => setFrequency('daily')}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <label htmlFor="daily">Daily</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      id="weekly"
                      type="radio"
                      name="frequency"
                      checked={frequency === 'weekly'}
                      onChange={() => setFrequency('weekly')}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <label htmlFor="weekly">Weekly</label>
                  </div>
                </div>
              </div>
              
              {frequency === 'weekly' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: COLORS.text,
                  }}>
                    Days of the week
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(index)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: '1px solid',
                          borderColor: selectedDays.includes(index) ? COLORS.primary : COLORS.border,
                          backgroundColor: selectedDays.includes(index) ? `${COLORS.primary}20` : 'transparent',
                          color: selectedDays.includes(index) ? COLORS.primary : COLORS.text,
                          cursor: 'pointer',
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label 
                  htmlFor="endDate"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: COLORS.text,
                  }}
                >
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required={isRecurring}
                  min={scheduleDate || new Date().toISOString().split('T')[0]}
                  style={{
                    ...STYLES.input,
                    height: '2.5rem',
                  }}
                />
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              ...STYLES.buttonPrimary,
              width: '100%',
              marginTop: '1rem',
              height: '2.75rem',
            }}
          >
            {loading ? 'Scheduling...' : 'Schedule Ride'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleRideScreen; 
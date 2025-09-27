import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { getCurrentLocation, setPickup, setDestination } from '../redux/slices/locationSlice';
import { COLORS, STYLES } from '../styles/theme';
import mapsService from '../services/mapsService';
import { AppMode } from '../redux/slices/uiSlice';

interface RecentLocation {
  id: string;
  location: string;
  address: string;
  icon: string;
  coordinates: { latitude: number; longitude: number };
}

interface SuggestedRide {
  id: string;
  name: string;
  price: string;
  time: string;
  icon: string;
}

const recentLocations: RecentLocation[] = [
  { 
    id: '1', 
    location: 'Home', 
    address: '123 Main Street', 
    icon: '🏠', 
    coordinates: { latitude: 23.8103, longitude: 90.4125 } 
  },
  { 
    id: '2', 
    location: 'Work', 
    address: '456 Office Park', 
    icon: '💼', 
    coordinates: { latitude: 23.8203, longitude: 90.4225 } 
  },
  { 
    id: '3', 
    location: 'Shopping Mall', 
    address: '789 Market Street', 
    icon: '🛒', 
    coordinates: { latitude: 23.8150, longitude: 90.4050 } 
  },
];

const suggestedRides: SuggestedRide[] = [
  { id: '1', name: 'Standard', price: '$10-15', time: '5 min', icon: '🚗' },
  { id: '2', name: 'Comfort', price: '$15-20', time: '8 min', icon: '🚙' },
  { id: '3', name: 'XL', price: '$20-25', time: '10 min', icon: '🚐' },
];

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentLocation, pickup, destination } = useAppSelector((state) => state.location);
  const { user } = useAppSelector((state) => state.auth);
  const { appMode } = useAppSelector((state) => state.ui);
  
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    dispatch(getCurrentLocation());
  }, [dispatch]);

  useEffect(() => {
    if (pickup && destination) {
      fetchRoute();
    }
  }, [pickup, destination]);

  const fetchRoute = async () => {
    if (!pickup || !destination) return;
    
    try {
      const route = await mapsService.getDirections(pickup, destination);
      setRouteInfo({
        distance: route.distance,
        duration: route.duration
      });
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const handleLocationSelect = (location: RecentLocation) => {
    if (!pickup) {
      dispatch(setPickup({
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        address: location.address
      }));
    } else {
      dispatch(setDestination({
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        address: location.address
      }));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || !currentLocation) return;

    try {
      const results = await mapsService.searchPlaces(searchQuery, currentLocation);
      if (results.length > 0) {
        const firstResult = results[0];
        dispatch(setDestination({
          latitude: firstResult.coordinates.latitude,
          longitude: firstResult.coordinates.longitude,
          address: firstResult.address
        }));
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleBookRide = () => {
    if (destination) {
      navigate('/ride-confirmation');
    } else {
      alert('Please select a destination first');
    }
  };

  const quickActions = [
    { id: '1', title: 'Schedule Ride', icon: '📅', action: () => navigate('/schedule-ride') },
    { id: '2', title: 'Ride History', icon: '📋', action: () => navigate('/ride-history') },
    { id: '3', title: 'Hot Zones', icon: '🔥', action: () => navigate('/hot-zones') },
    { id: '4', title: 'Settings', icon: '⚙️', action: () => navigate('/settings') },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        backgroundColor: COLORS.white,
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: STYLES.card.boxShadow
      }}>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: COLORS.text,
            margin: '0 0 0.25rem 0'
          }}>
            Hello, {user?.name || 'User'}! 👋
          </h1>
          <p style={{
            color: COLORS.textSecondary,
            margin: 0,
            fontSize: '0.9rem'
          }}>
            Where would you like to go today?
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/app-mode')}
            style={{
              ...STYLES.buttonSecondary,
              padding: '0.5rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              backgroundColor: appMode === AppMode.RIDER ? COLORS.primary : COLORS.accent,
              color: appMode === AppMode.RIDER ? COLORS.white : COLORS.text
            }}
          >
            {appMode === AppMode.PASSENGER ? '👤 Passenger' : '🚗 Driver'}
          </button>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            style={{
              ...STYLES.buttonSecondary,
              padding: '0.5rem',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            ⋯
          </button>
        </div>
      </div>

      {/* Quick Actions Dropdown */}
      {showQuickActions && (
        <div style={{
          position: 'absolute',
          right: '1rem',
          top: '6rem',
          backgroundColor: COLORS.white,
          borderRadius: '12px',
          boxShadow: STYLES.card.boxShadow,
          padding: '0.5rem',
          zIndex: 10,
          minWidth: '200px'
        }}>
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                action.action();
                setShowQuickActions(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: COLORS.text,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.accent}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '1.2rem' }}>{action.icon}</span>
              {action.title}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Ride Booking Card */}
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
            🚗 Book a Ride
          </h2>

          {/* Location Inputs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: COLORS.background,
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '0.75rem',
              border: pickup ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`
            }}>
              <span style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}>📍</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>From</div>
                <div style={{ fontWeight: '500', color: COLORS.text }}>
                  {pickup?.address || 'Current location'}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: COLORS.background,
              borderRadius: '12px',
              padding: '1rem',
              border: destination ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`
            }}>
              <span style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}>🎯</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>To</div>
                <input
                  type="text"
                  placeholder="Where to?"
                  value={destination?.address || searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: COLORS.text,
                    width: '100%',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Route Info */}
          {routeInfo && (
            <div style={{
              backgroundColor: COLORS.accent,
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: COLORS.text }}>📏 {routeInfo.distance}</span>
              <span style={{ color: COLORS.text }}>⏱️ {routeInfo.duration}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleBookRide}
              disabled={!destination}
              style={{
                ...STYLES.buttonPrimary,
                flex: 1,
                opacity: destination ? 1 : 0.5,
                cursor: destination ? 'pointer' : 'not-allowed'
              }}
            >
              Book Now
            </button>
            <button
              onClick={() => navigate('/schedule-ride')}
              style={{
                ...STYLES.buttonSecondary,
                padding: '0.75rem'
              }}
            >
              📅
            </button>
          </div>
        </div>

        {/* Recent Locations */}
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
            📍 Recent Locations
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentLocations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: COLORS.background,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.accent;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.background;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{location.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: COLORS.text }}>
                    {location.location}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                    {location.address}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ride Options */}
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
            🚙 Ride Options
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {suggestedRides.map((ride) => (
              <button
                key={ride.id}
                onClick={() => navigate(`/ride-options?type=${ride.name}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: COLORS.background,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.accent;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.background;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{ride.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '500', color: COLORS.text }}>
                      {ride.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                      {ride.time} • {ride.price}
                    </div>
                  </div>
                </div>
                <span style={{ color: COLORS.primary, fontSize: '1.2rem' }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Map Button */}
      <button
        onClick={() => navigate('/map')}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: COLORS.primary,
          border: 'none',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          cursor: 'pointer',
          fontSize: '1.5rem',
          color: COLORS.white,
          transition: 'all 0.3s ease',
          zIndex: 5
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
        }}
      >
        🗺️
      </button>
    </div>
  );
};

export default HomeScreen; 
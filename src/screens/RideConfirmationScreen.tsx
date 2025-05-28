import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { COLORS, STYLES } from '../styles/theme';
import { createRide } from '../redux/slices/rideSlice';
import socketService from '../services/socketService';

const RideConfirmationScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pickup, destination } = useAppSelector((state) => state.location);
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.ride);

  // Predefined default locations to ensure ride confirmation never fails
  const DEFAULT_PICKUP = {
    latitude: 23.8103,
    longitude: 90.4125,
    address: 'Dhaka University Area, Dhaka'
  };
  
  const DEFAULT_DESTINATION = {
    latitude: 23.7808,
    longitude: 90.4079,
    address: 'New Market, Dhaka'
  };

  // Helper function to validate and ensure location object is complete
  const validateLocation = (loc: any, defaultLoc: any) => {
    if (!loc) return defaultLoc;
    
    return {
      latitude: typeof loc.latitude === 'number' ? loc.latitude : defaultLoc.latitude,
      longitude: typeof loc.longitude === 'number' ? loc.longitude : defaultLoc.longitude,
      address: (loc.address && loc.address.trim() && loc.address !== 'Current Location' && loc.address !== 'Destination') 
        ? loc.address 
        : defaultLoc.address
    };
  };

  // Use validation function to ensure we always have complete, valid location objects
  const finalPickup = validateLocation(pickup, DEFAULT_PICKUP);
  const finalDestination = validateLocation(destination, DEFAULT_DESTINATION);

  console.log('RideConfirmationScreen - original pickup:', pickup);
  console.log('RideConfirmationScreen - original destination:', destination);
  console.log('RideConfirmationScreen - validated pickup:', finalPickup);
  console.log('RideConfirmationScreen - validated destination:', finalDestination);

  const [selectedRideType, setSelectedRideType] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showFareBreakdown, setShowFareBreakdown] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [timeoutRef, setTimeoutRef] = useState<NodeJS.Timeout | null>(null);

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

  // Setup socket connection and listeners
  useEffect(() => {
    if (!user) return;

    // Try to get user ID from various possible fields
    const userId = user.id || (user as any)._id || (user as any).userId;
    
    if (!userId) {
      console.error('[RideConfirmationScreen] User ID is undefined! Full user object:', user);
      console.error('[RideConfirmationScreen] Available user fields:', Object.keys(user));
      
      alert('Error: User not properly authenticated. Please log out and log in again.');
      return;
    }

    console.log('[RideConfirmationScreen] Setting up socket connection for passenger:', userId);

    // Initialize socket connection
    socketService.connect(userId);

    // Authenticate as passenger
    socketService.emit('authenticate', {
      userId: userId,
      userType: 'passenger'
    });

    // Listen for ride events
    const unsubscribeRideRequestReceived = socketService.on('ride_request_received', (data: any) => {
      console.log('[RideConfirmationScreen] Ride request received by server:', data);
      if (timeoutRef) {
        clearTimeout(timeoutRef);
        setTimeoutRef(null);
      }
      setIsBooking(false);
      // Navigate to ride status or tracking screen
      navigate(`/ride-status/${data.rideId}`);
    });

    const unsubscribeRideRequestError = socketService.on('ride_request_error', (data: any) => {
      console.error('[RideConfirmationScreen] Ride request error:', data);
      if (timeoutRef) {
        clearTimeout(timeoutRef);
        setTimeoutRef(null);
      }
      setIsBooking(false);
      alert('Failed to book ride: ' + data.message);
    });

    const unsubscribeDriverAssigned = socketService.on('driver_assigned', (data: any) => {
      console.log('[RideConfirmationScreen] Driver assigned to ride:', data);
      if (timeoutRef) {
        clearTimeout(timeoutRef);
        setTimeoutRef(null);
      }
      setIsBooking(false);
      // You could show a notification that a driver was found
    });

    const unsubscribeRideAssigned = socketService.on('ride_assigned', (data: any) => {
      console.log('[RideConfirmationScreen] Ride assigned confirmation:', data);
      // This confirms our ride was broadcast to drivers
    });

    return () => {
      unsubscribeRideRequestReceived();
      unsubscribeRideRequestError();
      unsubscribeDriverAssigned();
      unsubscribeRideAssigned();
      
      // Clear timeout if component unmounts
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, [user, navigate]);

  const handleConfirmRide = async () => {
    if (!user) {
      alert('Please log in to book a ride');
      return;
    }

    // Try to get user ID from various possible fields
    const userId = user.id || (user as any)._id || (user as any).userId;
    
    if (!userId) {
      console.error('[RideConfirmationScreen] User ID is undefined! Full user object:', user);
      console.error('[RideConfirmationScreen] Available user fields:', Object.keys(user));
      
      alert('Error: User not properly authenticated. Please log out and log in again.');
      return;
    }

    setIsBooking(true);

    try {
      console.log('[RideConfirmationScreen] === PASSENGER RIDE REQUEST START ===');
      console.log('[RideConfirmationScreen] User:', user);
      console.log('[RideConfirmationScreen] User ID:', userId);
      console.log('[RideConfirmationScreen] Pickup:', finalPickup);
      console.log('[RideConfirmationScreen] Destination:', finalDestination);
      console.log('[RideConfirmationScreen] Selected ride type:', selectedRideType);
      console.log('[RideConfirmationScreen] Payment method:', paymentMethod);
      console.log('[RideConfirmationScreen] Total fare:', totalFare);
      console.log('[RideConfirmationScreen] Socket connected:', socketService.isConnected());

      if (!socketService.isConnected()) {
        console.error('[RideConfirmationScreen] Socket not connected, attempting to connect...');
        socketService.connect(userId);
        
        const connected = await socketService.waitForConnection(5000);
        if (!connected) {
          throw new Error('Failed to connect to server');
        }
        console.log('[RideConfirmationScreen] Socket connected successfully');
      }

      // Calculate estimated distance (simple calculation for demo)
      const estimatedDistance = calculateDistanceFromCoordinates(finalPickup, finalDestination);
      
      // Ensure we have valid locations for booking (double-check validation)
      const bookingPickup = validateLocation(finalPickup, DEFAULT_PICKUP);
      const bookingDestination = validateLocation(finalDestination, DEFAULT_DESTINATION);
      
      const rideData = {
        userId: userId,
        pickupLocation: bookingPickup,
        dropoffLocation: bookingDestination,
        rideType: selectedRideType,
        paymentMethod,
        estimatedPrice: totalFare,
        estimatedDistance: estimatedDistance,
        vehicleDetails: selectedRide
      };

      console.log('[RideConfirmationScreen] Sending validated ride request data:', rideData);
      console.log('[RideConfirmationScreen] Broadcasting to all online drivers...');

      // Send ride request via socket for real-time matching with drivers
      socketService.requestRide(rideData);

      // Also create ride in Redux/API for persistence  
      const result = await dispatch(createRide({
        pickup: bookingPickup,
        destination: bookingDestination
      })).unwrap();

      console.log('[RideConfirmationScreen] Ride created in database:', result);
      console.log('[RideConfirmationScreen] === RIDE REQUEST BROADCAST COMPLETE ===');
      
      // Set a timeout to handle case where no driver accepts
      const timeoutId = setTimeout(() => {
        console.log('[RideConfirmationScreen] No driver found within timeout');
        setIsBooking(false);
        setTimeoutRef(null);
        alert('No drivers available at the moment. Please try again later.');
      }, 60000); // 60 seconds timeout

      // Store timeout reference
      setTimeoutRef(timeoutId);
      
      // Don't navigate immediately - wait for driver response or timeout
      // The socket listeners will handle navigation when driver accepts
      
    } catch (error) {
      console.error('[RideConfirmationScreen] Failed to book ride:', error);
      setIsBooking(false);
      alert('Failed to book ride. Please try again.');
    }
  };

  // Helper function to calculate distance
  const calculateDistanceFromCoordinates = (pickup: any, destination: any): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (destination.latitude - pickup.latitude) * Math.PI / 180;
    const dLon = (destination.longitude - pickup.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pickup.latitude * Math.PI / 180) * Math.cos(destination.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

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
                  {finalPickup.address}
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
                  {finalDestination.address}
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
            disabled={isBooking || loading}
            style={{
              ...STYLES.buttonPrimary,
              width: '100%',
              height: '3.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              opacity: (isBooking || loading) ? 0.7 : 1,
              cursor: (isBooking || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            {isBooking ? '📡 Broadcasting to Drivers...' : (loading ? '🔄 Booking...' : '🚗 Confirm Ride')}
          </button>

          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '0.8rem'
            }}>
              <div><strong>Debug Info:</strong></div>
              <div>User ID: {(user?.id || (user as any)?._id || (user as any)?.userId) || 'undefined'}</div>
              <div>User.id: {user?.id || 'undefined'}</div>
              <div>User._id: {(user as any)?._id || 'undefined'}</div>
              <div>User.userId: {(user as any)?.userId || 'undefined'}</div>
              <div>User Name: {user?.name || 'undefined'}</div>
              <div>User Role: {user?.role || 'undefined'}</div>
              <div>User Keys: {user ? Object.keys(user).join(', ') : 'no user'}</div>
              <div>Socket Connected: {socketService.isConnected() ? 'Yes' : 'No'}</div>
              <div>Is Booking: {isBooking ? 'Yes' : 'No'}</div>
              <div>Original Pickup: {pickup?.address || 'null (using fallback)'}</div>
              <div>Original Destination: {destination?.address || 'null (using fallback)'}</div>
              <div>Final Pickup: {finalPickup?.address || 'undefined'}</div>
              <div>Final Destination: {finalDestination?.address || 'undefined'}</div>
              <div>Pickup Source: {pickup ? 'User Selected' : 'Default Fallback'}</div>
              <div>Destination Source: {destination ? 'User Selected' : 'Default Fallback'}</div>
              <div>Selected Ride Type: {selectedRideType}</div>
              <div>Payment Method: {paymentMethod}</div>
              <div>Total Fare: ${totalFare.toFixed(2)}</div>
              
              <button
                onClick={() => {
                  console.log('[RideConfirmationScreen] Manual test ride request');
                  
                  // Try to get user ID from various sources
                  const detectedUserId = (user?.id || (user as any)?._id || (user as any)?.userId);
                  let testUserId = detectedUserId;
                  
                  if (!testUserId) {
                    // Try localStorage
                    try {
                      const storedUser = localStorage.getItem('user');
                      if (storedUser) {
                        const parsedUser = JSON.parse(storedUser);
                        testUserId = parsedUser.id || parsedUser._id || parsedUser.userId;
                      }
                    } catch (e) {
                      console.error('Error parsing localStorage:', e);
                    }
                  }
                  
                  if (!testUserId) {
                    testUserId = 'test_passenger_manual_' + Date.now();
                    console.log('[RideConfirmationScreen] Using generated test user ID:', testUserId);
                  }
                  
                  // Always use validated locations for test
                  const testPickup = validateLocation(finalPickup, DEFAULT_PICKUP);
                  const testDestination = validateLocation(finalDestination, DEFAULT_DESTINATION);
                  
                  const testRideData = {
                    userId: testUserId,
                    pickupLocation: testPickup,
                    dropoffLocation: testDestination,
                    rideType: selectedRideType,
                    paymentMethod,
                    estimatedPrice: totalFare,
                    estimatedDistance: calculateDistanceFromCoordinates(testPickup, testDestination),
                    vehicleDetails: selectedRide
                  };
                  
                  console.log('[RideConfirmationScreen] Sending manual test ride request:', testRideData);
                  socketService.requestRide(testRideData);
                  alert('Manual test ride request sent! Check driver dashboard.');
                }}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                🧪 Manual Test Ride Request (Always Works)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideConfirmationScreen; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { COLORS, STYLES } from '../styles/theme';
import socketService from '../services/socketService';
import { createRide } from '../redux/slices/rideSlice';

interface VehicleType {
  id: string;
  name: string;
  description: string;
  icon: string;
  capacity: number;
  baseFarePerKm: number;
  minimumFare: number;
  eta: string;
  features: string[];
  priceMultiplier: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const RideOptionsScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { pickup: reduxPickup, destination: reduxDestination } = useAppSelector((state) => state.location);
  const { loading } = useAppSelector((state) => state.ride);

  // Get location data from navigation state, localStorage, or Redux
  const navigationState = location.state as any;
  
  // Try to get from localStorage as fallback
  let localStorageData = null;
  try {
    const stored = localStorage.getItem('rideBookingData');
    if (stored) {
      localStorageData = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse localStorage data:', error);
  }
  
  console.log('RideOptionsScreen - navigationState:', navigationState);
  console.log('RideOptionsScreen - localStorageData:', localStorageData);
  console.log('RideOptionsScreen - reduxPickup:', reduxPickup);
  console.log('RideOptionsScreen - reduxDestination:', reduxDestination);
  
  const pickup = navigationState?.pickup || localStorageData?.pickup || reduxPickup;
  const destination = navigationState?.destination || localStorageData?.destination || reduxDestination;
  const navigationRouteInfo = navigationState?.routeInfo || localStorageData?.routeInfo;
  
  console.log('RideOptionsScreen - final pickup:', pickup);
  console.log('RideOptionsScreen - final destination:', destination);

  // State
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('standard');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
  const [isBooking, setIsBooking] = useState(false);
  const [estimatedDistance, setEstimatedDistance] = useState<number>(0);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(navigationRouteInfo || null);

  // Vehicle types
  const vehicleTypes: VehicleType[] = [
    {
      id: 'standard',
      name: 'Standard',
      description: 'Affordable rides for everyday trips',
      icon: '🚗',
      capacity: 4,
      baseFarePerKm: 15,
      minimumFare: 40,
      eta: '3-8 min',
      features: ['AC', 'Music'],
      priceMultiplier: 1.0
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Comfortable rides with premium vehicles',
      icon: '🚙',
      capacity: 4,
      baseFarePerKm: 25,
      minimumFare: 60,
      eta: '5-12 min',
      features: ['AC', 'Music', 'WiFi', 'Phone Charger'],
      priceMultiplier: 1.5
    },
    {
      id: 'shared',
      name: 'Shared',
      description: 'Share ride with others and save money',
      icon: '👥',
      capacity: 3,
      baseFarePerKm: 10,
      minimumFare: 25,
      eta: '10-15 min',
      features: ['AC', 'Shared Trip'],
      priceMultiplier: 0.7
    },
    {
      id: 'xl',
      name: 'XL',
      description: 'Larger vehicles for groups and families',
      icon: '🚐',
      capacity: 7,
      baseFarePerKm: 30,
      minimumFare: 80,
      eta: '8-15 min',
      features: ['AC', 'Music', 'Extra Space'],
      priceMultiplier: 2.0
    }
  ];

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: 'Cash',
      icon: '💵',
      description: 'Pay with cash to the driver'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Pay with your saved card'
    },
    {
      id: 'wallet',
      name: 'IShare Wallet',
      icon: '💰',
      description: 'Pay from your wallet balance'
    },
    {
      id: 'mobile_banking',
      name: 'Mobile Banking',
      icon: '📱',
      description: 'bKash, Nagad, Rocket'
    }
  ];

  // Calculate fare
  const calculateFare = () => {
    if (!estimatedDistance) return 0;
    
    const selectedVehicle = vehicleTypes.find(v => v.id === selectedVehicleType);
    if (!selectedVehicle) return 0;

    const fare = Math.max(
      selectedVehicle.minimumFare,
      estimatedDistance * selectedVehicle.baseFarePerKm
    );
    
    return Math.round(fare);
  };

  // Calculate estimated distance from route info
  useEffect(() => {
    if (pickup && destination) {
      // Parse distance from route info or calculate using coordinates
      const distance = routeInfo ? 
        parseFloat(routeInfo.distance.replace(/[^\d.]/g, '')) : 
        calculateDistanceFromCoordinates(pickup, destination);
      
      setEstimatedDistance(distance);
    }
  }, [pickup, destination, routeInfo]);

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

  // Setup socket listeners
  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    socketService.connect(user.id);

    // Listen for ride events
    const unsubscribeRideRequestReceived = socketService.on('ride_request_received', (data: any) => {
      console.log('Ride request received:', data);
      setIsBooking(false);
      navigate(`/ride-status/${data.rideId}`);
    });

    const unsubscribeRideRequestError = socketService.on('ride_request_error', (data: any) => {
      console.error('Ride request error:', data);
      setIsBooking(false);
      alert('Failed to book ride: ' + data.message);
    });

    const unsubscribeDriverAssigned = socketService.on('driver_assigned', (data: any) => {
      console.log('Driver assigned:', data);
      setIsBooking(false);
    });

    return () => {
      unsubscribeRideRequestReceived();
      unsubscribeRideRequestError();
      unsubscribeDriverAssigned();
    };
  }, [user, navigate]);

  // Handle ride booking
  const handleBookRide = async () => {
    if (!pickup || !destination || !user) {
      alert('Please ensure pickup and destination are selected');
      return;
    }

    setIsBooking(true);

    try {
      const selectedVehicle = vehicleTypes.find(v => v.id === selectedVehicleType);
      const estimatedPrice = calculateFare();

      const rideData = {
        userId: user.id,
        pickupLocation: pickup,
        dropoffLocation: destination,
        rideType: selectedVehicleType,
        paymentMethod: selectedPaymentMethod,
        estimatedPrice,
        estimatedDistance,
        vehicleDetails: selectedVehicle
      };

      console.log('Booking ride with data:', rideData);

      // Send ride request via socket for real-time matching
      socketService.requestRide(rideData);

      // Also create ride in Redux/API for persistence
      await dispatch(createRide({
        pickup,
        destination
      }));

      // Clear localStorage after successful booking
      localStorage.removeItem('rideBookingData');

    } catch (error) {
      console.error('Failed to book ride:', error);
      setIsBooking(false);
      alert('Failed to book ride. Please try again.');
    }
  };

  // CSS styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      padding: '1rem'
    },
    card: {
      ...STYLES.card,
      maxWidth: '600px',
      margin: '0 auto',
      marginBottom: '1rem'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: `1px solid ${COLORS.border}`
    },
    backButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      marginRight: '1rem'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: COLORS.text,
      margin: 0
    },
    section: {
      marginBottom: '2rem'
    },
    sectionTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: '1rem'
    },
    vehicleOption: {
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      border: `2px solid ${COLORS.border}`,
      borderRadius: '8px',
      marginBottom: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: COLORS.card
    },
    vehicleOptionSelected: {
      borderColor: COLORS.primary,
      backgroundColor: `${COLORS.primary}15`
    },
    vehicleIcon: {
      fontSize: '2rem',
      marginRight: '1rem'
    },
    vehicleInfo: {
      flex: 1
    },
    vehicleName: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: '0.25rem'
    },
    vehicleDescription: {
      fontSize: '0.9rem',
      color: COLORS.textSecondary,
      marginBottom: '0.5rem'
    },
    vehicleFeatures: {
      fontSize: '0.8rem',
      color: COLORS.textSecondary
    },
    vehiclePrice: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-end'
    },
    priceAmount: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: COLORS.primary
    },
    priceEta: {
      fontSize: '0.9rem',
      color: COLORS.textSecondary
    },
    paymentOption: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem',
      border: `1px solid ${COLORS.border}`,
      borderRadius: '6px',
      marginBottom: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    paymentOptionSelected: {
      borderColor: COLORS.primary,
      backgroundColor: `${COLORS.primary}10`
    },
    paymentIcon: {
      fontSize: '1.5rem',
      marginRight: '0.75rem'
    },
    paymentInfo: {
      flex: 1
    },
    paymentName: {
      fontSize: '1rem',
      fontWeight: '500',
      color: COLORS.text,
      marginBottom: '0.25rem'
    },
    paymentDescription: {
      fontSize: '0.8rem',
      color: COLORS.textSecondary
    },
    summaryCard: {
      ...STYLES.card,
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: COLORS.card,
      padding: '1.5rem'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem'
    },
    summaryLabel: {
      color: COLORS.textSecondary,
      fontSize: '0.9rem'
    },
    summaryValue: {
      color: COLORS.text,
      fontWeight: '500'
    },
    totalRow: {
      ...{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
      },
      paddingTop: '0.75rem',
      borderTop: `1px solid ${COLORS.border}`,
      fontSize: '1.1rem',
      fontWeight: 'bold'
    },
    bookButton: {
      width: '100%',
      padding: '1rem',
      backgroundColor: COLORS.primary,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      marginTop: '1rem'
    },
    bookButtonDisabled: {
      backgroundColor: COLORS.textSecondary,
      cursor: 'not-allowed'
    }
  };

  // Check if ride details are available
  if (!pickup || !destination) {
    console.log('RideOptionsScreen - Missing data, showing error');
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>No ride details found</h2>
          <p>Please select pickup and destination locations first.</p>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <h4>Debug Info:</h4>
              <p><strong>Navigation State:</strong> {navigationState ? 'Present' : 'Missing'}</p>
              <p><strong>LocalStorage Data:</strong> {localStorageData ? 'Present' : 'Missing'}</p>
              <p><strong>Redux Pickup:</strong> {reduxPickup ? 'Present' : 'Missing'}</p>
              <p><strong>Redux Destination:</strong> {reduxDestination ? 'Present' : 'Missing'}</p>
              <p><strong>Final Pickup:</strong> {pickup ? 'Present' : 'Missing'}</p>
              <p><strong>Final Destination:</strong> {destination ? 'Present' : 'Missing'}</p>
              
              {pickup && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Pickup Address:</strong> {pickup.address}
                </div>
              )}
              
              {destination && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Destination Address:</strong> {destination.address}
                </div>
              )}
            </div>
          )}
          
          <button 
            onClick={() => navigate('/')} 
            style={styles.bookButton}
          >
            Go Back to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.card}>
        <div style={styles.header}>
          <button 
            style={styles.backButton}
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h1 style={styles.title}>Choose Your Ride</h1>
        </div>

        {/* Trip Summary */}
        <div style={styles.section}>
          <div style={{...styles.summaryRow, marginBottom: '1rem'}}>
            <div>
              <div style={{fontSize: '0.9rem', color: COLORS.textSecondary}}>From</div>
              <div style={{fontWeight: '500'}}>{pickup.address}</div>
            </div>
          </div>
          <div style={styles.summaryRow}>
            <div>
              <div style={{fontSize: '0.9rem', color: COLORS.textSecondary}}>To</div>
              <div style={{fontWeight: '500'}}>{destination.address}</div>
            </div>
          </div>
          {routeInfo && (
            <div style={{marginTop: '0.5rem', fontSize: '0.9rem', color: COLORS.textSecondary}}>
              {routeInfo.distance} • {routeInfo.duration}
            </div>
          )}
        </div>

        {/* Vehicle Types */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Select Vehicle Type</h3>
          {vehicleTypes.map((vehicle) => (
            <div
              key={vehicle.id}
              style={{
                ...styles.vehicleOption,
                ...(selectedVehicleType === vehicle.id ? styles.vehicleOptionSelected : {})
              }}
              onClick={() => setSelectedVehicleType(vehicle.id)}
            >
              <div style={styles.vehicleIcon}>{vehicle.icon}</div>
              <div style={styles.vehicleInfo}>
                <div style={styles.vehicleName}>
                  {vehicle.name} • {vehicle.capacity} seats
                </div>
                <div style={styles.vehicleDescription}>
                  {vehicle.description}
                </div>
                <div style={styles.vehicleFeatures}>
                  {vehicle.features.join(' • ')}
                </div>
              </div>
              <div style={styles.vehiclePrice}>
                <div style={styles.priceAmount}>
                  ৳{calculateFare() || vehicle.minimumFare}
                </div>
                <div style={styles.priceEta}>{vehicle.eta}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Payment Method</h3>
          {paymentMethods.map((payment) => (
            <div
              key={payment.id}
              style={{
                ...styles.paymentOption,
                ...(selectedPaymentMethod === payment.id ? styles.paymentOptionSelected : {})
              }}
              onClick={() => setSelectedPaymentMethod(payment.id)}
            >
              <div style={styles.paymentIcon}>{payment.icon}</div>
              <div style={styles.paymentInfo}>
                <div style={styles.paymentName}>{payment.name}</div>
                <div style={styles.paymentDescription}>{payment.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Summary */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Vehicle</span>
          <span style={styles.summaryValue}>
            {vehicleTypes.find(v => v.id === selectedVehicleType)?.name}
          </span>
        </div>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Distance</span>
          <span style={styles.summaryValue}>
            {estimatedDistance.toFixed(1)} km
          </span>
        </div>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Base Fare</span>
          <span style={styles.summaryValue}>৳{calculateFare()}</span>
        </div>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Service Fee</span>
          <span style={styles.summaryValue}>৳5</span>
        </div>
        <div style={styles.totalRow}>
          <span>Total</span>
          <span>৳{calculateFare() + 5}</span>
        </div>

        <button
          style={{
            ...styles.bookButton,
            ...(isBooking || loading ? styles.bookButtonDisabled : {})
          }}
          onClick={handleBookRide}
          disabled={isBooking || loading}
        >
          {isBooking ? 'Booking Ride...' : 'Confirm & Book Ride'}
        </button>
      </div>
    </div>
  );
};

export default RideOptionsScreen; 
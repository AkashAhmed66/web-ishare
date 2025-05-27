import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import { COLORS, STYLES } from '../styles/theme';
import socketService from '../services/socketService';

interface RideProgress {
  rideId: string;
  status: 'searching' | 'driverAssigned' | 'driverAccepted' | 'driverArrived' | 'inProgress' | 'completed' | 'cancelled';
  driver?: {
    id: string;
    name: string;
    phoneNumber: string;
    rating: number;
    vehicleInfo: {
      make: string;
      model: string;
      color: string;
      plateNumber: string;
    };
    currentLocation?: {
      latitude: number;
      longitude: number;
    };
  };
  estimatedArrival?: string;
  estimatedPrice: number;
  actualPrice?: number;
  pickupLocation: any;
  dropoffLocation: any;
  startTime?: string;
  endTime?: string;
  duration?: string;
  distance?: string;
}

const RideStatusScreen: React.FC = () => {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { activeRide } = useAppSelector((state) => state.ride);
  
  // State
  const [rideProgress, setRideProgress] = useState<RideProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Setup socket listeners for real-time updates
  useEffect(() => {
    if (!user || !rideId) return;

    // Initialize socket connection
    socketService.connect(user.id);

    // Listen for ride status updates
    const unsubscribeRideRequestReceived = socketService.on('ride_request_received', (data: any) => {
      console.log('Ride request received:', data);
      setRideProgress(prev => prev ? { ...prev, ...data } : null);
      setIsLoading(false);
    });

    const unsubscribeDriverAssigned = socketService.on('driver_assigned', (data: any) => {
      console.log('Driver assigned:', data);
      setRideProgress(prev => prev ? {
        ...prev,
        status: 'driverAssigned',
        driver: data.driver,
        estimatedArrival: data.estimatedArrival
      } : null);
    });

    const unsubscribeDriverAccepted = socketService.on('driver_accepted', (data: any) => {
      console.log('Driver accepted ride:', data);
      setRideProgress(prev => prev ? {
        ...prev,
        status: 'driverAccepted'
      } : null);
    });

    const unsubscribeDriverArrived = socketService.on('driver_arrived', (data: any) => {
      console.log('Driver arrived:', data);
      setRideProgress(prev => prev ? {
        ...prev,
        status: 'driverArrived'
      } : null);
    });

    const unsubscribeRideStarted = socketService.on('ride_started', (data: any) => {
      console.log('Ride started:', data);
      setRideProgress(prev => prev ? {
        ...prev,
        status: 'inProgress',
        startTime: data.startTime
      } : null);
    });

    const unsubscribeRideCompleted = socketService.on('ride_completed', (data: any) => {
      console.log('Ride completed:', data);
      setRideProgress(prev => prev ? {
        ...prev,
        status: 'completed',
        endTime: data.endTime,
        actualPrice: data.actualPrice,
        duration: data.duration,
        distance: data.distance
      } : null);
    });

    const unsubscribeRideCancelled = socketService.on('ride_cancelled', (data: any) => {
      console.log('Ride cancelled:', data);
      setRideProgress(prev => prev ? {
        ...prev,
        status: 'cancelled'
      } : null);
    });

    const unsubscribeDriverLocationUpdate = socketService.on('driver_location_update', (data: any) => {
      console.log('Driver location update:', data);
      setRideProgress(prev => prev && prev.driver ? {
        ...prev,
        driver: {
          ...prev.driver,
          currentLocation: data.location
        }
      } : prev);
    });

    // Initialize ride progress if activeRide exists
    if (activeRide && activeRide.id === rideId) {
      setRideProgress({
        rideId: activeRide.id,
        status: activeRide.status as any,
        estimatedPrice: activeRide.fare || 0,
        pickupLocation: activeRide.pickup,
        dropoffLocation: activeRide.destination
      });
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      unsubscribeRideRequestReceived();
      unsubscribeDriverAssigned();
      unsubscribeDriverAccepted();
      unsubscribeDriverArrived();
      unsubscribeRideStarted();
      unsubscribeRideCompleted();
      unsubscribeRideCancelled();
      unsubscribeDriverLocationUpdate();
    };
  }, [user, rideId, activeRide]);

  // Handle ride cancellation
  const handleCancelRide = () => {
    if (!rideId) return;
    
    socketService.cancelRide(rideId);
    setShowCancelModal(false);
    navigate('/');
  };

  // Get status info based on current status
  const getStatusInfo = () => {
    if (!rideProgress) return { title: 'Loading...', description: '', icon: '⏳' };

    switch (rideProgress.status) {
      case 'searching':
        return {
          title: 'Looking for Drivers',
          description: 'We are searching for available drivers in your area...',
          icon: '🔍'
        };
      case 'driverAssigned':
        return {
          title: 'Driver Found!',
          description: `${rideProgress.driver?.name} is on the way to pick you up`,
          icon: '🚗'
        };
      case 'driverAccepted':
        return {
          title: 'Driver Accepted',
          description: `${rideProgress.driver?.name} has accepted your ride request`,
          icon: '✅'
        };
      case 'driverArrived':
        return {
          title: 'Driver Arrived',
          description: 'Your driver has arrived at the pickup location',
          icon: '📍'
        };
      case 'inProgress':
        return {
          title: 'Ride in Progress',
          description: 'You are currently on your way to the destination',
          icon: '🛣️'
        };
      case 'completed':
        return {
          title: 'Ride Completed',
          description: 'You have reached your destination safely',
          icon: '🎉'
        };
      case 'cancelled':
        return {
          title: 'Ride Cancelled',
          description: 'This ride has been cancelled',
          icon: '❌'
        };
      default:
        return {
          title: 'Unknown Status',
          description: 'Please contact support if this issue persists',
          icon: '❓'
        };
    }
  };

  const statusInfo = getStatusInfo();

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
      marginBottom: '2rem',
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
    statusSection: {
      textAlign: 'center' as const,
      marginBottom: '2rem'
    },
    statusIcon: {
      fontSize: '4rem',
      marginBottom: '1rem'
    },
    statusTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: '0.5rem'
    },
    statusDescription: {
      fontSize: '1rem',
      color: COLORS.textSecondary,
      lineHeight: 1.5
    },
    progressBar: {
      width: '100%',
      height: '4px',
      backgroundColor: COLORS.border,
      borderRadius: '2px',
      marginBottom: '2rem',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: COLORS.primary,
      borderRadius: '2px',
      transition: 'width 0.3s ease'
    },
    infoSection: {
      marginBottom: '2rem'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    infoLabel: {
      color: COLORS.textSecondary,
      fontSize: '0.9rem'
    },
    infoValue: {
      color: COLORS.text,
      fontWeight: '500'
    },
    driverCard: {
      ...STYLES.card,
      maxWidth: '600px',
      margin: '0 auto',
      marginBottom: '1rem',
      padding: '1.5rem'
    },
    driverHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    driverAvatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: COLORS.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      color: 'white',
      marginRight: '1rem'
    },
    driverInfo: {
      flex: 1
    },
    driverName: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: '0.25rem'
    },
    driverRating: {
      fontSize: '0.9rem',
      color: COLORS.textSecondary
    },
    vehicleInfo: {
      marginTop: '1rem'
    },
    vehicleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem'
    },
    actionButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem'
    },
    button: {
      flex: 1,
      padding: '1rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    primaryButton: {
      backgroundColor: COLORS.primary,
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: COLORS.border,
      color: COLORS.text
    },
    dangerButton: {
      backgroundColor: '#dc3545',
      color: 'white'
    },
    modal: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: COLORS.card,
      borderRadius: '8px',
      padding: '2rem',
      maxWidth: '400px',
      width: '90%'
    },
    modalTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: COLORS.text
    },
    modalText: {
      color: COLORS.textSecondary,
      marginBottom: '1.5rem'
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem'
    }
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    switch (rideProgress?.status) {
      case 'searching': return 10;
      case 'driverAssigned': return 25;
      case 'driverAccepted': return 40;
      case 'driverArrived': return 60;
      case 'inProgress': return 80;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.statusSection}>
            <div style={styles.statusIcon}>⏳</div>
            <div style={styles.statusTitle}>Loading Ride Status...</div>
            <div style={styles.statusDescription}>Please wait while we fetch your ride details</div>
          </div>
        </div>
      </div>
    );
  }

  if (!rideProgress) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <button style={styles.backButton} onClick={() => navigate('/')}>
              ←
            </button>
            <h1 style={styles.title}>Ride Status</h1>
          </div>
          <div style={styles.statusSection}>
            <div style={styles.statusIcon}>❓</div>
            <div style={styles.statusTitle}>No Ride Found</div>
            <div style={styles.statusDescription}>
              We couldn't find any ride details. Please try booking a new ride.
            </div>
            <button
              style={{
                ...styles.button,
                ...styles.primaryButton,
                marginTop: '1rem'
              }}
              onClick={() => navigate('/')}
            >
              Book New Ride
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Main Status Card */}
      <div style={styles.card}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate('/')}>
            ←
          </button>
          <h1 style={styles.title}>Ride Status</h1>
        </div>

        {/* Status Section */}
        <div style={styles.statusSection}>
          <div style={styles.statusIcon}>{statusInfo.icon}</div>
          <div style={styles.statusTitle}>{statusInfo.title}</div>
          <div style={styles.statusDescription}>{statusInfo.description}</div>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${getProgressPercentage()}%`
            }}
          />
        </div>

        {/* Ride Information */}
        <div style={styles.infoSection}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Ride ID</span>
            <span style={styles.infoValue}>{rideProgress.rideId}</span>
          </div>
          {rideProgress.pickupLocation && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>From</span>
              <span style={styles.infoValue}>{rideProgress.pickupLocation.address}</span>
            </div>
          )}
          {rideProgress.dropoffLocation && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>To</span>
              <span style={styles.infoValue}>{rideProgress.dropoffLocation.address}</span>
            </div>
          )}
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Estimated Price</span>
            <span style={styles.infoValue}>৳{rideProgress.estimatedPrice}</span>
          </div>
          {rideProgress.actualPrice && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Final Price</span>
              <span style={styles.infoValue}>৳{rideProgress.actualPrice}</span>
            </div>
          )}
          {rideProgress.estimatedArrival && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>ETA</span>
              <span style={styles.infoValue}>{rideProgress.estimatedArrival}</span>
            </div>
          )}
        </div>
      </div>

      {/* Driver Information Card */}
      {rideProgress.driver && (
        <div style={styles.driverCard}>
          <div style={styles.driverHeader}>
            <div style={styles.driverAvatar}>
              {rideProgress.driver.name.charAt(0).toUpperCase()}
            </div>
            <div style={styles.driverInfo}>
              <div style={styles.driverName}>{rideProgress.driver.name}</div>
              <div style={styles.driverRating}>
                ⭐ {rideProgress.driver.rating}/5.0 • {rideProgress.driver.phoneNumber}
              </div>
            </div>
          </div>
          
          <div style={styles.vehicleInfo}>
            <div style={styles.vehicleRow}>
              <span style={styles.infoLabel}>Vehicle</span>
              <span style={styles.infoValue}>
                {rideProgress.driver.vehicleInfo.make} {rideProgress.driver.vehicleInfo.model}
              </span>
            </div>
            <div style={styles.vehicleRow}>
              <span style={styles.infoLabel}>Color</span>
              <span style={styles.infoValue}>{rideProgress.driver.vehicleInfo.color}</span>
            </div>
            <div style={styles.vehicleRow}>
              <span style={styles.infoLabel}>Plate Number</span>
              <span style={styles.infoValue}>{rideProgress.driver.vehicleInfo.plateNumber}</span>
            </div>
          </div>

          {/* Driver Action Buttons */}
          {(rideProgress.status === 'driverAccepted' || rideProgress.status === 'driverArrived') && (
            <div style={styles.actionButtons}>
              <button
                style={{
                  ...styles.button,
                  ...styles.primaryButton
                }}
                onClick={() => navigate(`/chat/${rideProgress.rideId}`)}
              >
                💬 Message
              </button>
              <button
                style={{
                  ...styles.button,
                  ...styles.secondaryButton
                }}
                onClick={() => window.open(`tel:${rideProgress.driver?.phoneNumber}`)}
              >
                📞 Call
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.card}>
        {rideProgress.status === 'searching' && (
          <button
            style={{
              ...styles.button,
              ...styles.dangerButton
            }}
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Ride
          </button>
        )}

        {rideProgress.status === 'completed' && (
          <div style={styles.actionButtons}>
            <button
              style={{
                ...styles.button,
                ...styles.primaryButton
              }}
              onClick={() => navigate('/')}
            >
              Book Another Ride
            </button>
            <button
              style={{
                ...styles.button,
                ...styles.secondaryButton
              }}
              onClick={() => navigate('/ride-history')}
            >
              View History
            </button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalTitle}>Cancel Ride?</div>
            <div style={styles.modalText}>
              Are you sure you want to cancel this ride? This action cannot be undone.
            </div>
            <div style={styles.modalButtons}>
              <button
                style={{
                  ...styles.button,
                  ...styles.secondaryButton
                }}
                onClick={() => setShowCancelModal(false)}
              >
                Keep Ride
              </button>
              <button
                style={{
                  ...styles.button,
                  ...styles.dangerButton
                }}
                onClick={handleCancelRide}
              >
                Cancel Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideStatusScreen; 
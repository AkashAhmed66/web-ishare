import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import { COLORS, STYLES } from '../styles/theme';
import socketService from '../services/socketService';

interface RideRequest {
  rideId: string;
  passengerId: string;
  passengerName: string;
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  dropoffLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  rideType: string;
  estimatedPrice: number;
  estimatedDistance: number;
  currency: string;
  paymentMethod: string;
  requestTime: Date;
}

interface CurrentRide {
  rideId: string;
  passengerId: string;
  passengerName: string;
  status: 'assigned' | 'accepted' | 'arrived' | 'inProgress' | 'completed';
  pickupLocation: any;
  dropoffLocation: any;
  estimatedPrice: number;
}

const DriverHomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  
  // State
  const [isOnline, setIsOnline] = useState(false);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [currentRide, setCurrentRide] = useState<CurrentRide | null>(null);
  const [earnings, setEarnings] = useState({ today: 0, thisWeek: 0, total: 0 });
  const [stats, setStats] = useState({ 
    totalRides: 0, 
    rating: 4.8, 
    acceptance: 95,
    onlineTime: '0h 0m'
  });

  // Setup socket listeners
  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    socketService.connect(user.id);
    
    // Connect as driver
    socketService.emit('driver_connect', {
      driverId: user.id,
      location: null, // You can get current location here if needed
      isOnline: isOnline
    });

    // Listen for ride assignments
    const unsubscribeRideAssigned = socketService.on('ride_assigned', (data: any) => {
      console.log('New ride request received:', data);
      
      const newRequest: RideRequest = {
        rideId: data.rideId,
        passengerId: data.passengerId,
        passengerName: data.passengerName || 'Passenger',
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        rideType: data.rideType || 'standard',
        estimatedPrice: data.estimatedPrice,
        estimatedDistance: data.estimatedDistance,
        currency: data.currency || 'BDT',
        paymentMethod: data.paymentMethod || 'cash',
        requestTime: new Date()
      };
      
      setRideRequests(prev => [newRequest, ...prev]);
      
      // Play notification sound (if available)
      try {
        new Audio('/notification.mp3').play().catch(() => {});
      } catch (e) {}
    });

    const unsubscribeRideActionSuccess = socketService.on('ride_action_success', (data: any) => {
      console.log('Ride action success:', data);
      
      if (data.action === 'accepted') {
        // Move from requests to current ride
        const acceptedRequest = rideRequests.find(req => req.rideId === data.rideId);
        if (acceptedRequest) {
          setCurrentRide({
            rideId: acceptedRequest.rideId,
            passengerId: acceptedRequest.passengerId,
            passengerName: acceptedRequest.passengerName,
            status: 'accepted',
            pickupLocation: acceptedRequest.pickupLocation,
            dropoffLocation: acceptedRequest.dropoffLocation,
            estimatedPrice: acceptedRequest.estimatedPrice
          });
          
          // Remove from requests
          setRideRequests(prev => prev.filter(req => req.rideId !== data.rideId));
        }
      } else if (data.action === 'completed') {
        setEarnings(prev => ({
          ...prev,
          today: prev.today + (data.earnings || 0),
          total: prev.total + (data.earnings || 0)
        }));
        setStats(prev => ({ ...prev, totalRides: prev.totalRides + 1 }));
        setCurrentRide(null);
      }
    });

    const unsubscribeRideActionError = socketService.on('ride_action_error', (data: any) => {
      console.error('Ride action error:', data);
      alert('Error: ' + data.message);
    });

    const unsubscribeRideCancelled = socketService.on('ride_cancelled', (data: any) => {
      console.log('Ride cancelled:', data);
      
      // Remove from requests or current ride
      setRideRequests(prev => prev.filter(req => req.rideId !== data.rideId));
      if (currentRide?.rideId === data.rideId) {
        setCurrentRide(null);
      }
    });

    const unsubscribeDriverStatusUpdated = socketService.on('driver_status_updated', (data: any) => {
      console.log('Driver status updated:', data);
      // You can show a toast notification here if needed
    });

    return () => {
      unsubscribeRideAssigned();
      unsubscribeRideActionSuccess();
      unsubscribeRideActionError();
      unsubscribeRideCancelled();
      unsubscribeDriverStatusUpdated();
    };
  }, [user, rideRequests, currentRide]);

  // Handle going online/offline
  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    if (user) {
      // Update driver status via socket
      socketService.emit('driver_status_update', {
        driverId: user.id,
        isOnline: newStatus,
        location: null // You can get current location here if needed
      });
      
      console.log(`Driver ${newStatus ? 'going online' : 'going offline'}`);
    }
  };

  // Handle accepting a ride request
  const handleAcceptRide = (rideId: string) => {
    socketService.emit('driver_accept_ride', {
      rideId,
      driverId: user?.id
    });
  };

  // Handle rejecting a ride request
  const handleRejectRide = (rideId: string) => {
    setRideRequests(prev => prev.filter(req => req.rideId !== rideId));
    console.log(`Rejected ride ${rideId}`);
  };

  // Handle driver arrived
  const handleDriverArrived = () => {
    if (!currentRide) return;
    
    socketService.emit('driver_arrived', {
      rideId: currentRide.rideId,
      driverId: user?.id
    });
    
    setCurrentRide(prev => prev ? { ...prev, status: 'arrived' } : null);
  };

  // Handle start ride
  const handleStartRide = () => {
    if (!currentRide) return;
    
    socketService.emit('start_ride', {
      rideId: currentRide.rideId,
      driverId: user?.id
    });
    
    setCurrentRide(prev => prev ? { ...prev, status: 'inProgress' } : null);
  };

  // Handle complete ride
  const handleCompleteRide = () => {
    if (!currentRide) return;
    
    const finalPrice = currentRide.estimatedPrice; // In real app, might be different
    
    socketService.emit('complete_ride', {
      rideId: currentRide.rideId,
      driverId: user?.id,
      actualPrice: finalPrice
    });
  };

  // CSS styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      padding: '1rem'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      padding: '1rem',
      backgroundColor: COLORS.card,
      borderRadius: '8px',
      boxShadow: STYLES.card.boxShadow
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: COLORS.text
    },
    onlineToggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    toggleButton: {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: isOnline ? '#28a745' : '#dc3545',
      color: 'white'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      ...STYLES.card,
      padding: '1rem',
      textAlign: 'center' as const
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: COLORS.primary,
      marginBottom: '0.25rem'
    },
    statLabel: {
      fontSize: '0.8rem',
      color: COLORS.textSecondary,
      textTransform: 'uppercase' as const
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
    requestCard: {
      ...STYLES.card,
      marginBottom: '1rem',
      padding: '1.5rem',
      border: `2px solid ${COLORS.primary}20`,
      position: 'relative' as const
    },
    urgentBadge: {
      position: 'absolute' as const,
      top: '1rem',
      right: '1rem',
      backgroundColor: '#ff6b6b',
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.7rem',
      fontWeight: 'bold'
    },
    locationRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.75rem'
    },
    locationIcon: {
      fontSize: '1.2rem',
      marginRight: '0.75rem',
      width: '20px'
    },
    locationText: {
      color: COLORS.text,
      fontSize: '0.9rem',
      flex: 1
    },
    rideInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      padding: '0.75rem',
      backgroundColor: COLORS.background,
      borderRadius: '6px'
    },
    rideInfoItem: {
      textAlign: 'center' as const
    },
    rideInfoValue: {
      fontSize: '1rem',
      fontWeight: 'bold',
      color: COLORS.text
    },
    rideInfoLabel: {
      fontSize: '0.7rem',
      color: COLORS.textSecondary,
      textTransform: 'uppercase' as const
    },
    actionButtons: {
      display: 'flex',
      gap: '0.75rem'
    },
    acceptButton: {
      flex: 1,
      padding: '0.75rem',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    rejectButton: {
      flex: 1,
      padding: '0.75rem',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    currentRideCard: {
      ...STYLES.card,
      padding: '1.5rem',
      border: `2px solid ${COLORS.primary}`,
      backgroundColor: `${COLORS.primary}10`
    },
    statusBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      marginBottom: '1rem',
      backgroundColor: COLORS.primary,
      color: 'white'
    },
    primaryButton: {
      width: '100%',
      padding: '1rem',
      backgroundColor: COLORS.primary,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      marginTop: '1rem'
    },
    secondaryButton: {
      width: '100%',
      padding: '1rem',
      backgroundColor: COLORS.border,
      color: COLORS.text,
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      marginTop: '0.5rem'
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '2rem',
      color: COLORS.textSecondary
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <h3>Please log in to access driver dashboard</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Driver Dashboard</h1>
        <div style={styles.onlineToggle}>
          <span style={{ color: COLORS.textSecondary }}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <button
            style={styles.toggleButton}
            onClick={toggleOnlineStatus}
          >
            {isOnline ? '🟢 Go Offline' : '🔴 Go Online'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>৳{earnings.today}</div>
          <div style={styles.statLabel}>Today's Earnings</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalRides}</div>
          <div style={styles.statLabel}>Total Rides</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>⭐ {stats.rating}</div>
          <div style={styles.statLabel}>Rating</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.acceptance}%</div>
          <div style={styles.statLabel}>Acceptance Rate</div>
        </div>
      </div>

      {/* Current Ride */}
      {currentRide && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Current Ride</h2>
          <div style={styles.currentRideCard}>
            <div style={styles.statusBadge}>
              {currentRide.status === 'accepted' && 'Ride Accepted - Head to Pickup'}
              {currentRide.status === 'arrived' && 'Arrived at Pickup - Wait for Passenger'}
              {currentRide.status === 'inProgress' && 'Ride in Progress'}
            </div>

            <div style={styles.locationRow}>
              <span style={styles.locationIcon}>📍</span>
              <span style={styles.locationText}>
                <strong>Pickup:</strong> {currentRide.pickupLocation.address}
              </span>
            </div>

            <div style={styles.locationRow}>
              <span style={styles.locationIcon}>🎯</span>
              <span style={styles.locationText}>
                <strong>Drop-off:</strong> {currentRide.dropoffLocation.address}
              </span>
            </div>

            <div style={styles.rideInfo}>
              <div style={styles.rideInfoItem}>
                <div style={styles.rideInfoValue}>৳{currentRide.estimatedPrice}</div>
                <div style={styles.rideInfoLabel}>Fare</div>
              </div>
              <div style={styles.rideInfoItem}>
                <div style={styles.rideInfoValue}>{currentRide.passengerName}</div>
                <div style={styles.rideInfoLabel}>Passenger</div>
              </div>
            </div>

            {currentRide.status === 'accepted' && (
              <button
                style={styles.primaryButton}
                onClick={handleDriverArrived}
              >
                📍 I've Arrived at Pickup
              </button>
            )}

            {currentRide.status === 'arrived' && (
              <button
                style={styles.primaryButton}
                onClick={handleStartRide}
              >
                🚗 Start Ride
              </button>
            )}

            {currentRide.status === 'inProgress' && (
              <button
                style={styles.primaryButton}
                onClick={handleCompleteRide}
              >
                ✅ Complete Ride
              </button>
            )}

            <button
              style={styles.secondaryButton}
              onClick={() => navigate(`/chat/${currentRide.rideId}`)}
            >
              💬 Message Passenger
            </button>
          </div>
        </div>
      )}

      {/* Ride Requests */}
      {isOnline && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Incoming Ride Requests ({rideRequests.length})
          </h2>

          {rideRequests.length === 0 ? (
            <div style={styles.emptyState}>
              <h3>🕒 Waiting for ride requests...</h3>
              <p>You're online and ready to receive ride requests</p>
            </div>
          ) : (
            rideRequests.map((request) => (
              <div key={request.rideId} style={styles.requestCard}>
                <div style={styles.urgentBadge}>NEW</div>

                <div style={styles.locationRow}>
                  <span style={styles.locationIcon}>📍</span>
                  <span style={styles.locationText}>
                    <strong>Pickup:</strong> {request.pickupLocation.address}
                  </span>
                </div>

                <div style={styles.locationRow}>
                  <span style={styles.locationIcon}>🎯</span>
                  <span style={styles.locationText}>
                    <strong>Drop-off:</strong> {request.dropoffLocation.address}
                  </span>
                </div>

                <div style={styles.rideInfo}>
                  <div style={styles.rideInfoItem}>
                    <div style={styles.rideInfoValue}>৳{request.estimatedPrice}</div>
                    <div style={styles.rideInfoLabel}>Fare</div>
                  </div>
                  <div style={styles.rideInfoItem}>
                    <div style={styles.rideInfoValue}>{request.rideType}</div>
                    <div style={styles.rideInfoLabel}>Type</div>
                  </div>
                  <div style={styles.rideInfoItem}>
                    <div style={styles.rideInfoValue}>{request.estimatedDistance.toFixed(1)} km</div>
                    <div style={styles.rideInfoLabel}>Distance</div>
                  </div>
                  <div style={styles.rideInfoItem}>
                    <div style={styles.rideInfoValue}>{request.paymentMethod}</div>
                    <div style={styles.rideInfoLabel}>Payment</div>
                  </div>
                </div>

                <div style={styles.actionButtons}>
                  <button
                    style={styles.acceptButton}
                    onClick={() => handleAcceptRide(request.rideId)}
                  >
                    ✅ Accept Ride
                  </button>
                  <button
                    style={styles.rejectButton}
                    onClick={() => handleRejectRide(request.rideId)}
                  >
                    ❌ Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!isOnline && (
        <div style={styles.emptyState}>
          <h3>📴 You're Currently Offline</h3>
          <p>Turn on "Online" status to start receiving ride requests</p>
        </div>
      )}
    </div>
  );
};

export default DriverHomeScreen; 
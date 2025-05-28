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

  // Add console logging at the start of component
  const userId = user?.id || (user as any)?._id || (user as any)?.userId;
  
  console.log('[DriverHomeScreen] Component rendered with user:', {
    user: user,
    userId: userId,
    userRole: user?.role,
    userIsDriver: user?.role === 'driver',
    socketConnected: socketService.isConnected()
  });

  // Setup socket listeners
  useEffect(() => {
    if (!user) {
      console.log('[DriverHomeScreen] No user found, skipping socket connection');
      return;
    }

    // Debug: Check what's actually in localStorage and the user object
    console.log('[DriverHomeScreen] Debug - Full user object:', JSON.stringify(user, null, 2));
    console.log('[DriverHomeScreen] Debug - localStorage auth_user:', localStorage.getItem('auth_user'));
    console.log('[DriverHomeScreen] Debug - localStorage user:', localStorage.getItem('user'));
    console.log('[DriverHomeScreen] Debug - Available user properties:', Object.keys(user));

    // Try to get user ID from various possible fields
    let userId = user.id || (user as any)._id || (user as any).userId;
    
    if (!userId) {
      // Try to get from localStorage directly
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('[DriverHomeScreen] Debug - Parsed stored user:', JSON.stringify(parsedUser, null, 2));
          userId = parsedUser.id || parsedUser._id || parsedUser.userId;
        }
      } catch (e) {
        console.error('[DriverHomeScreen] Error parsing stored user:', e);
      }
    }

    if (!userId) {
      console.error('[DriverHomeScreen] User ID is undefined! Full user object:', user);
      console.error('[DriverHomeScreen] Available fields:', Object.keys(user));
      alert('Error: User not properly authenticated. Please log out and log in again.');
      return;
    }

    console.log('[DriverHomeScreen] Setting up socket connection for user:', userId, user.name);

    // Initialize socket connection and setup listeners
    const initializeSocket = async () => {
      try {
        // Initialize socket connection
        console.log('[DriverHomeScreen] Connecting socket...');
        socketService.connect(userId);
        
        // Wait for connection to establish
        console.log('[DriverHomeScreen] Waiting for socket connection...');
        const connected = await socketService.waitForConnection(10000);
        
        if (!connected) {
          console.error('[DriverHomeScreen] Failed to establish socket connection');
          alert('Failed to connect to server. Please check your internet connection and try again.');
          return;
        }
        
        console.log('[DriverHomeScreen] Socket connected successfully, setting up listeners...');
        
        // Authenticate as driver
        socketService.emit('authenticate', {
          userId: userId,
          userType: 'driver'
        });
        
        // Setup all socket listeners after connection is established
        setupSocketListeners();
        
      } catch (error) {
        console.error('[DriverHomeScreen] Error initializing socket:', error);
        alert('Error connecting to server. Please refresh the page and try again.');
      }
    };

    // Setup socket listeners function
    const setupSocketListeners = () => {
      console.log('[DriverHomeScreen] Setting up socket event listeners...');
      
      // Listen for ride assignments
      const unsubscribeRideAssigned = socketService.on('ride_assigned', (data: any) => {
        console.log('[DriverHomeScreen] New ride request received:', data);
        
        if (!data.rideId || !data.passengerId) {
          console.error('[DriverHomeScreen] Invalid ride data received:', data);
          return;
        }
        
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
        
        console.log('[DriverHomeScreen] Adding ride request to state:', newRequest);
        setRideRequests(prev => [newRequest, ...prev]);
        
        // Play notification sound (if available)
        try {
          new Audio('/notification.mp3').play().catch(() => {});
        } catch (e) {}
      });

      const unsubscribeRideActionSuccess = socketService.on('ride_action_success', (data: any) => {
        console.log('[DriverHomeScreen] Ride action success:', data);
        
        if (data.action === 'accepted') {
          console.log('[DriverHomeScreen] Ride accepted, moving to current ride');
          // Move from requests to current ride
          const acceptedRequest = rideRequests.find(req => req.rideId === data.rideId);
          if (acceptedRequest) {
            console.log('[DriverHomeScreen] Found accepted request:', acceptedRequest);
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
          } else {
            console.error('[DriverHomeScreen] Could not find accepted request in state');
          }
        } else if (data.action === 'completed') {
          console.log('[DriverHomeScreen] Ride completed');
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
        console.log('[DriverHomeScreen] Driver status updated received:', data);
        
        // Update local state if the server confirms different status
        const userId = user?.id || (user as any)?._id || (user as any)?.userId;
        console.log('[DriverHomeScreen] Comparing driver IDs:', { received: data.driverId, current: userId });
        
        if (data.driverId === userId && data.isOnline !== undefined) {
          console.log('[DriverHomeScreen] Updating local online status:', { from: isOnline, to: data.isOnline });
          setIsOnline(data.isOnline);
        }
      });

      const unsubscribeRideTaken = socketService.on('ride_taken', (data: any) => {
        console.log('[DriverHomeScreen] Ride taken by another driver:', data);
        // Remove the ride from requests
        setRideRequests(prev => prev.filter(req => req.rideId !== data.rideId));
      });

      // Add listener for authentication confirmation
      const unsubscribeAuthenticated = socketService.on('authenticated', (data: any) => {
        console.log('[DriverHomeScreen] Authentication confirmed:', data);
      });

      // Add listener for ride request debugging
      const unsubscribeRideAssignedDebug = socketService.on('ride_assigned', (data: any) => {
        console.log('[DriverHomeScreen] === RIDE REQUEST DEBUG ===');
        console.log('[DriverHomeScreen] Raw ride_assigned data:', JSON.stringify(data, null, 2));
        console.log('[DriverHomeScreen] Current driver state:', {
          isOnline: isOnline,
          userId: user?.id || (user as any)?._id || (user as any)?.userId,
          socketConnected: socketService.isConnected()
        });
      });

      // Add listener for debug status response
      const unsubscribeDebugResponse = socketService.on('debug_driver_status_response', (data: any) => {
        console.log('[DriverHomeScreen] === SERVER DEBUG RESPONSE ===');
        console.log('[DriverHomeScreen] Server-side driver status:', JSON.stringify(data, null, 2));
        alert(`Server debug complete. Online drivers: ${data.onlineDrivers}/${data.totalDrivers}. Check console for details.`);
      });

      // Add listener for test connection response
      const unsubscribeTestResponse = socketService.on('test_connection_response', (data: any) => {
        console.log('[DriverHomeScreen] Test connection response:', data);
        alert(`Test successful! Server time: ${data.serverTime}`);
      });

      // Store cleanup functions for useEffect cleanup
      return () => {
        console.log('[DriverHomeScreen] Cleaning up socket listeners...');
        unsubscribeRideAssigned();
        unsubscribeRideActionSuccess();
        unsubscribeRideActionError();
        unsubscribeRideCancelled();
        unsubscribeDriverStatusUpdated();
        unsubscribeRideTaken();
        unsubscribeAuthenticated();
        unsubscribeRideAssignedDebug();
        unsubscribeDebugResponse();
        unsubscribeTestResponse();
      };
    };

    // Initialize socket connection
    initializeSocket();

    // Return cleanup function
    return () => {
      console.log('[DriverHomeScreen] Component unmounting, disconnecting socket...');
      socketService.disconnect();
    };
  }, [user]); // Remove rideRequests and currentRide from dependencies to avoid infinite loops

  // Handle going online/offline
  const toggleOnlineStatus = () => {
    // Try to get user ID from various possible fields
    const userId = user?.id || (user as any)?._id || (user as any)?.userId;
    
    if (!userId) {
      console.error('[DriverHomeScreen] Cannot toggle status: user ID is undefined');
      console.error('[DriverHomeScreen] User object:', user);
      alert('Error: User not properly authenticated. Please log out and log in again.');
      return;
    }

    if (!socketService.isConnected()) {
      console.error('[DriverHomeScreen] Cannot toggle status: socket not connected');
      alert('Error: Not connected to server. Please check your connection.');
      return;
    }

    const newStatus = !isOnline;
    console.log(`[DriverHomeScreen] === TOGGLE ONLINE STATUS ===`);
    console.log(`[DriverHomeScreen] Current status: ${isOnline}, New status: ${newStatus}`);
    console.log(`[DriverHomeScreen] Driver ID: ${userId}`);
    console.log(`[DriverHomeScreen] Socket connected: ${socketService.isConnected()}`);
    
    setIsOnline(newStatus);
    
    // Update driver status via socket
    const statusData = {
      driverId: userId,
      isOnline: newStatus,
      location: null // You can get current location here if needed
    };
    
    console.log(`[DriverHomeScreen] Sending driver_status_update:`, statusData);
    socketService.emit('driver_status_update', statusData);
    
    // Add a timeout to check if we get a response
    setTimeout(() => {
      console.log(`[DriverHomeScreen] Status update timeout check - Local: ${isOnline}, Expected: ${newStatus}`);
      if (isOnline !== newStatus) {
        console.warn('[DriverHomeScreen] Status update may have failed - no confirmation received');
      }
    }, 3000);
  };

  // Handle accepting a ride request
  const handleAcceptRide = (rideId: string) => {
    // Try to get user ID from various possible fields
    const userId = user?.id || (user as any)?._id || (user as any)?.userId;
    
    if (!userId) {
      console.error('[DriverHomeScreen] Cannot accept ride: user ID is undefined');
      console.error('[DriverHomeScreen] User object:', user);
      alert('Error: User not properly authenticated. Please log out and log in again.');
      return;
    }

    console.log(`[DriverHomeScreen] Accepting ride ${rideId} for driver ${userId}`);
    
    socketService.emit('driver_accept_ride', {
      rideId,
      driverId: userId
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
    
    const userId = user?.id || (user as any)?._id || (user as any)?.userId;
    
    socketService.emit('driver_arrived', {
      rideId: currentRide.rideId,
      driverId: userId
    });
    
    setCurrentRide(prev => prev ? { ...prev, status: 'arrived' } : null);
  };

  // Handle start ride
  const handleStartRide = () => {
    if (!currentRide) return;
    
    const userId = user?.id || (user as any)?._id || (user as any)?.userId;
    
    socketService.emit('start_ride', {
      rideId: currentRide.rideId,
      driverId: userId
    });
    
    setCurrentRide(prev => prev ? { ...prev, status: 'inProgress' } : null);
  };

  // Handle complete ride
  const handleCompleteRide = () => {
    if (!currentRide) return;
    
    const finalPrice = currentRide.estimatedPrice; // In real app, might be different
    const userId = user?.id || (user as any)?._id || (user as any)?.userId;
    
    socketService.emit('complete_ride', {
      rideId: currentRide.rideId,
      driverId: userId,
      actualPrice: finalPrice
    });
  };

  // CSS styles
  const styles = {
    container: {
      // Remove padding since MainLayout already provides it
      // padding: '1rem'
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

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          ...STYLES.card,
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          marginBottom: '1rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Debug Info</h4>
          <div style={{ fontSize: '0.8rem' }}>
            <div><strong>User ID:</strong> {user?.id || (user as any)?._id || (user as any)?.userId || 'undefined'}</div>
            <div><strong>User._id:</strong> {(user as any)?._id || 'undefined'}</div>
            <div><strong>User.id:</strong> {user?.id || 'undefined'}</div>
            <div><strong>User Name:</strong> {user?.name || 'undefined'}</div>
            <div><strong>User Role:</strong> {user?.role || 'undefined'}</div>
            <div><strong>Socket Connected:</strong> {socketService.isConnected() ? 'Yes' : 'No'}</div>
            <div><strong>Socket Status:</strong> {JSON.stringify(socketService.getStatus())}</div>
            <div><strong>Is Online:</strong> {isOnline ? 'Yes' : 'No'}</div>
            <div><strong>Ride Requests Count:</strong> {rideRequests.length}</div>
            <div><strong>Has Current Ride:</strong> {currentRide ? 'Yes' : 'No'}</div>
          </div>
          <button
            onClick={async () => {
              console.log('[DriverHomeScreen] Manual socket test');
              const userId = user?.id || (user as any)?._id || (user as any)?.userId;
              
              if (!userId) {
                console.error('[DriverHomeScreen] Cannot test connection: no user ID found');
                alert('Error: No user ID found');
                return;
              }

              console.log('[DriverHomeScreen] Checking socket connection...');
              
              if (!socketService.isConnected()) {
                console.log('[DriverHomeScreen] Socket not connected, attempting to connect...');
                socketService.connect(userId);
                
                const connected = await socketService.waitForConnection(5000);
                if (!connected) {
                  console.error('[DriverHomeScreen] Failed to connect socket for testing');
                  alert('Failed to connect to server. Please check your connection.');
                  return;
                }
                console.log('[DriverHomeScreen] Socket connected for testing');
              }

              console.log('[DriverHomeScreen] Sending test message...');
              socketService.emit('test_connection', { userId, timestamp: Date.now() });
              alert('Test message sent! Check console for server response.');
            }}
            style={{
              marginTop: '0.5rem',
              marginRight: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              backgroundColor: COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Socket Connection
          </button>
          
          <button
            onClick={() => {
              const userId = user?.id || (user as any)?._id || (user as any)?.userId;
              if (!userId) {
                alert('No user ID found');
                return;
              }
              
              console.log('[DriverHomeScreen] === DRIVER STATUS DEBUG ===');
              console.log('User ID:', userId);
              console.log('Socket Connected:', socketService.isConnected());
              console.log('Local Online Status:', isOnline);
              console.log('Socket Status:', socketService.getStatus());
              
              // Request backend to check driver status
              socketService.emit('debug_driver_status', { driverId: userId });
              alert('Debug info logged to console. Check backend logs for server-side status.');
            }}
            style={{
              marginTop: '0.5rem',
              marginRight: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Debug Driver Status
          </button>

          <button
            onClick={() => {
              if (!socketService.isConnected()) {
                alert('Socket not connected!');
                return;
              }
              
              console.log('[DriverHomeScreen] === SIMULATING RIDE REQUEST ===');
              
              // First, check and ensure driver is online
              const userId = user?.id || (user as any)?._id || (user as any)?.userId;
              if (!userId) {
                alert('No user ID found!');
                return;
              }
              
              // Force driver status update first
              console.log('[DriverHomeScreen] Ensuring driver is online before simulation...');
              socketService.emit('driver_status_update', {
                driverId: userId,
                isOnline: true,
                location: {
                  latitude: 23.8103,
                  longitude: 90.4125
                }
              });
              
              // Wait a moment for status update, then simulate ride request
              setTimeout(() => {
                console.log('[DriverHomeScreen] Simulating ride request...');
                
                // Simulate a ride request
                const mockRideRequest = {
                  userId: 'test_passenger_123',
                  pickupLocation: {
                    address: 'Test Pickup Address, Dhanmondi, Dhaka',
                    latitude: 23.8103,
                    longitude: 90.4125
                  },
                  dropoffLocation: {
                    address: 'Test Dropoff Address, Gulshan, Dhaka',  
                    latitude: 23.8203,
                    longitude: 90.4225
                  },
                  rideType: 'standard',
                  paymentMethod: 'cash',
                  estimatedPrice: 150,
                  estimatedDistance: 5.2
                };
                
                console.log('[DriverHomeScreen] Sending mock ride request:', mockRideRequest);
                socketService.emit('ride_request', mockRideRequest);
                
                // Also manually emit debug to check driver status after request
                setTimeout(() => {
                  socketService.emit('debug_driver_status', { driverId: userId });
                }, 2000);
                
              }, 1000);
              
              alert('Simulated ride request sent! Driver status updated. Check console and wait for ride assignment.');
            }}
            style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Simulate Ride Request
          </button>

          <button
            onClick={() => {
              const userId = user?.id || (user as any)?._id || (user as any)?.userId;
              if (!userId || !socketService.isConnected()) {
                alert('Socket not connected or no user ID!');
                return;
              }
              
              console.log('[DriverHomeScreen] Sending force test ride request to self');
              
              socketService.emit('force_test_ride_request', { targetDriverId: userId });
              
              // Listen for response
              const cleanup = socketService.on('test_ride_sent', (data: any) => {
                console.log('[DriverHomeScreen] Test ride sent confirmation:', data);
                alert(`Force test ride sent! Ride ID: ${data.rideId}`);
                cleanup();
              });
              
              alert('Force test ride request sent directly to you!');
            }}
            style={{
              marginTop: '0.5rem',
              marginRight: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Force Test Direct Ride
          </button>

          <button
            onClick={() => {
              const userId = user?.id || (user as any)?._id || (user as any)?.userId;
              if (!userId || !socketService.isConnected()) {
                alert('Socket not connected or no user ID!');
                return;
              }
              
              console.log('[DriverHomeScreen] Checking socket rooms');
              
              socketService.emit('debug_socket_rooms', { userId });
              
              // Listen for response
              const cleanup = socketService.on('debug_socket_rooms_response', (data: any) => {
                console.log('[DriverHomeScreen] Socket rooms debug response:', data);
                alert(`Socket rooms: ${JSON.stringify(data.rooms)}. Check console for details.`);
                cleanup();
              });
            }}
            style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Check Socket Rooms
          </button>

          <button
            onClick={() => {
              console.log('[DriverHomeScreen] === SIMPLE BROADCAST TEST ===');
              
              // Simple ride request that should broadcast to all drivers
              const simpleRideRequest = {
                userId: 'customer_test_123',
                pickupLocation: {
                  address: 'Simple Test Pickup, Dhaka',
                  latitude: 23.8103,
                  longitude: 90.4125
                },
                dropoffLocation: {
                  address: 'Simple Test Dropoff, Dhaka',  
                  latitude: 23.8203,
                  longitude: 90.4225
                },
                rideType: 'standard',
                paymentMethod: 'cash',
                estimatedPrice: 200,
                estimatedDistance: 6.0
              };
              
              console.log('[DriverHomeScreen] Sending simple broadcast test:', simpleRideRequest);
              socketService.emit('ride_request', simpleRideRequest);
              alert('Simple broadcast test sent! All connected drivers should receive this ride request.');
            }}
            style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Simple Broadcast Test
          </button>

          <button
            onClick={() => {
              console.log('[DriverHomeScreen] === REAL USER RIDE REQUEST TEST ===');
              
              // Test with a real user-like ride request format similar to RideOptionsScreen
              const realUserRequest = {
                userId: userId || 'test_user_passenger', // Use current user or test user
                passengerId: userId || 'test_user_passenger',
                passengerName: user?.name || 'Test Passenger',
                pickupLocation: {
                  address: 'Real User Test Pickup, Dhaka',
                  latitude: 23.8103,
                  longitude: 90.4125
                },
                dropoffLocation: {
                  address: 'Real User Test Dropoff, Dhaka',  
                  latitude: 23.8203,
                  longitude: 90.4225
                },
                rideType: 'standard',
                paymentMethod: 'cash',
                estimatedPrice: 250,
                estimatedDistance: 7.5,
                requestTime: new Date().toISOString()
              };
              
              console.log('[DriverHomeScreen] Sending real user format test:', realUserRequest);
              socketService.emit('ride_request', realUserRequest);
              alert('Real user format test sent! This mimics how passengers send requests.');
            }}
            style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              backgroundColor: '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Real User Request
          </button>
        </div>
      )}

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
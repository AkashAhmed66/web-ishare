import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/apiConfig';
import { Location } from './rideService';

// Socket event types
export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',
  RIDER_LOCATION = 'rider:location',
  DRIVER_LOCATION = 'driver:location',
  RIDE_REQUEST = 'ride:request',
  RIDE_ACCEPTED = 'ride:accepted',
  RIDE_REJECTED = 'ride:rejected',
  RIDE_CANCELLED = 'ride:cancelled',
  RIDE_STARTED = 'ride:started',
  RIDE_COMPLETED = 'ride:completed',
  DRIVER_ARRIVED = 'driver:arrived',
  NEW_MESSAGE = 'message:new',
  LOCATION_UPDATE = 'location:update',
  NOTIFICATION = 'notification',
}

// Driver location interface
export interface DriverLocation extends Location {
  driverId: string;
  heading: number;
  timestamp: number;
}

// Rider location interface
export interface RiderLocation extends Location {
  riderId: string;
  timestamp: number;
}

// Socket connection wrapper
class SocketService {
  private socket: Socket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  // Initialize socket connection
  connect(userId: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    // Clean up any existing connection
    this.disconnect();

    console.log(`[SocketService] Connecting with userId: ${userId} to ${SOCKET_URL}`);

    // Create new socket connection
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 10000,
    });

    // Set up event listeners
    this.setupListeners();

    return this.socket;
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // Set up basic event listeners
  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on(SocketEvent.CONNECT, () => {
      console.log('[SocketService] Socket connected successfully');
    });

    this.socket.on(SocketEvent.DISCONNECT, (reason) => {
      console.log(`[SocketService] Socket disconnected: ${reason}`);
    });

    this.socket.on(SocketEvent.CONNECT_ERROR, (error) => {
      console.error('[SocketService] Socket connection error:', error);
    });

    this.socket.on('authenticated', (data: any) => {
      console.log('[SocketService] Socket authenticated:', data);
    });

    this.socket.on('driver_status_updated', (data: any) => {
      console.log('[SocketService] Driver status updated:', data);
    });
  }

  // Add event listener
  on<T>(event: SocketEvent | string, callback: (data: T) => void): () => void {
    if (!this.socket) {
      console.warn(`[SocketService] Cannot add listener for ${event}: socket not initialized`);
      // Return a no-op function instead of throwing an error
      return () => {};
    }

    // Add to socket.io
    this.socket.on(event, callback);

    // Store in listeners map for potential reconnect handling
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    // Return function to remove listener
    return () => {
      this.off(event, callback);
    };
  }

  // Remove event listener
  off(event: SocketEvent | string, callback: (data: any) => void): void {
    if (!this.socket) return;

    this.socket.off(event, callback);

    // Remove from listeners map
    const listeners = this.listeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
      this.listeners.set(event, listeners);
    }
  }

  // Emit event
  emit<T>(event: SocketEvent | string, data: T): void {
    if (!this.socket) {
      console.error(`[SocketService] Cannot emit ${event}: socket not initialized`);
      return;
    }

    if (!this.socket.connected) {
      console.error(`[SocketService] Cannot emit ${event}: socket not connected`);
      return;
    }

    console.log(`[SocketService] Emitting event: ${event}`, data);
    this.socket.emit(event, data);
  }

  // Update driver location
  updateDriverLocation(location: Location): void {
    this.emit(SocketEvent.DRIVER_LOCATION, {
      ...location,
      timestamp: Date.now(),
    });
  }

  // Update rider location
  updateRiderLocation(location: Location): void {
    this.emit(SocketEvent.RIDER_LOCATION, {
      ...location,
      timestamp: Date.now(),
    });
  }

  // Request a ride
  requestRide(rideDetails: {
    userId: string;
    pickupLocation: Location;
    dropoffLocation: Location;
    rideType: string;
    paymentMethod: string;
    estimatedPrice: number;
    estimatedDistance?: number;
    vehicleDetails?: any;
  }): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot request ride: socket not connected');
      return;
    }

    if (!rideDetails.userId) {
      console.error('Cannot request ride: userId is required');
      return;
    }

    // Add missing fields that the backend expects
    const rideRequest = {
      ...rideDetails,
      passengerId: rideDetails.userId,
      passengerName: `User ${rideDetails.userId.slice(-4) || 'Unknown'}`, // Safe slice with fallback
      requestTime: new Date().toISOString()
    };

    console.log('[SocketService] Sending ride request:', rideRequest);
    this.socket.emit('ride_request', rideRequest);
  }

  // Accept ride (for drivers)
  acceptRide(rideId: string, driverId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot accept ride: socket not connected');
      return;
    }

    this.socket.emit('driver_accept_ride', { rideId, driverId });
  }

  // Start ride (for drivers)
  startRide(rideId: string, driverId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot start ride: socket not connected');
      return;
    }

    this.socket.emit('ride_started', { rideId, driverId });
  }

  // Complete ride (for drivers)
  completeRide(rideId: string, driverId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot complete ride: socket not connected');
      return;
    }

    this.socket.emit('ride_completed', { rideId, driverId });
  }

  // Cancel ride
  cancelRide(rideId: string, reason?: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot cancel ride: socket not connected');
      return;
    }

    // Get user ID from localStorage or auth state
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    let userId = null;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.id;
      } catch (e) {
        console.error('Error parsing user data');
      }
    }

    this.socket.emit('cancel_ride', { 
      rideId, 
      userId,
      reason: reason || 'Cancelled by user'
    });
  }

  // Check if socket is connected
  isConnected(): boolean {
    return !!this.socket && this.socket.connected;
  }

  // Wait for socket connection (with timeout)
  async waitForConnection(timeoutMs: number = 5000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isConnected()) {
        resolve(true);
        return;
      }

      if (!this.socket) {
        resolve(false);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(false);
      }, timeoutMs);

      this.socket.once('connect', () => {
        clearTimeout(timeout);
        resolve(true);
      });

      this.socket.once('connect_error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  // Get socket status for debugging
  getStatus(): {
    socketExists: boolean;
    isConnected: boolean;
    socketId: string | null;
    url: string;
  } {
    return {
      socketExists: !!this.socket,
      isConnected: this.isConnected(),
      socketId: this.socket?.id || null,
      url: SOCKET_URL,
    };
  }
}

// Create singleton instance
export const socketService = new SocketService();

export default socketService; 
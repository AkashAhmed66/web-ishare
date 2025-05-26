import apiService from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';

// Ride interface
export interface Ride {
  id: string;
  userId: string;
  driverId?: string;
  pickup: Location;
  destination: Location;
  status: RideStatus;
  fare: number;
  distance: number;
  duration: number;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
}

// Location interface
export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

// Ride status type
export type RideStatus = 
  | 'requested' 
  | 'accepted' 
  | 'arrived' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

// New ride data interface
export interface CreateRideData {
  pickup: Location;
  destination: Location;
  scheduledFor?: string;
  recurring?: {
    frequency: 'daily' | 'weekly';
    days?: number[]; // 0-6 for days of week
    endDate: string;
  };
}

// Update ride status data
export interface UpdateRideStatusData {
  status: RideStatus;
  currentLocation?: Location;
}

// Ride price estimate response
export interface RidePriceEstimate {
  estimatedFare: number;
  distance: number;
  duration: number;
  currency: string;
}

// Create a new ride
const createRide = async (data: CreateRideData): Promise<Ride> => {
  try {
    return await apiService.post<Ride>(API_ENDPOINTS.CREATE_RIDE, data);
  } catch (error) {
    console.error('Failed to create ride:', error);
    throw error;
  }
};

// Get price estimate for a ride
const getPriceEstimate = async (pickup: Location, destination: Location): Promise<RidePriceEstimate> => {
  try {
    const params = {
      pickupLat: pickup.latitude,
      pickupLng: pickup.longitude,
      destLat: destination.latitude,
      destLng: destination.longitude,
    };
    
    return await apiService.get<RidePriceEstimate>('/api/rides/price-estimate', params);
  } catch (error) {
    console.error('Failed to get price estimate:', error);
    throw error;
  }
};

// Get ride by ID
const getRideById = async (id: string): Promise<Ride> => {
  try {
    return await apiService.get<Ride>(API_ENDPOINTS.RIDE_DETAILS(id));
  } catch (error) {
    console.error(`Failed to get ride ${id}:`, error);
    throw error;
  }
};

// Get all rides for current user
const getUserRides = async (status?: RideStatus): Promise<Ride[]> => {
  try {
    const params = status ? { status } : undefined;
    return await apiService.get<Ride[]>(API_ENDPOINTS.USER_RIDES, params);
  } catch (error) {
    console.error('Failed to get user rides:', error);
    throw error;
  }
};

// Update ride status
const updateRideStatus = async (rideId: string, data: UpdateRideStatusData): Promise<Ride> => {
  try {
    return await apiService.patch<Ride>(API_ENDPOINTS.UPDATE_RIDE_STATUS(rideId), data);
  } catch (error) {
    console.error(`Failed to update ride ${rideId} status:`, error);
    throw error;
  }
};

// Cancel a ride
const cancelRide = async (rideId: string, reason?: string): Promise<Ride> => {
  try {
    return await apiService.patch<Ride>(API_ENDPOINTS.UPDATE_RIDE_STATUS(rideId), {
      status: 'cancelled',
      cancellationReason: reason,
    });
  } catch (error) {
    console.error(`Failed to cancel ride ${rideId}:`, error);
    throw error;
  }
};

// Schedule a ride
const scheduleRide = async (data: CreateRideData): Promise<Ride> => {
  try {
    if (!data.scheduledFor) {
      throw new Error('scheduledFor date is required for scheduling a ride');
    }
    
    return await apiService.post<Ride>(API_ENDPOINTS.SCHEDULE_RIDE, data);
  } catch (error) {
    console.error('Failed to schedule ride:', error);
    throw error;
  }
};

// Get recurring rides
const getRecurringRides = async (): Promise<Ride[]> => {
  try {
    return await apiService.get<Ride[]>(API_ENDPOINTS.RECURRING_RIDES);
  } catch (error) {
    console.error('Failed to get recurring rides:', error);
    throw error;
  }
};

// Ride service object with all functions
export const rideService = {
  createRide,
  getPriceEstimate,
  getRideById,
  getUserRides,
  updateRideStatus,
  cancelRide,
  scheduleRide,
  getRecurringRides,
};

export default rideService; 
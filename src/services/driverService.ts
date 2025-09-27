import apiService from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';

// Driver registration data interface
export interface DriverRegistrationData {
  licenseNumber: string;
  licenseExpiryDate: string;
  vehicleDetails: {
    type?: string;
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  documents?: {
    driverLicense?: string;
    vehicleRegistration?: string;
    insurance?: string;
    profilePhoto?: string;
  };
  bankingInfo?: {
    accountNumber?: string;
    routingNumber?: string;
    taxId?: string;
  };
}

// Driver info interface
export interface DriverInfo {
  licenseNumber: string;
  licenseExpiryDate: string;
  vehicleDetails: {
    type?: string;
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  documents?: {
    driverLicense?: string;
    vehicleRegistration?: string;
    insurance?: string;
    profilePhoto?: string;
  };
  bankingInfo?: {
    accountNumber?: string;
    routingNumber?: string;
    taxId?: string;
  };
  applicationStatus?: 'pending' | 'approved' | 'rejected' | 'under_review';
  isActive: boolean;
  isVerified: boolean;
  registrationDate?: Date;
  approvalDate?: Date;
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
}

// Register as driver
const registerDriver = async (data: DriverRegistrationData): Promise<any> => {
  try {
    const response = await apiService.post(API_ENDPOINTS.DRIVER_REGISTER, data);
    return response;
  } catch (error) {
    console.error('Driver registration failed:', error);
    throw error;
  }
};

// Update driver availability
const updateAvailability = async (isActive: boolean): Promise<any> => {
  try {
    const response = await apiService.put('/api/drivers/availability', { isActive });
    return response;
  } catch (error) {
    console.error('Failed to update driver availability:', error);
    throw error;
  }
};

// Update driver location
const updateLocation = async (latitude: number, longitude: number): Promise<any> => {
  try {
    const response = await apiService.put('/api/drivers/location', { latitude, longitude });
    return response;
  } catch (error) {
    console.error('Failed to update driver location:', error);
    throw error;
  }
};

// Get driver stats
const getDriverStats = async (): Promise<any> => {
  try {
    const response = await apiService.get('/api/drivers/stats');
    return response;
  } catch (error) {
    console.error('Failed to get driver stats:', error);
    throw error;
  }
};

// Get driver rides
const getDriverRides = async (page = 1, limit = 10, status?: string): Promise<any> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }
    
    const response = await apiService.get(`/api/drivers/rides?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Failed to get driver rides:', error);
    throw error;
  }
};

// Get current ride
const getCurrentRide = async (): Promise<any> => {
  try {
    const response = await apiService.get('/api/drivers/rides/current');
    return response;
  } catch (error) {
    console.error('Failed to get current ride:', error);
    throw error;
  }
};

// Accept ride
const acceptRide = async (rideId: string): Promise<any> => {
  try {
    const response = await apiService.put(`/api/drivers/rides/${rideId}/accept`);
    return response;
  } catch (error) {
    console.error('Failed to accept ride:', error);
    throw error;
  }
};

// Arrive at pickup
const arriveAtPickup = async (rideId: string): Promise<any> => {
  try {
    const response = await apiService.put(`/api/drivers/rides/${rideId}/arrive`);
    return response;
  } catch (error) {
    console.error('Failed to arrive at pickup:', error);
    throw error;
  }
};

// Start ride
const startRide = async (rideId: string): Promise<any> => {
  try {
    const response = await apiService.put(`/api/drivers/rides/${rideId}/start`);
    return response;
  } catch (error) {
    console.error('Failed to start ride:', error);
    throw error;
  }
};

// Complete ride
const completeRide = async (rideId: string, actualDistance?: number, actualDuration?: number): Promise<any> => {
  try {
    const data: any = {};
    if (actualDistance !== undefined) data.actualDistance = actualDistance;
    if (actualDuration !== undefined) data.actualDuration = actualDuration;
    
    const response = await apiService.put(`/api/drivers/rides/${rideId}/complete`, data);
    return response;
  } catch (error) {
    console.error('Failed to complete ride:', error);
    throw error;
  }
};

// Driver service object with all functions
export const driverService = {
  registerDriver,
  updateAvailability,
  updateLocation,
  getDriverStats,
  getDriverRides,
  getCurrentRide,
  acceptRide,
  arriveAtPickup,
  startRide,
  completeRide,
};

export default driverService; 
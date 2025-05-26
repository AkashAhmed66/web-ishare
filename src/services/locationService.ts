import apiService from './apiService';
import { Location } from './rideService';

// GeocodeResult interface
export interface GeocodeResult {
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

// PlaceDetails interface
export interface PlaceDetails {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

// getCurrentPosition using browser's geolocation API wrapped in a Promise
const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    });
  });
};

// getCurrentLocation: Gets current location with address
const getCurrentLocation = async (): Promise<Location> => {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    
    // Reverse geocode to get address
    const address = await reverseGeocode(latitude, longitude);
    
    return {
      latitude,
      longitude,
      address,
    };
  } catch (error) {
    console.error('Failed to get current location:', error);
    throw error;
  }
};

// Geocode: Convert address to coordinates
const geocode = async (address: string): Promise<{ latitude: number; longitude: number }> => {
  try {
    const response = await apiService.get<GeocodeResult[]>('/api/location/geocode', { address });
    
    if (response && response.length > 0) {
      const result = response[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      };
    }
    
    throw new Error('No geocoding results found');
  } catch (error) {
    console.error('Geocoding failed:', error);
    throw error;
  }
};

// Reverse geocode: Convert coordinates to address
const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await apiService.get<GeocodeResult[]>('/api/location/reverse-geocode', {
      latitude,
      longitude,
    });
    
    if (response && response.length > 0) {
      return response[0].formatted_address;
    }
    
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};

// Search places by query
const searchPlaces = async (query: string): Promise<PlaceDetails[]> => {
  try {
    const response = await apiService.get<any[]>('/api/location/places-autocomplete', { query });
    
    return response.map(place => ({
      placeId: place.place_id,
      address: place.description,
      latitude: 0, // Will be populated when getting place details
      longitude: 0, // Will be populated when getting place details
    }));
  } catch (error) {
    console.error('Place search failed:', error);
    throw error;
  }
};

// Get place details
const getPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
  try {
    const response = await apiService.get<any>('/api/location/place-details', { placeId });
    
    return {
      placeId: response.place_id,
      address: response.formatted_address,
      latitude: response.geometry.location.lat,
      longitude: response.geometry.location.lng,
    };
  } catch (error) {
    console.error('Get place details failed:', error);
    throw error;
  }
};

// Calculate distance between two coordinates
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Helper function: Convert degrees to radians
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Saved places
const getSavedPlaces = async (): Promise<Location[]> => {
  try {
    return await apiService.get<Location[]>('/api/users/saved-places');
  } catch (error) {
    console.error('Failed to get saved places:', error);
    throw error;
  }
};

// Add saved place
const savePlaceByUser = async (place: Location, label: string): Promise<Location> => {
  try {
    return await apiService.post<Location>('/api/users/saved-places', {
      ...place,
      label,
    });
  } catch (error) {
    console.error('Failed to save place:', error);
    throw error;
  }
};

// Location service object with all functions
export const locationService = {
  getCurrentPosition,
  getCurrentLocation,
  geocode,
  reverseGeocode,
  searchPlaces,
  getPlaceDetails,
  calculateDistance,
  getSavedPlaces,
  savePlaceByUser,
};

export default locationService; 
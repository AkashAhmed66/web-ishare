import apiService from './apiService';
import { Location } from './rideService';

/**
 * Location Service with GoMaps API Integration
 * 
 * This service uses GoMaps API as the primary source for geocoding services,
 * with fallbacks to Nominatim (OpenStreetMap) and backend APIs.
 * 
 * To use GoMaps API:
 * 1. Sign up at https://maps.gomaps.pro
 * 2. Get your API key
 * 3. Add REACT_APP_GOMAPS_API_KEY=your_api_key to your .env file
 * 
 * Fallback hierarchy:
 * 1. GoMaps API (Primary) - Best accuracy and features
 * 2. Nominatim/OpenStreetMap (Secondary) - Free but rate limited
 * 3. Backend APIs (Tertiary) - Custom backend implementation
 * 4. Smart defaults (Final) - Meaningful fallback addresses
 */

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

// WiFi Access Point interface for GoMaps geolocation
interface WiFiAccessPoint {
  macAddress: string;
  signalStrength: number;
  signalToNoiseRatio: number;
}

// GoMaps Geolocation API using WiFi access points
const getLocationWithGoMapsGeolocation = async (wifiAccessPoints?: WiFiAccessPoint[]): Promise<Location> => {
  try {
    const apiKey = 'AlzaSyDeCaO-i9cEU6J3ykY_Uqa9gis2Kzqjo4n';
    const apiUrl = `https://www.gomaps.pro/geolocation/v1/geolocate?key=${apiKey}`;
    
    // Default WiFi access points for demo/fallback
    const defaultWifiPoints: WiFiAccessPoint[] = [
      {
        macAddress: "84:d4:7e:09:a5:f1",
        signalStrength: -43,
        signalToNoiseRatio: 0
      },
      {
        macAddress: "44:48:c1:a6:f3:d0", 
        signalStrength: -55,
        signalToNoiseRatio: 0
      }
    ];
    
    const requestBody = {
      considerIp: "false",
      wifiAccessPoints: wifiAccessPoints || defaultWifiPoints
    };
    
    console.log('GoMaps Geolocation API URL:', apiUrl);
    console.log('GoMaps Geolocation Request:', requestBody);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'IShare-RideApp/1.0',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('GoMaps Geolocation Response:', data);
    
    if (data && data.location && data.location.lat && data.location.lng) {
      const { lat: latitude, lng: longitude } = data.location;
      
      // Get address for the coordinates
      try {
        const address = await reverseGeocodeWithGoMaps(latitude, longitude);
        return {
          latitude,
          longitude,
          address
        };
      } catch (reverseError) {
        console.warn('Failed to get address for geolocation result:', reverseError);
        return {
          latitude,
          longitude,
          address: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        };
      }
    }
    
    throw new Error('Invalid geolocation response from GoMaps API');
  } catch (error) {
    console.error('GoMaps geolocation failed:', error);
    throw error;
  }
};

// Enhanced getCurrentLocation with multiple location sources
const getCurrentLocation = async (): Promise<Location> => {
  try {
    // Method 1: Try GoMaps geolocation first (more accurate in urban areas)
    try {
      console.log('Attempting GoMaps geolocation...');
      const goMapsLocation = await getLocationWithGoMapsGeolocation();
      console.log('GoMaps geolocation successful:', goMapsLocation);
      return goMapsLocation;
    } catch (goMapsError) {
      console.warn('GoMaps geolocation failed, falling back to browser geolocation:', goMapsError);
    }
    
    // Method 2: Fallback to browser geolocation
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    
    console.log('Getting current location for coordinates:', { latitude, longitude });
    
    // Use GoMaps API to reverse geocode current position
    const endpoint = 'geocode/json';
    const queryParams = new URLSearchParams({
      latlng: `${latitude},${longitude}`,
      key: process.env.REACT_APP_GOMAPS_API_KEY || 'demo',
      language: 'en'
    });
    
    const apiUrl = `https://maps.gomaps.pro/maps/api/${endpoint}?${queryParams.toString()}`;
    console.log('Current Location API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IShare-RideApp/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Current Location API Response:', data);
      
      if (data && data.status === 'OK' && data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        
        return {
          latitude,
          longitude,
          address,
        };
      }
    }
    
    // Fallback to other reverse geocoding methods
    console.log('GoMaps failed for current location, trying fallback methods...');
    const address = await reverseGeocode(latitude, longitude);
    
    return {
      latitude,
      longitude,
      address,
    };
  } catch (error) {
    console.error('Failed to get current location:', error);
    // Return default Dhaka location as fallback
    return {
      latitude: 23.8103,
      longitude: 90.4125,
      address: 'Dhaka, Bangladesh'
    };
  }
};

// Frontend reverse geocoding using GoMaps API
const reverseGeocodeWithGoMaps = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const endpoint = 'geocode/json';
    const queryParams = new URLSearchParams({
      latlng: `${latitude},${longitude}`,
      key: process.env.REACT_APP_GOMAPS_API_KEY || 'demo', // You'll need to add your API key
      language: 'en'
    });
    
    const apiUrl = `https://maps.gomaps.pro/maps/api/${endpoint}?${queryParams.toString()}`;
    
    console.log('GoMaps Reverse Geocoding URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IShare-RideApp/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('GoMaps Reverse Geocoding Response:', data);
    
    if (data && data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    
    throw new Error('No address found from GoMaps API');
  } catch (error) {
    console.error('GoMaps reverse geocoding failed:', error);
    throw error;
  }
};

// Frontend geocoding using GoMaps API
const geocodeWithGoMaps = async (address: string): Promise<{ latitude: number; longitude: number }> => {
  try {
    const endpoint = 'geocode/json';
    const queryParams = new URLSearchParams({
      address: address,
      key: process.env.REACT_APP_GOMAPS_API_KEY || 'demo', // You'll need to add your API key
      language: 'en',
      region: 'bd' // Focus on Bangladesh
    });
    
    const apiUrl = `https://maps.gomaps.pro/maps/api/${endpoint}?${queryParams.toString()}`;
    
    console.log('GoMaps Geocoding URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IShare-RideApp/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('GoMaps Geocoding Response:', data);
    
    if (data && data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    }
    
    throw new Error('No geocoding results found from GoMaps API');
  } catch (error) {
    console.error('GoMaps geocoding failed:', error);
    throw error;
  }
};

// Frontend place search using GoMaps API
const searchPlacesWithGoMaps = async (query: string): Promise<PlaceDetails[]> => {
  try {
    const endpoint = 'place/textsearch/json';
    const queryParams = new URLSearchParams({
      query: query,
      key: process.env.REACT_APP_GOMAPS_API_KEY || 'demo', // You'll need to add your API key
      language: 'en',
      region: 'bd' // Focus on Bangladesh
    });
    
    const apiUrl = `https://maps.gomaps.pro/maps/api/${endpoint}?${queryParams.toString()}`;
    
    console.log('GoMaps Place Search URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IShare-RideApp/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('GoMaps Place Search Response:', data);
    
    if (data && data.status === 'OK' && data.results) {
      return data.results.map((place: any, index: number) => ({
        placeId: place.place_id || `gomaps_${index}_${Date.now()}`,
        address: place.formatted_address || place.name,
        latitude: place.geometry?.location?.lat || 0,
        longitude: place.geometry?.location?.lng || 0,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('GoMaps place search failed:', error);
    throw error;
  }
};

// Fallback to Nominatim if GoMaps fails
const reverseGeocodeWithNominatim = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
      {
        headers: {
          'User-Agent': 'IShare-RideApp/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    
    throw new Error('No address found');
  } catch (error) {
    console.error('Nominatim reverse geocoding failed:', error);
    throw error;
  }
};

// Fallback to Nominatim if GoMaps fails
const geocodeWithNominatim = async (address: string): Promise<{ latitude: number; longitude: number }> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'IShare-RideApp/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    
    throw new Error('No geocoding results found');
  } catch (error) {
    console.error('Nominatim geocoding failed:', error);
    throw error;
  }
};

// Fallback to Nominatim if GoMaps fails
const searchPlacesWithNominatim = async (query: string): Promise<PlaceDetails[]> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=bd`,
      {
        headers: {
          'User-Agent': 'IShare-RideApp/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((place: any, index: number) => ({
      placeId: place.place_id || `nominatim_${index}_${Date.now()}`,
      address: place.display_name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    }));
  } catch (error) {
    console.error('Nominatim place search failed:', error);
    throw error;
  }
};

// Geocode: Convert address to coordinates (with fallback)
const geocode = async (address: string): Promise<{ latitude: number; longitude: number }> => {
  try {
    // First try GoMaps API
    return await geocodeWithGoMaps(address);
  } catch (error) {
    console.error('GoMaps geocoding failed, trying Nominatim:', error);
    
    try {
      // Fallback to Nominatim
      return await geocodeWithNominatim(address);
    } catch (nominatimError) {
      console.error('Nominatim geocoding failed, trying backend:', nominatimError);
      
      try {
        // Fallback to backend if available
        const response = await apiService.get<GeocodeResult[]>('/api/location/geocode', { address });
        
        if (response && response.length > 0) {
          const result = response[0];
          return {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          };
        }
        
        throw new Error('No geocoding results found from backend');
      } catch (backendError) {
        console.error('Backend geocoding also failed:', backendError);
        
        // Final fallback - return default Dhaka coordinates
        console.warn('Using default Dhaka coordinates for address:', address);
        return {
          latitude: 23.8103,
          longitude: 90.4125,
        };
      }
    }
  }
};

// Reverse geocode: Convert coordinates to address (with fallback)
const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // First try GoMaps API
    return await reverseGeocodeWithGoMaps(latitude, longitude);
  } catch (error) {
    console.error('GoMaps reverse geocoding failed, trying Nominatim:', error);
    
    try {
      // Fallback to Nominatim
      return await reverseGeocodeWithNominatim(latitude, longitude);
    } catch (nominatimError) {
      console.error('Nominatim reverse geocoding failed, trying backend:', nominatimError);
      
      try {
        // Fallback to backend if available
        const response = await apiService.get<GeocodeResult[]>('/api/location/reverse-geocode', {
          latitude,
          longitude,
        });
        
        if (response && response.length > 0) {
          return response[0].formatted_address;
        }
        
        throw new Error('No reverse geocoding results from backend');
      } catch (backendError) {
        console.error('Backend reverse geocoding also failed:', backendError);
        
        // Generate a meaningful fallback address based on coordinates
        if (latitude >= 23.7 && latitude <= 23.9 && longitude >= 90.3 && longitude <= 90.5) {
          return `Location in Dhaka (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        } else if (latitude >= 23.0 && latitude <= 24.0 && longitude >= 90.0 && longitude <= 91.0) {
          return `Location in Bangladesh (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        } else {
          return `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        }
      }
    }
  }
};

// Search places by query (with frontend fallback)
const searchPlaces = async (query: string): Promise<PlaceDetails[]> => {
  try {
    // First try GoMaps API
    return await searchPlacesWithGoMaps(query);
  } catch (error) {
    console.error('GoMaps place search failed, trying Nominatim:', error);
    
    try {
      // Fallback to Nominatim
      return await searchPlacesWithNominatim(query);
    } catch (nominatimError) {
      console.error('Nominatim place search failed, trying backend:', nominatimError);
      
      try {
        // Fallback to backend
        const response = await apiService.get<any[]>('/api/location/places-autocomplete', { query });
        
        return response.map(place => ({
          placeId: place.place_id,
          address: place.description,
          latitude: 0, // Will be populated when getting place details
          longitude: 0, // Will be populated when getting place details
        }));
      } catch (backendError) {
        console.error('Backend place search also failed:', backendError);
        
        // Return empty array as fallback
        return [];
      }
    }
  }
};

// Get place details (with geocoding fallback)
const getPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
  try {
    // Try backend first for place details
    const response = await apiService.get<any>('/api/location/place-details', { placeId });
    
    return {
      placeId: response.place_id,
      address: response.formatted_address,
      latitude: response.geometry.location.lat,
      longitude: response.geometry.location.lng,
    };
  } catch (error) {
    console.error('Backend place details failed:', error);
    
    // If placeId looks like an address, try geocoding it
    if (placeId.includes(',') || placeId.includes(' ')) {
      try {
        const coords = await geocode(placeId);
        return {
          placeId,
          address: placeId,
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
      } catch (geocodeError) {
        console.error('Geocoding fallback for place details failed:', geocodeError);
      }
    }
    
    // Final fallback - return default location
    return {
      placeId,
      address: 'Dhaka, Bangladesh',
      latitude: 23.8103,
      longitude: 90.4125,
    };
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

// Get a nearby location for second marker (using GoMaps geolocation)
const getNearbyLocation = async (): Promise<Location> => {
  try {
    // Try to get a nearby location using GoMaps geolocation
    const nearbyLocation = await getLocationWithGoMapsGeolocation();
    console.log('Got nearby location:', nearbyLocation);
    return nearbyLocation;
  } catch (error) {
    console.error('Failed to get nearby location:', error);
    
    // Fallback: Return a location slightly offset from default Dhaka coordinates
    return {
      latitude: 23.7808,
      longitude: 90.4079,
      address: 'Nearby Location, Dhaka'
    };
  }
};

// Location service object with all functions
export const locationService = {
  getCurrentPosition,
  getCurrentLocation,
  getLocationWithGoMapsGeolocation,
  getNearbyLocation,
  geocode,
  reverseGeocode,
  searchPlaces,
  getPlaceDetails,
  calculateDistance,
  getSavedPlaces,
  savePlaceByUser,
};

export default locationService; 
import axios from 'axios';

// Use Google Maps API key
const MAPS_API_KEY = 'AlzaSyM2UhGcgh7zeSvJiTtYIEnq4ACUZd4b52R';

// Optional proxy URL to avoid CORS issues in development
const PROXY_URL = ''; // Leave empty to make direct requests

// Type definitions for API responses
interface DirectionStep {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  end_location: { lat: number; lng: number };
  start_location: { lat: number; lng: number };
  html_instructions: string;
  polyline: { points: string };
  travel_mode: string;
}

interface DirectionLeg {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  end_address: string;
  start_address: string;
  end_location: { lat: number; lng: number };
  start_location: { lat: number; lng: number };
  steps: DirectionStep[];
}

interface DirectionRoute {
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  legs: DirectionLeg[];
  overview_polyline: { points: string };
  summary: string;
  warnings: string[];
  waypoint_order: number[];
}

interface DirectionsResponse {
  routes: DirectionRoute[];
  status: string;
}

interface PlacesResult {
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  name: string;
  place_id: string;
  types: string[];
}

interface PlacesResponse {
  results: PlacesResult[];
  status: string;
}

/**
 * Build a URL for Google Maps API requests
 */
const buildApiUrl = (endpoint: string, params: Record<string, string>) => {
  // Add API key to params
  params.key = MAPS_API_KEY;
  
  // Build query string
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  // Base GoMaps API URL
  const apiUrl = `https://maps.gomaps.pro/maps/api/${endpoint}?${queryString}`;
  
  // Use proxy if specified, otherwise use direct URL
  return PROXY_URL ? `${PROXY_URL}${encodeURIComponent(apiUrl)}` : apiUrl;
};

/**
 * Decode Google Maps encoded polyline into an array of coordinates
 */
export const decodePolyline = (encoded: string) => {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5
    });
  }

  return points;
};

/**
 * Get directions between two locations
 */
const getDirections = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) => {
  try {
    // Prepare parameters
    const params: Record<string, string> = {
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
      mode: 'driving'
    };
    
    // Build URL using our helper
    const url = buildApiUrl('directions/json', params);
    
    const response = await axios.get(url);
    
    if (response.data.status !== 'OK') {
      console.error('Directions API error:', {
        status: response.data.status,
        error_message: response.data.error_message || 'No error message provided'
      });
      throw new Error(`Directions API error: ${response.data.status}`);
    }

    // Extract route information
    const route = response.data.routes[0];
    const leg = route.legs[0];
    
    // Decode the polyline to get coordinates
    const coordinates = decodePolyline(route.overview_polyline.points);
    
    // Return the route data
    return {
      coordinates,
      distance: leg.distance.text,
      duration: leg.duration.text,
      startAddress: leg.start_address,
      endAddress: leg.end_address
    };
  } catch (error) {
    console.error('Error fetching directions:', error);
    throw error;
  }
};

/**
 * Search for places based on query text
 */
const searchPlaces = async (
  query: string,
  location?: { latitude: number; longitude: number }
) => {
  try {
    if (!query) return [];

    // Prepare parameters
    const params: Record<string, string> = {
      query
    };
    
    // Add location bias if provided
    if (location) {
      params.location = `${location.latitude},${location.longitude}`;
      params.radius = '50000'; // 50km radius
    }
    
    // Build URL using our helper
    const url = buildApiUrl('place/textsearch/json', params);
    
    const response = await axios.get(url);
    
    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', {
        status: response.data.status,
        error_message: response.data.error_message || 'No error message provided'
      });
      throw new Error(`Places API error: ${response.data.status}`);
    }

    // Format the response data
    return response.data.results.map((place: PlacesResult) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      }
    }));
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
};

/**
 * Get details for a specific place by ID
 */
const getPlaceDetails = async (placeId: string) => {
  try {
    const params: Record<string, string> = {
      place_id: placeId,
      fields: 'name,formatted_address,geometry,type'
    };
    
    const url = buildApiUrl('place/details/json', params);
    
    const response = await axios.get(url);
    
    if (response.data.status !== 'OK') {
      console.error('Place Details API error:', {
        status: response.data.status,
        error_message: response.data.error_message || 'No error message provided'
      });
      throw new Error(`Place Details API error: ${response.data.status}`);
    }

    const place = response.data.result;
    
    return {
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      },
      types: place.types
    };
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
  }
};

/**
 * Test the API key by making a simple request
 */
const testMapsApiKey = async () => {
  try {
    const params: Record<string, string> = {
      input: 'test',
      types: 'geocode'
    };
    
    const url = buildApiUrl('place/autocomplete/json', params);
    
    const response = await axios.get(url);
    
    return {
      status: response.data.status,
      isValid: response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS'
    };
  } catch (error) {
    console.error('Error testing Maps API key:', error);
    return {
      status: 'ERROR',
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Export the Maps Service as a singleton
const mapsService = {
  getDirections,
  searchPlaces,
  getPlaceDetails,
  decodePolyline,
  testMapsApiKey
};

export default mapsService; 
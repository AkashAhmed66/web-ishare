import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { getCurrentLocation, setPickup, setDestination } from '../redux/slices/locationSlice';
import { COLORS, STYLES } from '../styles/theme';
import mapsService from '../services/mapsService';
import { Location } from '../services/rideService';

// Use official Google Maps types
/// <reference types="@types/google.maps" />

// Define types for Google Maps objects
/// <reference types="google.maps" />

declare global {
  interface Window {
    google: typeof google;
  }
}

// CSS-in-JS for MapScreen
const mapStyles = `
  .map-container {
    height: calc(100vh - 200px);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
  }
  
  .map-controls {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: ${COLORS.card};
    border-radius: 4px;
    padding: 0.5rem;
    box-shadow: ${STYLES.card.boxShadow};
    z-index: 1;
    display: flex;
    flex-direction: column;
  }
  
  .map-controls button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
  }
  
  .map-controls button:last-child {
    margin-bottom: 0;
  }
  
  .route-info {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background-color: ${COLORS.card};
    border-radius: 4px;
    padding: 0.75rem;
    box-shadow: ${STYLES.card.boxShadow};
    z-index: 1;
    max-width: 250px;
    display: flex;
    flex-direction: column;
  }
  
  .search-box {
    position: absolute;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    max-width: 400px;
    background-color: ${COLORS.card};
    border-radius: 4px;
    padding: 0.5rem;
    box-shadow: ${STYLES.card.boxShadow};
    z-index: 1;
    display: flex;
    align-items: center;
  }
  
  .search-box input {
    border: none;
    flex: 1;
    padding: 0.5rem;
    outline: none;
    font-size: 1rem;
    background-color: transparent;
  }
  
  .search-box button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 0.5rem;
  }
`;

// Define the coordinate type
interface Coordinate {
  latitude: number;
  longitude: number;
}

const MapScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentLocation, pickup, destination } = useAppSelector((state) => state.location);
  const { loading } = useAppSelector((state) => state.location);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const pickupMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);

  // Add the styles to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = mapStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Initialize map when component mounts
  useEffect(() => {
    dispatch(getCurrentLocation());
  }, [dispatch]);

  // Initialize Google Maps and set up
  const initMap = useCallback(() => {
    if (!currentLocation || !mapContainerRef.current || !window.google) return;

    // Create a new map
    const mapOptions: google.maps.MapOptions = {
      center: { lat: currentLocation.latitude, lng: currentLocation.longitude },
      zoom: 14,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: false,
    };

    const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
    mapRef.current = map;

    // Create directionsRenderer for routes
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true, // We'll handle markers separately
      polylineOptions: {
        strokeColor: COLORS.primary,
        strokeWeight: 4,
      },
    });
    directionsRenderer.setMap(map);
    directionsRendererRef.current = directionsRenderer;

    // Create pickup marker
    if (pickup) {
      createPickupMarker(pickup);
    } else if (currentLocation) {
      createPickupMarker(currentLocation);
      // Set pickup location in Redux
      dispatch(setPickup(currentLocation));
    }

    // Create destination marker if available
    if (destination) {
      createDestinationMarker(destination);
    }
  }, [currentLocation, pickup, destination, dispatch]);

  // Initialize map when current location is available
  useEffect(() => {
    if (currentLocation && window.google && mapContainerRef.current && !mapRef.current) {
      initMap();
    }
  }, [currentLocation, initMap]);

  // Create pickup marker
  const createPickupMarker = (location: Location) => {
    if (!mapRef.current) return;

    // Remove existing marker if it exists
    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.setMap(null);
    }

    // Create a custom marker icon
    const pickupIcon = {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: COLORS.primary,
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#FFFFFF',
      scale: 10
    };

    // Create the marker
    const marker = new window.google.maps.Marker({
      position: { lat: location.latitude, lng: location.longitude },
      map: mapRef.current,
      icon: pickupIcon,
      title: 'Pickup Location'
    });

    pickupMarkerRef.current = marker;
  };

  // Create destination marker
  const createDestinationMarker = (location: Location) => {
    if (!mapRef.current) return;

    // Remove existing marker if it exists
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null);
    }

    // Create a custom marker icon
    const destinationIcon = {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: COLORS.accent,
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#FFFFFF',
      scale: 10
    };

    // Create the marker
    const marker = new window.google.maps.Marker({
      position: { lat: location.latitude, lng: location.longitude },
      map: mapRef.current,
      icon: destinationIcon,
      title: 'Destination Location'
    });

    destinationMarkerRef.current = marker;
  };

  // Update markers and route when pickup/destination changes
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Update pickup marker
    if (pickup) {
      createPickupMarker(pickup);
    }

    // Update destination marker
    if (destination) {
      createDestinationMarker(destination);
    }

    // If both pickup and destination are set, calculate and display route
    if (pickup && destination) {
      fetchAndDrawRoute();
    } else {
      // Clear route if either pickup or destination is missing
      clearRoute();
    }
  }, [pickup, destination]);

  // Fetch and draw route between pickup and destination
  const fetchAndDrawRoute = async () => {
    if (!pickup || !destination || !mapRef.current || !directionsRendererRef.current) return;

    try {
      // Use DirectionsService to get route
      const directionsService = new window.google.maps.DirectionsService();
      
      const request = {
        origin: { lat: pickup.latitude, lng: pickup.longitude },
        destination: { lat: destination.latitude, lng: destination.longitude },
        travelMode: window.google.maps.TravelMode.DRIVING
      };

      directionsService.route(request, (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
        if (status === 'OK' && result) {
          directionsRendererRef.current!.setDirections(result);
          
          const route = result.routes[0];
          const leg = route.legs[0];
          
          // Update route info
          setRouteInfo({
            distance: leg.distance?.text || '',
            duration: leg.duration?.text || ''
          });

          // Decode polyline to get coordinates (needed for other operations)
          if (route.overview_polyline) {
            const decodedPath = mapsService.decodePolyline(route.overview_polyline);
            setRouteCoordinates(decodedPath);
          }

          // Fit map to show entire route
          const bounds = new window.google.maps.LatLngBounds();
          if (route.bounds) {
            bounds.extend(route.bounds.getNorthEast());
            bounds.extend(route.bounds.getSouthWest());
          }
          mapRef.current!.fitBounds(bounds);
        } else {
          console.error('Directions request failed:', status);
        }
      });
    } catch (error) {
      console.error('Failed to fetch route:', error);
    }
  };

  // Clear the route
  const clearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] } as any);
    }
    setRouteInfo(null);
    setRouteCoordinates([]);
  };

  // Handle search for destinations
  const handleSearch = async () => {
    if (!searchQuery || !currentLocation) return;

    try {
      const results = await mapsService.searchPlaces(searchQuery, {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      });

      if (results.length > 0) {
        const firstResult = results[0];
        
        // Set as destination
        const newDestination: Location = {
          latitude: firstResult.coordinates.latitude,
          longitude: firstResult.coordinates.longitude,
          address: firstResult.address
        };
        
        dispatch(setDestination(newDestination));
        
        // Clear search query
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Center map on user's current location
  const handleCenterOnLocation = () => {
    if (!mapRef.current || !currentLocation) return;
    
    mapRef.current.setCenter({ 
      lat: currentLocation.latitude, 
      lng: currentLocation.longitude 
    });
    mapRef.current.setZoom(15);
  };

  // Zoom in
  const handleZoomIn = () => {
    if (!mapRef.current) return;
    mapRef.current.setZoom((mapRef.current.getZoom() || 14) + 1);
  };

  // Zoom out
  const handleZoomOut = () => {
    if (!mapRef.current) return;
    mapRef.current.setZoom((mapRef.current.getZoom() || 14) - 1);
  };

  if (loading && !currentLocation) {
    return <div>Loading map...</div>;
  }

  return (
    <div>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: COLORS.text
      }}>
        Map
      </h2>
      
      {/* Map container */}
      <div className="map-container" ref={mapContainerRef}>
        {/* Search box */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search for a destination..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>
            <span role="img" aria-label="search">🔍</span>
          </button>
        </div>
        
        {/* Route information */}
        {routeInfo && (
          <div className="route-info">
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {routeInfo.distance}
            </div>
            <div style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>
              {routeInfo.duration} by car
            </div>
          </div>
        )}
        
        {/* Map controls */}
        <div className="map-controls">
          <button onClick={handleZoomIn} title="Zoom in">
            <span role="img" aria-label="zoom in">➕</span>
          </button>
          <button onClick={handleZoomOut} title="Zoom out">
            <span role="img" aria-label="zoom out">➖</span>
          </button>
          <button onClick={handleCenterOnLocation} title="Center on your location">
            <span role="img" aria-label="location">📍</span>
          </button>
        </div>
      </div>
      
      {/* Bottom controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '1rem',
        gap: '1rem'
      }}>
        <button style={{
          ...STYLES.buttonPrimary,
          flex: 1,
          maxWidth: '200px'
        }}>
          Book a Ride
        </button>
        <button style={{
          ...STYLES.buttonSecondary,
          flex: 1,
          maxWidth: '200px'
        }}>
          Save Location
        </button>
      </div>
    </div>
  );
};

export default MapScreen; 
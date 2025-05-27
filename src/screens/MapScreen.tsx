import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { getCurrentLocation, setPickup, setDestination } from '../redux/slices/locationSlice';
import { COLORS, STYLES } from '../styles/theme';
import mapsService from '../services/mapsService';
import socketService from '../services/socketService';
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

interface SearchResult {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface MapSuggestion {
  placeId: string;
  name: string;
  address: string;
  location: google.maps.LatLng;
  marker?: google.maps.Marker;
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
  
  .search-container {
    position: absolute;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    max-width: 400px;
    z-index: 1000;
  }
  
  .search-box {
    background-color: ${COLORS.card};
    border-radius: 4px;
    padding: 0.5rem;
    box-shadow: ${STYLES.card.boxShadow};
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

  .search-suggestions {
    background-color: ${COLORS.card};
    border-radius: 0 0 4px 4px;
    box-shadow: ${STYLES.card.boxShadow};
    max-height: 200px;
    overflow-y: auto;
  }

  .search-suggestion {
    padding: 0.75rem;
    border-bottom: 1px solid ${COLORS.border};
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .search-suggestion:hover {
    background-color: ${COLORS.background};
  }

  .search-suggestion:last-child {
    border-bottom: none;
  }

  .suggestion-name {
    font-weight: 500;
    color: ${COLORS.text};
    margin-bottom: 0.25rem;
  }

  .suggestion-address {
    font-size: 0.9rem;
    color: ${COLORS.textSecondary};
  }

  .loading-suggestions {
    padding: 1rem;
    text-align: center;
    color: ${COLORS.textSecondary};
  }

  .search-status {
    position: absolute;
    bottom: 5rem;
    left: 1rem;
    background-color: ${COLORS.card};
    border-radius: 4px;
    padding: 0.5rem 1rem;
    box-shadow: ${STYLES.card.boxShadow};
    z-index: 1;
    font-size: 0.9rem;
    color: ${COLORS.textSecondary};
  }

  .ride-booking-panel {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    background-color: ${COLORS.card};
    border-radius: 8px;
    padding: 1rem;
    box-shadow: ${STYLES.card.boxShadow};
    z-index: 1;
  }

  .location-display {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .location-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    background-color: ${COLORS.background};
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .location-icon {
    margin-right: 0.5rem;
    font-size: 1rem;
  }

  .booking-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .booking-buttons button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .book-ride-btn {
    background-color: ${COLORS.primary};
    color: white;
  }

  .book-ride-btn:hover {
    background-color: ${COLORS.primaryDark || COLORS.primary};
  }

  .book-ride-btn:disabled {
    background-color: ${COLORS.textSecondary};
    cursor: not-allowed;
  }

  .clear-route-btn {
    background-color: ${COLORS.background};
    color: ${COLORS.text};
    border: 1px solid ${COLORS.border};
  }

  .clear-route-btn:hover {
    background-color: ${COLORS.border};
  }
`;

// Define the coordinate type
interface Coordinate {
  latitude: number;
  longitude: number;
}

const MapScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentLocation, pickup, destination } = useAppSelector((state) => state.location);
  const { loading } = useAppSelector((state) => state.location);
  const { user } = useAppSelector((state) => state.auth);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const pickupMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const suggestionMarkersRef = useRef<google.maps.Marker[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchResult[]>([]);
  const [mapSuggestions, setMapSuggestions] = useState<MapSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [isBookingRide, setIsBookingRide] = useState(false);

  // Search timeout ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add the styles to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = mapStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (user) {
      socketService.connect(user.id);
      
      // Listen for ride updates
      socketService.on('ride_request_received', (data: any) => {
        console.log('Ride request received:', data);
      });

      socketService.on('driver_assigned', (data: any) => {
        console.log('Driver assigned:', data);
        setIsBookingRide(false);
        // Handle driver assignment - maybe show a modal or update UI
      });

      socketService.on('ride_request_error', (data: any) => {
        console.error('Ride request error:', data);
        setIsBookingRide(false);
      });
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  // Initialize map when component mounts
  useEffect(() => {
    dispatch(getCurrentLocation());
  }, [dispatch]);

  // Set pickup to current location if not already set
  useEffect(() => {
    if (currentLocation && !pickup) {
      console.log('MapScreen - Setting pickup to current location:', currentLocation);
      dispatch(setPickup(currentLocation));
    }
  }, [currentLocation, pickup, dispatch]);

  // Clear suggestion markers
  const clearSuggestionMarkers = () => {
    suggestionMarkersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    suggestionMarkersRef.current = [];
    setMapSuggestions([]);
  };

  // Search for places using Google Places API
  const searchPlacesOnMap = useCallback((query: string) => {
    setSearchStatus('Searching for locations...');
    if (!mapRef.current || !placesServiceRef.current || !currentLocation) return;

    setIsSearching(true);
    
    // Clear previous suggestions
    clearSuggestionMarkers();

    const request = {
      query: query,
      location: new window.google.maps.LatLng(currentLocation.latitude, currentLocation.longitude),
      radius: 50000, // 50km radius
    };

    placesServiceRef.current.textSearch(request, (results, status) => {
      setIsSearching(false);
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setSearchStatus(`Found ${results.length} locations. Click on map markers to select.`);
        
        const suggestions: MapSuggestion[] = [];
        const dropdownSuggestions: SearchResult[] = [];

        results.slice(0, 5).forEach((place, index) => {
          if (!place.geometry?.location) return;

          // Create marker for map suggestion
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: mapRef.current,
            title: place.name,
            animation: window.google.maps.Animation.DROP,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#FF6B6B',
              fillOpacity: 0.8,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              scale: 8
            }
          });

          // Add click listener to marker
          marker.addListener('click', () => {
            handleMapSuggestionSelect(place);
            clearSuggestionMarkers();
            setSearchStatus('');
          });

          const suggestion: MapSuggestion = {
            placeId: place.place_id || `place_${index}`,
            name: place.name || 'Unknown',
            address: place.formatted_address || 'Address not available',
            location: place.geometry.location,
            marker
          };

          suggestions.push(suggestion);
          suggestionMarkersRef.current.push(marker);

          // Also add to dropdown suggestions
          dropdownSuggestions.push({
            id: place.place_id || `place_${index}`,
            name: place.name || 'Unknown',
            address: place.formatted_address || 'Address not available',
            coordinates: {
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng()
            }
          });
        });

        setMapSuggestions(suggestions);
        setSearchSuggestions(dropdownSuggestions);
        setShowSuggestions(dropdownSuggestions.length > 0);

        // Adjust map view to show all suggestions
        if (suggestions.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          suggestions.forEach(suggestion => {
            bounds.extend(suggestion.location);
          });
          // Also include current location
          bounds.extend(new window.google.maps.LatLng(currentLocation.latitude, currentLocation.longitude));
          mapRef.current?.fitBounds(bounds);
        }
      } else {
        setSearchStatus('No locations found. Try a different search term.');
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    });
  }, [currentLocation]);

  // Handle search input changes with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      clearSuggestionMarkers();
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setSearchStatus('');
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchPlacesOnMap(searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchPlacesOnMap]);

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

    // Initialize Places Service
    placesServiceRef.current = new window.google.maps.places.PlacesService(map);

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
      fillColor: COLORS.primary || '#007bff',
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#FFFFFF',
      scale: 12
    };

    // Create the marker
    const marker = new window.google.maps.Marker({
      position: { lat: location.latitude, lng: location.longitude },
      map: mapRef.current,
      icon: pickupIcon,
      title: 'Pickup Location (Drag to move)',
      draggable: true
    });

    // Add drag listener to update pickup location
    marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        // Try to get address using reverse geocoding
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: event.latLng }, (results, status) => {
          const address = status === 'OK' && results?.[0]?.formatted_address 
            ? results[0].formatted_address 
            : `${event.latLng!.lat().toFixed(6)}, ${event.latLng!.lng().toFixed(6)}`;
          
          const newPickup: Location = {
            latitude: event.latLng!.lat(),
            longitude: event.latLng!.lng(),
            address
          };
          dispatch(setPickup(newPickup));
          
          // Recalculate route if destination exists
          if (destination) {
            fetchAndDrawRoute();
          }
        });
      }
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
      fillColor: COLORS.accent || '#dc3545',
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#FFFFFF',
      scale: 12
    };

    // Create the marker
    const marker = new window.google.maps.Marker({
      position: { lat: location.latitude, lng: location.longitude },
      map: mapRef.current,
      icon: destinationIcon,
      title: 'Destination Location (Drag to move)',
      draggable: true
    });

    // Add drag listener to update destination location
    marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        // Try to get address using reverse geocoding
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: event.latLng }, (results, status) => {
          const address = status === 'OK' && results?.[0]?.formatted_address 
            ? results[0].formatted_address 
            : `${event.latLng!.lat().toFixed(6)}, ${event.latLng!.lng().toFixed(6)}`;
          
          const newDestination: Location = {
            latitude: event.latLng!.lat(),
            longitude: event.latLng!.lng(),
            address
          };
          dispatch(setDestination(newDestination));
          
          // Recalculate route if pickup exists
          if (pickup) {
            fetchAndDrawRoute();
          }
        });
      }
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
  const fetchAndDrawRoute = useCallback(() => {
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

          // Simple coordinate extraction from overview path
          const coordinates: Coordinate[] = route.overview_path?.map(point => ({
            latitude: point.lat(),
            longitude: point.lng()
          })) || [];
          setRouteCoordinates(coordinates);

          // Fit map to show entire route
          const bounds = new window.google.maps.LatLngBounds();
          if (route.bounds) {
            bounds.extend(route.bounds.getNorthEast());
            bounds.extend(route.bounds.getSouthWest());
          }
          mapRef.current!.fitBounds(bounds);
        } else {
          console.error('Directions request failed:', status);
          setRouteInfo(null);
        }
      });
    } catch (error) {
      console.error('Failed to fetch route:', error);
      setRouteInfo(null);
    }
  }, [pickup, destination]);

  // Clear the route
  const clearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] } as any);
    }
    setRouteInfo(null);
    setRouteCoordinates([]);
  };

  // Handle search suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchResult) => {
    if (!suggestion || !suggestion.coordinates) return;

    const newDestination: Location = {
      latitude: suggestion.coordinates.latitude,
      longitude: suggestion.coordinates.longitude,
      address: suggestion.address
    };
    
    // Update Redux state
    dispatch(setDestination(newDestination));
    
    // Clear search and suggestions in a batch
    setTimeout(() => {
      setSearchQuery('');
      setShowSuggestions(false);
      setSearchSuggestions([]);
      clearSuggestionMarkers();
      setSearchStatus('');
    }, 0);
  }, [dispatch, clearSuggestionMarkers]);

  // Handle search for destinations (legacy support)
  const handleSearch = async () => {
    if (!searchQuery || !currentLocation) return;

    try {
      const results = await mapsService.searchPlaces(searchQuery, {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      });

      if (results.length > 0) {
        handleSuggestionSelect(results[0]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Handle ride booking - navigate to ride options
  const handleBookRide = () => {
    console.log('MapScreen - handleBookRide called');
    console.log('MapScreen - pickup:', pickup);
    console.log('MapScreen - destination:', destination);
    console.log('MapScreen - currentLocation:', currentLocation);
    
    // Ensure pickup is set (use current location if not set)
    const actualPickup = pickup || currentLocation;
    
    if (!actualPickup || !destination) {
      alert('Please select both pickup and destination locations');
      return;
    }
    
    // Update Redux state with actual pickup if it wasn't set
    if (!pickup && currentLocation) {
      dispatch(setPickup(currentLocation));
    }
    
    const navigationData = {
      pickup: actualPickup,
      destination,
      routeInfo
    };
    
    console.log('MapScreen - navigating with data:', navigationData);
    
    // Store in localStorage as backup
    localStorage.setItem('rideBookingData', JSON.stringify(navigationData));
    
    // Navigate with state to ensure data persistence
    navigate('/ride-options', {
      state: navigationData
    });
  };

  // Clear route and reset destinations
  const handleClearRoute = () => {
    dispatch(setDestination(null));
    clearRoute();
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

  // Handle map suggestion selection
  const handleMapSuggestionSelect = (place: google.maps.places.PlaceResult) => {
    const newDestination: Location = {
      latitude: place.geometry?.location?.lat() || 0,
      longitude: place.geometry?.location?.lng() || 0,
      address: place.formatted_address || 'Address not available'
    };
    
    dispatch(setDestination(newDestination));
    
    // Clear search
    setSearchQuery('');
    setShowSuggestions(false);
    setSearchSuggestions([]);
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
        {/* Search container with suggestions */}
        <div className="search-container" onClick={e => e.stopPropagation()}>
          <div className="search-box">
            <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Where to?"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                  setSearchSuggestions([]);
                  clearSuggestionMarkers();
                  setSearchStatus('');
                }}
                title="Clear search"
              >
                <span role="img" aria-label="clear">❌</span>
              </button>
            )}
          </div>
          
          {/* Search suggestions dropdown */}
          {showSuggestions && searchSuggestions && (
            <div className="search-suggestions">
              {isSearching ? (
                <div key="loading" className="loading-suggestions">Searching...</div>
              ) : searchSuggestions.length > 0 ? (
                searchSuggestions.map((suggestion, index) => {
                  const key = suggestion.id || `${suggestion.name}-${suggestion.address}-${index}`;
                  return (
                    <div
                      key={key}
                      className="search-suggestion"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSuggestionSelect(suggestion);
                      }}
                    >
                      <div className="suggestion-name">{suggestion.name || 'Unknown place'}</div>
                      <div className="suggestion-address">{suggestion.address || 'Address not available'}</div>
                    </div>
                  );
                })
              ) : (
                <div key="no-results" className="loading-suggestions">No results found</div>
              )}
            </div>
          )}
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

        {/* Search status */}
        {searchStatus && (
          <div className="search-status">
            {searchStatus}
          </div>
        )}

        {/* Enhanced ride booking panel */}
        {(pickup || currentLocation) && destination && (
          <div className="ride-booking-panel">
            <div className="location-display">
              <div className="location-item">
                <span className="location-icon">📍</span>
                <span>From: {(pickup || currentLocation)?.address}</span>
              </div>
              <div className="location-item">
                <span className="location-icon">🎯</span>
                <span>To: {destination.address}</span>
              </div>
              {routeInfo && (
                <div className="location-item">
                  <span className="location-icon">🕒</span>
                  <span>{routeInfo.distance} • {routeInfo.duration}</span>
                </div>
              )}
            </div>
            
            <div className="booking-buttons">
              <button 
                className="book-ride-btn"
                onClick={handleBookRide}
                disabled={isBookingRide}
              >
                {isBookingRide ? 'Booking...' : 'Book Now'}
              </button>
              <button 
                className="clear-route-btn"
                onClick={handleClearRoute}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'absolute',
            bottom: '6rem',
            right: '1rem',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            maxWidth: '200px'
          }}>
            <div>Current: {currentLocation ? '✓' : '✗'}</div>
            <div>Pickup: {pickup ? '✓' : '✗'}</div>
            <div>Destination: {destination ? '✓' : '✗'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapScreen; 
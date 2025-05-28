import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { getCurrentLocation, setPickup, setDestination } from '../redux/slices/locationSlice';
import { COLORS, STYLES } from '../styles/theme';
import mapsService from '../services/mapsService';
import socketService from '../services/socketService';
import locationService from '../services/locationService';
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

  // Inject styles once on component mount - safer implementation
  useEffect(() => {
    const styleId = 'map-screen-styles';
    
    // Check if styles are already injected to prevent duplicates
    if (document.getElementById(styleId)) {
      return; // Styles already exist, no need to inject again
    }
    
    // Use requestIdleCallback for safer CSS injection
    const injectStyles = () => {
      try {
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.type = 'text/css';
        styleElement.textContent = mapStyles;
        
        // Insert at end of head to avoid conflicts
        const head = document.head || document.getElementsByTagName('head')[0];
        head.appendChild(styleElement);
        
        console.log('Map styles injected successfully');
      } catch (styleError) {
        console.warn('Error injecting CSS styles:', styleError);
      }
    };

    // Use requestIdleCallback if available, otherwise use setTimeout
    if (window.requestIdleCallback) {
      window.requestIdleCallback(injectStyles);
    } else {
      setTimeout(injectStyles, 0);
    }
    
    // Cleanup function - remove styles when component unmounts
    return () => {
      try {
        const existingStyle = document.getElementById(styleId);
        if (existingStyle && existingStyle.parentNode) {
          existingStyle.parentNode.removeChild(existingStyle);
        }
      } catch (cleanupError) {
        console.warn('Error cleaning up CSS styles:', cleanupError);
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

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
  const clearSuggestionMarkers = useCallback(() => {
    try {
      if (suggestionMarkersRef.current && suggestionMarkersRef.current.length > 0) {
        suggestionMarkersRef.current.forEach((marker, index) => {
          try {
            if (marker && marker.setMap) {
              marker.setMap(null);
            }
          } catch (error) {
            console.warn(`Error clearing suggestion marker ${index}:`, error);
          }
        });
      }
      suggestionMarkersRef.current = [];
      setMapSuggestions([]);
    } catch (error) {
      console.error('Error clearing suggestion markers:', error);
      // Reset arrays even if clearing failed
      suggestionMarkersRef.current = [];
      setMapSuggestions([]);
    }
  }, []);

  // Search for places using Google Places API
  const searchPlacesOnMap = useCallback((query: string) => {
    if (!mapRef.current || !placesServiceRef.current || !currentLocation) {
      console.warn('Cannot search: map, places service, or current location not available');
      return;
    }

    // Cancel any ongoing search
    if (isSearching) {
      console.log('Search already in progress, skipping...');
      return;
    }

    setSearchStatus('Searching for locations...');
    setIsSearching(true);
    
    // Clear previous suggestions safely
    try {
      clearSuggestionMarkers();
    } catch (clearError) {
      console.warn('Error clearing previous suggestions:', clearError);
    }

    const request = {
      query: query,
      location: new window.google.maps.LatLng(currentLocation.latitude, currentLocation.longitude),
      radius: 50000, // 50km radius
    };

    placesServiceRef.current.textSearch(request, (results, status) => {
      // Batch all state updates together
      setTimeout(() => {
        setIsSearching(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setSearchStatus(`Found ${results.length} locations. Click on map markers to select.`);
          
          const suggestions: MapSuggestion[] = [];
          const dropdownSuggestions: SearchResult[] = [];

          try {
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

            // Batch all state updates
            setMapSuggestions(suggestions);
            setSearchSuggestions(dropdownSuggestions);
            setShowSuggestions(dropdownSuggestions.length > 0);

            // Adjust map view to show all suggestions
            if (suggestions.length > 0 && mapRef.current) {
              const bounds = new window.google.maps.LatLngBounds();
              suggestions.forEach(suggestion => {
                bounds.extend(suggestion.location);
              });
              // Also include current location
              bounds.extend(new window.google.maps.LatLng(currentLocation.latitude, currentLocation.longitude));
              mapRef.current.fitBounds(bounds);
            }
          } catch (processingError) {
            console.error('Error processing search results:', processingError);
            setSearchStatus('Error processing search results');
            setSearchSuggestions([]);
            setShowSuggestions(false);
          }
        } else {
          setSearchStatus('No locations found. Try a different search term.');
          setSearchSuggestions([]);
          setShowSuggestions(false);
        }
      }, 0); // Batch state updates
    });
  }, [currentLocation, clearSuggestionMarkers]);

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
    const handleClickOutside = (event: Event) => {
      const target = event.target as Element;
      const searchContainer = document.querySelector('.search-container');
      
      // Only hide if click is truly outside and suggestions are shown
      if (showSuggestions && searchContainer && !searchContainer.contains(target)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('click', handleClickOutside, true);
      return () => document.removeEventListener('click', handleClickOutside, true);
    }
  }, [showSuggestions]);

  // Initialize Google Maps and set up
  const initMap = useCallback(() => {
    if (!currentLocation || !mapContainerRef.current || !window.google) return;

    // Prevent multiple initializations
    if (mapRef.current) {
      console.warn('Map already initialized, skipping...');
      return;
    }

    try {
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

      // Wait for map to be ready before adding services
      window.google.maps.event.addListenerOnce(map, 'idle', () => {
        try {
          // Initialize Places Service after map is ready
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

          // Create initial markers after everything is set up
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

          console.log('Map initialization completed successfully');
        } catch (serviceError) {
          console.error('Error initializing map services:', serviceError);
        }
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      // Clear map reference on error
      mapRef.current = null;
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
    if (!mapRef.current || !window.google) return;

    try {
      // Remove existing marker if it exists - with safety check
      if (pickupMarkerRef.current) {
        try {
          pickupMarkerRef.current.setMap(null);
        } catch (removeError) {
          console.warn('Error removing existing pickup marker:', removeError);
        }
        pickupMarkerRef.current = null;
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

      // Create the marker with error handling
      const marker = new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: mapRef.current,
        icon: pickupIcon,
        title: 'Pickup Location (Drag to move)',
        draggable: true
      });

      // Add drag listener with debouncing to prevent rapid updates
      let dragTimeout: NodeJS.Timeout;
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        if (event.latLng && mapRef.current) {
          // Clear previous timeout
          if (dragTimeout) clearTimeout(dragTimeout);
          
          // Debounce the drag event
          dragTimeout = setTimeout(() => {
            try {
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: event.latLng }, (results, status) => {
                try {
                  let address = `${event.latLng!.lat().toFixed(6)}, ${event.latLng!.lng().toFixed(6)}`;
                  
                  if (status === 'OK' && results?.[0]?.formatted_address) {
                    address = results[0].formatted_address;
                  } else {
                    console.warn('Geocoding failed with status:', status);
                    // Fallback to locationService for address
                    locationService.reverseGeocode(event.latLng!.lat(), event.latLng!.lng())
                      .then((fallbackAddress) => {
                        address = fallbackAddress;
                      })
                      .catch((fallbackError) => {
                        console.warn('Fallback reverse geocoding also failed:', fallbackError);
                      });
                  }
                  
                  const newPickup: Location = {
                    latitude: event.latLng!.lat(),
                    longitude: event.latLng!.lng(),
                    address
                  };
                  
                  console.log('Pickup marker moved to:', newPickup);
                  dispatch(setPickup(newPickup));
                  
                  // Recalculate route if destination exists - with debouncing
                  if (destination) {
                    setTimeout(() => {
                      if (mapRef.current) fetchAndDrawRoute();
                    }, 200);
                  }
                } catch (geocodeError) {
                  console.warn('Error processing geocode result:', geocodeError);
                  // Still update position even if address lookup fails
                  const fallbackPickup: Location = {
                    latitude: event.latLng!.lat(),
                    longitude: event.latLng!.lng(),
                    address: 'Unknown location'
                  };
                  dispatch(setPickup(fallbackPickup));
                }
              });
            } catch (dragError) {
              console.warn('Error handling marker drag:', dragError);
            }
          }, 300);
        }
      });

      pickupMarkerRef.current = marker;
    } catch (error) {
      console.error('Error creating pickup marker:', error);
    }
  };

  // Create destination marker
  const createDestinationMarker = (location: Location) => {
    if (!mapRef.current || !window.google) return;

    try {
      // Remove existing marker if it exists - with safety check
      if (destinationMarkerRef.current) {
        try {
          destinationMarkerRef.current.setMap(null);
        } catch (removeError) {
          console.warn('Error removing existing destination marker:', removeError);
        }
        destinationMarkerRef.current = null;
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

      // Create the marker with error handling
      const marker = new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: mapRef.current,
        icon: destinationIcon,
        title: 'Destination Location (Drag to move)',
        draggable: true
      });

      // Add drag listener with debouncing to prevent rapid updates
      let dragTimeout: NodeJS.Timeout;
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        if (event.latLng && mapRef.current) {
          // Clear previous timeout
          if (dragTimeout) clearTimeout(dragTimeout);
          
          // Debounce the drag event
          dragTimeout = setTimeout(() => {
            try {
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: event.latLng }, (results, status) => {
                try {
                  let address = `${event.latLng!.lat().toFixed(6)}, ${event.latLng!.lng().toFixed(6)}`;
                  
                  if (status === 'OK' && results?.[0]?.formatted_address) {
                    address = results[0].formatted_address;
                  } else {
                    console.warn('Destination geocoding failed with status:', status);
                    // Fallback to locationService for address
                    locationService.reverseGeocode(event.latLng!.lat(), event.latLng!.lng())
                      .then((fallbackAddress) => {
                        address = fallbackAddress;
                      })
                      .catch((fallbackError) => {
                        console.warn('Destination fallback reverse geocoding also failed:', fallbackError);
                      });
                  }
                  
                  const newDestination: Location = {
                    latitude: event.latLng!.lat(),
                    longitude: event.latLng!.lng(),
                    address
                  };
                  
                  console.log('Destination marker moved to:', newDestination);
                  dispatch(setDestination(newDestination));
                  
                  // Recalculate route if pickup exists - with debouncing
                  if (pickup) {
                    setTimeout(() => {
                      if (mapRef.current) fetchAndDrawRoute();
                    }, 200);
                  }
                } catch (geocodeError) {
                  console.warn('Error processing geocode result:', geocodeError);
                  // Still update position even if address lookup fails
                  const fallbackDestination: Location = {
                    latitude: event.latLng!.lat(),
                    longitude: event.latLng!.lng(),
                    address: 'Unknown destination'
                  };
                  dispatch(setDestination(fallbackDestination));
                }
              });
            } catch (dragError) {
              console.warn('Error handling marker drag:', dragError);
            }
          }, 300);
        }
      });

      destinationMarkerRef.current = marker;
    } catch (error) {
      console.error('Error creating destination marker:', error);
    }
  };

  // Update markers and route when pickup/destination changes
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    let isComponentMounted = true;
    
    // Use a single batch update to prevent multiple DOM manipulations
    const batchedUpdate = () => {
      if (!isComponentMounted) return;
      
      try {
        // Only update markers if they actually changed
        const pickupChanged = pickup && (!pickupMarkerRef.current || 
          pickupMarkerRef.current.getPosition()?.lat() !== pickup.latitude ||
          pickupMarkerRef.current.getPosition()?.lng() !== pickup.longitude);
          
        const destinationChanged = destination && (!destinationMarkerRef.current || 
          destinationMarkerRef.current.getPosition()?.lat() !== destination.latitude ||
          destinationMarkerRef.current.getPosition()?.lng() !== destination.longitude);

        // Update pickup marker only if changed
        if (pickupChanged) {
          createPickupMarker(pickup!);
        }

        // Update destination marker only if changed
        if (destinationChanged) {
          createDestinationMarker(destination!);
        }

        // Route handling - only if both markers exist and something changed
        if (pickup && destination && (pickupChanged || destinationChanged)) {
          // Delay route calculation to prevent conflicts
          setTimeout(() => {
            if (isComponentMounted && mapRef.current) {
              fetchAndDrawRoute();
            }
          }, 100);
        } else if (!pickup || !destination) {
          // Clear route if either marker is missing
          clearRoute();
        }
        
      } catch (error) {
        console.error('Error updating markers and route:', error);
      }
    };

    // Use requestIdleCallback for better timing
    if (window.requestIdleCallback) {
      window.requestIdleCallback(batchedUpdate);
    } else {
      setTimeout(batchedUpdate, 0);
    }

    // Cleanup function
    return () => {
      isComponentMounted = false;
    };
  }, [pickup, destination]); // Only depend on pickup and destination

  // Fetch and draw route between pickup and destination
  const fetchAndDrawRoute = useCallback(() => {
    if (!pickup || !destination || !mapRef.current) {
      console.warn('Cannot fetch route: missing pickup, destination, or map');
      return;
    }

    const currentRouteId = Date.now(); // Create unique ID for this route request
    
    try {
      // Clear any existing route first - with safety check
      if (directionsRendererRef.current) {
        try {
          directionsRendererRef.current.setDirections({ routes: [] } as any);
        } catch (clearError) {
          console.warn('Error clearing existing route:', clearError);
        }
      }
      
      // Reset route info while loading
      setRouteInfo(null);
      setRouteCoordinates([]);

      // Ensure directionsRenderer is properly initialized
      if (!directionsRendererRef.current && mapRef.current) {
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: COLORS.primary,
            strokeWeight: 4,
          },
        });
        directionsRenderer.setMap(mapRef.current);
        directionsRendererRef.current = directionsRenderer;
      }

      // Use DirectionsService to get route
      const directionsService = new window.google.maps.DirectionsService();
      
      const request = {
        origin: { lat: pickup.latitude, lng: pickup.longitude },
        destination: { lat: destination.latitude, lng: destination.longitude },
        travelMode: window.google.maps.TravelMode.DRIVING
      };

      console.log('Fetching route with request:', request);

      directionsService.route(request, (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
        // Check if this is still the current route request
        if (!mapRef.current || !directionsRendererRef.current) {
          console.warn('Map or directions renderer no longer available');
          return;
        }
        
        try {
          console.log('Directions service response:', { status, result });
          
          if (status === 'OK' && result && result.routes && result.routes.length > 0) {
            // Route found successfully
            directionsRendererRef.current.setDirections(result);
            
            const route = result.routes[0];
            const leg = route.legs[0];
            
            // Update route info using React's batching
            const newRouteInfo = {
              distance: leg.distance?.text || 'Unknown distance',
              duration: leg.duration?.text || 'Unknown duration'
            };
            
            const coordinates: Coordinate[] = route.overview_path?.map(point => ({
              latitude: point.lat(),
              longitude: point.lng()
            })) || [];

            // Batch state updates
            setRouteInfo(newRouteInfo);
            setRouteCoordinates(coordinates);

            // Fit map to show entire route - with safety check
            if (route.bounds && mapRef.current) {
              try {
                mapRef.current.fitBounds(route.bounds);
              } catch (boundsError) {
                console.warn('Error fitting bounds:', boundsError);
              }
            }
          } else {
            // Route not found or error occurred
            console.warn('Directions request failed or no route found:', status);
            
            // Clear any existing route safely
            if (directionsRendererRef.current) {
              try {
                directionsRendererRef.current.setDirections({ routes: [] } as any);
              } catch (clearError) {
                console.warn('Error clearing route on failure:', clearError);
              }
            }
            
            // Set default route info for no route case
            const fallbackRouteInfo = {
              distance: 'Route not available',
              duration: 'Cannot calculate'
            };
            
            // Batch state updates
            setRouteInfo(fallbackRouteInfo);
            setRouteCoordinates([]);
            
            // Fit to show both markers instead of route
            if (mapRef.current && pickup && destination) {
              try {
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend({ lat: pickup.latitude, lng: pickup.longitude });
                bounds.extend({ lat: destination.latitude, lng: destination.longitude });
                
                const padding = { top: 50, right: 50, bottom: 50, left: 50 };
                mapRef.current.fitBounds(bounds, padding);
              } catch (boundsError) {
                console.warn('Error fitting bounds to markers:', boundsError);
              }
            }
          }
        } catch (routeError) {
          console.error('Error processing route result:', routeError);
          // Fallback handling
          setRouteInfo({
            distance: 'Error calculating route',
            duration: 'Please try again'
          });
          setRouteCoordinates([]);
        }
      });
    } catch (error) {
      console.error('Failed to fetch route:', error);
      
      // Clear route on error
      if (directionsRendererRef.current) {
        try {
          directionsRendererRef.current.setDirections({ routes: [] } as any);
        } catch (clearError) {
          console.warn('Error clearing route on exception:', clearError);
        }
      }
      
      setRouteInfo({
        distance: 'Error calculating route',
        duration: 'Please try again'
      });
      setRouteCoordinates([]);
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

    try {
      const newDestination: Location = {
        latitude: suggestion.coordinates.latitude,
        longitude: suggestion.coordinates.longitude,
        address: suggestion.address
      };
      
      // Use React's automatic batching for state updates
      // All these updates will be batched in React 18+
      dispatch(setDestination(newDestination));
      setSearchQuery('');
      setShowSuggestions(false);
      setSearchSuggestions([]);
      setSearchStatus('');
      
      // Clear suggestion markers in next frame
      requestAnimationFrame(() => {
        try {
          clearSuggestionMarkers();
        } catch (clearError) {
          console.warn('Error clearing suggestion markers:', clearError);
        }
      });
      
    } catch (error) {
      console.error('Error handling suggestion selection:', error);
    }
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
    console.log('MapScreen - routeInfo:', routeInfo);
    
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
    
    // Prepare navigation data - include route info even if no route was found
    const navigationData = {
      pickup: actualPickup,
      destination,
      routeInfo: routeInfo || {
        distance: 'Direct route',
        duration: 'Time varies'
      }
    };
    
    // Log the navigation scenario
    if (routeInfo && (routeInfo.distance === 'Route not available' || routeInfo.distance === 'Error calculating route')) {
      console.log('MapScreen - Proceeding with booking despite no calculated route');
      console.log('MapScreen - Driver can determine best route during ride');
    }
    
    console.log('MapScreen - navigating with data:', navigationData);
    
    // Store in localStorage as backup
    localStorage.setItem('rideBookingData', JSON.stringify(navigationData));
    
    // Navigate to ride options regardless of route calculation status
    // The ride confirmation screen will handle route display appropriately
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

  // Enhanced cleanup effect to prevent memory leaks and DOM issues
  useEffect(() => {
    // Track if component is mounted
    let isMounted = true;
    
    return () => {
      isMounted = false;
      
      console.log('MapScreen cleanup starting...');
      
      // Clear all timeouts with safety checks
      try {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
          searchTimeoutRef.current = null;
        }
      } catch (timeoutError) {
        console.warn('Error clearing search timeout:', timeoutError);
      }
      
      // Clear suggestion markers first
      try {
        if (suggestionMarkersRef.current && suggestionMarkersRef.current.length > 0) {
          suggestionMarkersRef.current.forEach((marker, index) => {
            try {
              if (marker && marker.setMap) {
                marker.setMap(null);
              }
            } catch (markerError) {
              console.warn(`Error clearing suggestion marker ${index}:`, markerError);
            }
          });
          suggestionMarkersRef.current = [];
        }
      } catch (suggestionError) {
        console.warn('Error clearing suggestion markers on unmount:', suggestionError);
      }
      
      // Clear main markers with safety checks
      try {
        if (pickupMarkerRef.current) {
          pickupMarkerRef.current.setMap(null);
          pickupMarkerRef.current = null;
        }
      } catch (pickupError) {
        console.warn('Error clearing pickup marker on unmount:', pickupError);
      }
      
      try {
        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.setMap(null);
          destinationMarkerRef.current = null;
        }
      } catch (destinationError) {
        console.warn('Error clearing destination marker on unmount:', destinationError);
      }
      
      // Clear directions renderer with safety checks
      try {
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setMap(null);
          directionsRendererRef.current = null;
        }
      } catch (directionsError) {
        console.warn('Error clearing directions renderer on unmount:', directionsError);
      }
      
      // Clear map reference and remove all listeners
      try {
        if (mapRef.current) {
          // Remove all event listeners
          window.google?.maps?.event?.clearInstanceListeners(mapRef.current);
          mapRef.current = null;
        }
      } catch (mapError) {
        console.warn('Error clearing map on unmount:', mapError);
      }
      
      // Clear places service reference
      try {
        if (placesServiceRef.current) {
          placesServiceRef.current = null;
        }
      } catch (placesError) {
        console.warn('Error clearing places service on unmount:', placesError);
      }
      
      console.log('MapScreen cleanup completed');
    };
  }, []); // Empty dependency array - only cleanup on unmount

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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Clear all search-related state at once
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
          {showSuggestions && Array.isArray(searchSuggestions) && (
            <div className="search-suggestions">
              {isSearching ? (
                <div key="loading-suggestions" className="loading-suggestions">Searching...</div>
              ) : searchSuggestions.length > 0 ? (
                searchSuggestions.map((suggestion, index) => {
                  // Create truly stable key that won't change during renders
                  const stableKey = suggestion.id || `suggestion-${index}-${suggestion.name?.slice(0, 10) || 'unknown'}`;
                  
                  return (
                    <div
                      key={stableKey}
                      className="search-suggestion"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Batch state updates to prevent conflicts
                        setTimeout(() => {
                          handleSuggestionSelect(suggestion);
                        }, 0);
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
          <button 
            onClick={() => {
              console.log('Getting new nearby location...');
              locationService.getNearbyLocation()
                .then((nearbyLocation) => {
                  console.log('Got nearby location:', nearbyLocation);
                  // Add slight offset to make it different from current pickup
                  const offsetLocation = {
                    ...nearbyLocation,
                    latitude: nearbyLocation.latitude + (Math.random() - 0.5) * 0.02,
                    longitude: nearbyLocation.longitude + (Math.random() - 0.5) * 0.02,
                    address: 'New Nearby Location'
                  };
                  dispatch(setDestination(offsetLocation));
                })
                .catch((error) => {
                  console.error('Failed to get new nearby location:', error);
                  // Fallback to a default nearby location
                  const fallbackLocation = {
                    latitude: 23.7808,
                    longitude: 90.4079,
                    address: 'Fallback Nearby Location, Dhaka'
                  };
                  dispatch(setDestination(fallbackLocation));
                });
            }} 
            title="Get new nearby location using GoMaps"
          >
            <span role="img" aria-label="refresh location">🔄</span>
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
                  {(routeInfo.distance === 'Route not available' || routeInfo.distance === 'Error calculating route') && (
                    <span style={{ color: COLORS.textSecondary, fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                      (Direct route may still be available)
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="booking-buttons">
              <button 
                className="book-ride-btn"
                onClick={handleBookRide}
                disabled={isBookingRide}
                style={{
                  opacity: (routeInfo?.distance === 'Error calculating route') ? 0.8 : 1
                }}
              >
                {isBookingRide ? 'Booking...' : 
                 (routeInfo?.distance === 'Route not available' || routeInfo?.distance === 'Error calculating route') ? 
                 'Book Ride (No Route)' : 'Book Now'}
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
            maxWidth: '300px'
          }}>
            <div><strong>🔧 Debug Info</strong></div>
            <div>Current: {currentLocation ? '✓' : '✗'}</div>
            <div>Pickup: {pickup ? '✓' : '✗'}</div>
            <div>Destination: {destination ? '✓' : '✗'}</div>
            <div>Google Maps: {window.google ? '✓' : '✗'}</div>
            <div>GoMaps API: {process.env.REACT_APP_GOMAPS_API_KEY ? '✓' : '✗'}</div>
            
            {pickup && (
              <div style={{ marginTop: '0.5rem', padding: '0.3rem', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                <div><strong>📍 Pickup:</strong></div>
                <div>{pickup.latitude.toFixed(6)}, {pickup.longitude.toFixed(6)}</div>
                <div style={{ fontSize: '0.7rem' }}>{pickup.address}</div>
              </div>
            )}
            
            {destination && (
              <div style={{ marginTop: '0.5rem', padding: '0.3rem', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                <div><strong>🎯 Destination:</strong></div>
                <div>{destination.latitude.toFixed(6)}, {destination.longitude.toFixed(6)}</div>
                <div style={{ fontSize: '0.7rem' }}>{destination.address}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapScreen; 
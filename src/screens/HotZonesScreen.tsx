/// <reference types="google.maps" />

import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { COLORS, STYLES } from '../styles/theme';

// Mock hot zone data
const hotZones = [
  {
    id: '1',
    name: 'Downtown Business District',
    location: { latitude: 23.8103, longitude: 90.4125 },
    demandLevel: 'high',
    averageEarnings: 45.50,
    activeRequests: 12,
    avgWaitTime: '3 min',
    description: 'High demand during business hours and lunch time',
    hotHours: ['9AM-11AM', '12PM-2PM', '5PM-7PM']
  },
  {
    id: '2',
    name: 'Airport Terminal',
    location: { latitude: 23.8203, longitude: 90.4225 },
    demandLevel: 'very-high',
    averageEarnings: 62.30,
    activeRequests: 8,
    avgWaitTime: '1 min',
    description: 'Consistent high demand with longer trips',
    hotHours: ['6AM-9AM', '6PM-10PM']
  },
  {
    id: '3',
    name: 'University Campus',
    location: { latitude: 23.8150, longitude: 90.4050 },
    demandLevel: 'medium',
    averageEarnings: 28.75,
    activeRequests: 6,
    avgWaitTime: '5 min',
    description: 'Peak during class hours and weekends',
    hotHours: ['8AM-10AM', '2PM-4PM', '8PM-11PM']
  },
  {
    id: '4',
    name: 'Shopping Mall District',
    location: { latitude: 23.8050, longitude: 90.4175 },
    demandLevel: 'high',
    averageEarnings: 38.90,
    activeRequests: 9,
    avgWaitTime: '4 min',
    description: 'Weekend rushes and evening shopping',
    hotHours: ['11AM-1PM', '6PM-9PM']
  },
  {
    id: '5',
    name: 'Hospital Complex',
    location: { latitude: 23.8175, longitude: 90.4100 },
    demandLevel: 'medium',
    averageEarnings: 32.15,
    activeRequests: 4,
    avgWaitTime: '6 min',
    description: 'Steady demand throughout the day',
    hotHours: ['24/7']
  }
];

const HotZonesScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentLocation } = useAppSelector((state) => state.location);
  const { user } = useAppSelector((state) => state.auth);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [timeFilter, setTimeFilter] = useState('now');

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && window.google && !mapRef.current) {
      initMap();
    }
  }, [currentLocation]);

  const initMap = () => {
    if (!mapContainerRef.current || !window.google) return;

    const defaultCenter = currentLocation 
      ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
      : { lat: 23.8103, lng: 90.4125 };

    const mapOptions: google.maps.MapOptions = {
      center: defaultCenter,
      zoom: 12,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#e9e9e9' }]
        }
      ]
    };

    const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
    mapRef.current = map;
    setMapLoaded(true);

    // Add hot zone markers
    hotZones.forEach(zone => {
      createHotZoneMarker(zone, map);
    });
  };

  const createHotZoneMarker = (zone: any, map: google.maps.Map) => {
    const { demandLevel } = zone;
    
    // Create custom marker based on demand level
    const markerColor = demandLevel === 'very-high' ? '#FF4444' : 
                       demandLevel === 'high' ? '#FF8800' : '#FFA500';
    
    const marker = new window.google.maps.Marker({
      position: { lat: zone.location.latitude, lng: zone.location.longitude },
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: markerColor,
        fillOpacity: 0.8,
        strokeWeight: 2,
        strokeColor: '#FFFFFF',
        scale: demandLevel === 'very-high' ? 20 : demandLevel === 'high' ? 15 : 12
      },
      title: zone.name
    });

    // Create heat circle around the zone
    const heatCircle = new window.google.maps.Circle({
      strokeColor: markerColor,
      strokeOpacity: 0.3,
      strokeWeight: 2,
      fillColor: markerColor,
      fillOpacity: 0.15,
      map: map,
      center: { lat: zone.location.latitude, lng: zone.location.longitude },
      radius: demandLevel === 'very-high' ? 2000 : demandLevel === 'high' ? 1500 : 1000
    });

    // Add click listener
    marker.addListener('click', () => {
      setSelectedZone(selectedZone === zone.id ? null : zone.id);
      map.panTo({ lat: zone.location.latitude, lng: zone.location.longitude });
    });
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'very-high': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#FFA500';
      default: return '#FFD700';
    }
  };

  const getDemandIcon = (level: string) => {
    switch (level) {
      case 'very-high': return '🔥🔥🔥';
      case 'high': return '🔥🔥';
      case 'medium': return '🔥';
      default: return '⭐';
    }
  };

  const handleNavigateToZone = (zone: any) => {
    // Here you would typically integrate with a navigation app or show directions
    alert(`Navigation to ${zone.name} would open here`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        backgroundColor: COLORS.white,
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: STYLES.card.boxShadow
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              ...STYLES.buttonSecondary,
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem'
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: COLORS.text,
              margin: 0
            }}>
              🔥 Hot Zones
            </h1>
            <p style={{
              color: COLORS.textSecondary,
              margin: 0,
              fontSize: '0.9rem'
            }}>
              Find high-demand areas to maximize earnings
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['now', 'today', 'week'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              style={{
                ...STYLES.buttonSecondary,
                padding: '0.5rem 1rem',
                backgroundColor: timeFilter === filter ? COLORS.primary : COLORS.accent,
                color: timeFilter === filter ? COLORS.white : COLORS.text,
                textTransform: 'capitalize',
                fontSize: '0.8rem'
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Map */}
        <div style={{
          gridColumn: window.innerWidth > 768 ? 'span 2' : 'span 1',
          backgroundColor: COLORS.white,
          borderRadius: '16px',
          padding: '1rem',
          boxShadow: STYLES.card.boxShadow,
          height: '500px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: COLORS.text,
              margin: 0
            }}>
              🗺️ Demand Heat Map
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.8rem',
              color: COLORS.textSecondary
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#FF4444'
                }} />
                Very High
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#FF8800'
                }} />
                High
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#FFA500'
                }} />
                Medium
              </div>
            </div>
          </div>
          
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: 'calc(100% - 60px)',
              borderRadius: '8px',
              backgroundColor: '#f0f0f0'
            }}
          />
        </div>

        {/* Zone List */}
        <div style={{
          backgroundColor: COLORS.white,
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: STYLES.card.boxShadow,
          height: 'fit-content',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: COLORS.text,
            marginBottom: '1.5rem'
          }}>
            📊 Active Hot Zones
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {hotZones.map((zone) => (
              <div
                key={zone.id}
                style={{
                  padding: '1rem',
                  border: selectedZone === zone.id ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                  borderRadius: '12px',
                  backgroundColor: selectedZone === zone.id ? COLORS.accent : COLORS.background,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: COLORS.text,
                      margin: '0 0 0.25rem 0'
                    }}>
                      {zone.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem'
                    }}>
                      <span>{getDemandIcon(zone.demandLevel)}</span>
                      <span style={{
                        color: getDemandColor(zone.demandLevel),
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}>
                        {zone.demandLevel.replace('-', ' ')} Demand
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      color: COLORS.primary
                    }}>
                      ${zone.averageEarnings}/hr
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: COLORS.textSecondary
                    }}>
                      {zone.activeRequests} requests
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  fontSize: '0.8rem',
                  color: COLORS.textSecondary,
                  marginBottom: '0.75rem'
                }}>
                  <div>⏱️ Wait: {zone.avgWaitTime}</div>
                  <div>🚗 {zone.activeRequests} active</div>
                </div>

                <p style={{
                  fontSize: '0.8rem',
                  color: COLORS.textSecondary,
                  margin: '0 0 0.75rem 0',
                  lineHeight: '1.4'
                }}>
                  {zone.description}
                </p>

                {selectedZone === zone.id && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: COLORS.textSecondary,
                      marginBottom: '0.5rem'
                    }}>
                      Peak Hours: {zone.hotHours.join(', ')}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToZone(zone);
                        }}
                        style={{
                          ...STYLES.buttonPrimary,
                          padding: '0.5rem 1rem',
                          fontSize: '0.8rem',
                          flex: 1
                        }}
                      >
                        🧭 Navigate
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Set as preferred zone
                          alert('Zone set as preferred!');
                        }}
                        style={{
                          ...STYLES.buttonSecondary,
                          padding: '0.5rem 1rem',
                          fontSize: '0.8rem',
                          flex: 1
                        }}
                      >
                        ⭐ Favorite
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Earnings Summary */}
        <div style={{
          backgroundColor: COLORS.white,
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: STYLES.card.boxShadow,
          height: 'fit-content'
        }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: COLORS.text,
            marginBottom: '1.5rem'
          }}>
            💰 Earnings Potential
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: COLORS.accent,
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: COLORS.primary
              }}>
                $62.30
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: COLORS.textSecondary
              }}>
                Highest Zone
              </div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: COLORS.accent,
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: COLORS.primary
              }}>
                $41.50
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: COLORS.textSecondary
              }}>
                Average/Hour
              </div>
            </div>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: COLORS.background,
            borderRadius: '12px',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: COLORS.text,
              margin: '0 0 0.75rem 0'
            }}>
              📈 Today's Stats
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.9rem'
              }}>
                <span style={{ color: COLORS.textSecondary }}>Total Requests</span>
                <span style={{ color: COLORS.text, fontWeight: '500' }}>39</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.9rem'
              }}>
                <span style={{ color: COLORS.textSecondary }}>Peak Hours</span>
                <span style={{ color: COLORS.text, fontWeight: '500' }}>5PM-7PM</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.9rem'
              }}>
                <span style={{ color: COLORS.textSecondary }}>Avg Wait Time</span>
                <span style={{ color: COLORS.text, fontWeight: '500' }}>3.8 min</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/driver')}
            style={{
              ...STYLES.buttonPrimary,
              width: '100%',
              height: '3rem',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            🚗 Start Driving
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotZonesScreen; 
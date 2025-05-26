import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { setPickup, setDestination, searchPlaces } from '../redux/slices/locationSlice';
import { COLORS, STYLES } from '../styles/theme';

const LocationSearchScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchResults, loading } = useAppSelector((state) => state.location);
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'pickup' | 'destination'>('pickup');

  const handleSearch = async () => {
    if (query.trim()) {
      dispatch(searchPlaces(query));
    }
  };

  const handleLocationSelect = (location: any) => {
    if (searchType === 'pickup') {
      dispatch(setPickup(location));
    } else {
      dispatch(setDestination(location));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      padding: '1rem'
    }}>
      <div style={{
        ...STYLES.card,
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1>Search Location</h1>
        
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a location..."
            style={{
              ...STYLES.input,
              marginBottom: '0.5rem'
            }}
          />
          <button onClick={handleSearch} style={STYLES.buttonPrimary}>
            Search
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input
              type="radio"
              checked={searchType === 'pickup'}
              onChange={() => setSearchType('pickup')}
            />
            Pickup Location
          </label>
          <label style={{ marginLeft: '1rem' }}>
            <input
              type="radio"
              checked={searchType === 'destination'}
              onChange={() => setSearchType('destination')}
            />
            Destination
          </label>
        </div>

        {loading && <p>Searching...</p>}

        <div>
          {searchResults.map((result, index) => (
            <div
              key={result.placeId || index}
              onClick={() => handleLocationSelect(result)}
              style={{
                padding: '0.5rem',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '4px',
                marginBottom: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <strong>{result.address}</strong>
              <br />
              <small>{result.placeId}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationSearchScreen; 
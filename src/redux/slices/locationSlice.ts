import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import locationService, { PlaceDetails } from '../../services/locationService';
import { Location } from '../../services/rideService';

// Interface for pickup and destination
interface PickupDestination {
  pickup: Location | null;
  destination: Location | null;
}

// Define the state
interface LocationState extends PickupDestination {
  currentLocation: Location | null;
  savedPlaces: Location[];
  searchResults: PlaceDetails[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: LocationState = {
  currentLocation: null,
  pickup: null,
  destination: null,
  savedPlaces: [],
  searchResults: [],
  loading: false,
  error: null,
};

// Async thunks
export const getCurrentLocation = createAsyncThunk(
  'location/getCurrentLocation',
  async (_, { rejectWithValue }) => {
    try {
      return await locationService.getCurrentLocation();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get current location');
    }
  }
);

export const searchPlaces = createAsyncThunk(
  'location/searchPlaces',
  async (query: string, { rejectWithValue }) => {
    try {
      return await locationService.searchPlaces(query);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search places');
    }
  }
);

export const getPlaceDetails = createAsyncThunk(
  'location/getPlaceDetails',
  async (placeId: string, { rejectWithValue }) => {
    try {
      return await locationService.getPlaceDetails(placeId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get place details');
    }
  }
);

export const getSavedPlaces = createAsyncThunk(
  'location/getSavedPlaces',
  async (_, { rejectWithValue }) => {
    try {
      return await locationService.getSavedPlaces();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get saved places');
    }
  }
);

export const savePlace = createAsyncThunk(
  'location/savePlace',
  async ({ place, label }: { place: Location; label: string }, { rejectWithValue }) => {
    try {
      return await locationService.savePlaceByUser(place, label);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save place');
    }
  }
);

// Create the location slice
const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setPickup: (state, action: PayloadAction<Location | null>) => {
      state.pickup = action.payload;
    },
    setDestination: (state, action: PayloadAction<Location | null>) => {
      state.destination = action.payload;
    },
    swapPickupAndDestination: (state) => {
      const temp = state.pickup;
      state.pickup = state.destination;
      state.destination = temp;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    resetLocationError: (state) => {
      state.error = null;
    },
    resetLocationState: (state) => {
      state.pickup = null;
      state.destination = null;
      state.searchResults = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get current location
      .addCase(getCurrentLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLocation = action.payload;
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Search places
      .addCase(searchPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPlaces.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get place details
      .addCase(getPlaceDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlaceDetails.fulfilled, (state, action) => {
        state.loading = false;
        // We don't set it directly here as the caller will use the returned value
      })
      .addCase(getPlaceDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get saved places
      .addCase(getSavedPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSavedPlaces.fulfilled, (state, action) => {
        state.loading = false;
        state.savedPlaces = action.payload;
      })
      .addCase(getSavedPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save place
      .addCase(savePlace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePlace.fulfilled, (state, action) => {
        state.loading = false;
        state.savedPlaces.push(action.payload);
      })
      .addCase(savePlace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setPickup,
  setDestination,
  swapPickupAndDestination,
  clearSearchResults,
  resetLocationError,
  resetLocationState,
} = locationSlice.actions;

export default locationSlice.reducer; 
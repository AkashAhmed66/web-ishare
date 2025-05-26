import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import rideService, {
  Ride,
  CreateRideData,
  RideStatus,
  UpdateRideStatusData,
  RidePriceEstimate,
} from '../../services/rideService';

// Define the state
interface RideState {
  activeRide: Ride | null;
  rides: Ride[];
  priceEstimate: RidePriceEstimate | null;
  scheduledRides: Ride[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: RideState = {
  activeRide: null,
  rides: [],
  priceEstimate: null,
  scheduledRides: [],
  loading: false,
  error: null,
};

// Async thunks
export const createRide = createAsyncThunk(
  'ride/createRide',
  async (data: CreateRideData, { rejectWithValue }) => {
    try {
      return await rideService.createRide(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create ride');
    }
  }
);

export const getPriceEstimate = createAsyncThunk(
  'ride/getPriceEstimate',
  async ({ pickup, destination }: { pickup: any; destination: any }, { rejectWithValue }) => {
    try {
      return await rideService.getPriceEstimate(pickup, destination);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get price estimate');
    }
  }
);

export const getRideById = createAsyncThunk(
  'ride/getRideById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await rideService.getRideById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get ride');
    }
  }
);

export const getUserRides = createAsyncThunk(
  'ride/getUserRides',
  async (status: RideStatus | undefined, { rejectWithValue }) => {
    try {
      return await rideService.getUserRides(status);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user rides');
    }
  }
);

export const updateRideStatus = createAsyncThunk(
  'ride/updateRideStatus',
  async ({ rideId, data }: { rideId: string; data: UpdateRideStatusData }, { rejectWithValue }) => {
    try {
      return await rideService.updateRideStatus(rideId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update ride status');
    }
  }
);

export const cancelRide = createAsyncThunk(
  'ride/cancelRide',
  async ({ rideId, reason }: { rideId: string; reason?: string }, { rejectWithValue }) => {
    try {
      return await rideService.cancelRide(rideId, reason);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel ride');
    }
  }
);

export const scheduleRide = createAsyncThunk(
  'ride/scheduleRide',
  async (data: CreateRideData, { rejectWithValue }) => {
    try {
      return await rideService.scheduleRide(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to schedule ride');
    }
  }
);

export const getScheduledRides = createAsyncThunk(
  'ride/getScheduledRides',
  async (_, { rejectWithValue }) => {
    try {
      return await rideService.getRecurringRides();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get scheduled rides');
    }
  }
);

// Create the ride slice
const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    resetRideError: (state) => {
      state.error = null;
    },
    setActiveRide: (state, action: PayloadAction<Ride | null>) => {
      state.activeRide = action.payload;
    },
    clearPriceEstimate: (state) => {
      state.priceEstimate = null;
    },
    resetRideState: (state) => {
      state.activeRide = null;
      state.priceEstimate = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create ride
      .addCase(createRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRide.fulfilled, (state, action) => {
        state.loading = false;
        state.activeRide = action.payload;
        state.rides.unshift(action.payload);
      })
      .addCase(createRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get price estimate
      .addCase(getPriceEstimate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPriceEstimate.fulfilled, (state, action) => {
        state.loading = false;
        state.priceEstimate = action.payload;
      })
      .addCase(getPriceEstimate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get ride by ID
      .addCase(getRideById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRideById.fulfilled, (state, action) => {
        state.loading = false;
        state.activeRide = action.payload;
      })
      .addCase(getRideById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get user rides
      .addCase(getUserRides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserRides.fulfilled, (state, action) => {
        state.loading = false;
        state.rides = action.payload;
      })
      .addCase(getUserRides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update ride status
      .addCase(updateRideStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRideStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.activeRide = action.payload;
        // Update ride in the rides array
        const index = state.rides.findIndex((ride) => ride.id === action.payload.id);
        if (index !== -1) {
          state.rides[index] = action.payload;
        }
      })
      .addCase(updateRideStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Cancel ride
      .addCase(cancelRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelRide.fulfilled, (state, action) => {
        state.loading = false;
        state.activeRide = action.payload;
        // Update ride in the rides array
        const index = state.rides.findIndex((ride) => ride.id === action.payload.id);
        if (index !== -1) {
          state.rides[index] = action.payload;
        }
      })
      .addCase(cancelRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Schedule ride
      .addCase(scheduleRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scheduleRide.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduledRides.unshift(action.payload);
      })
      .addCase(scheduleRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get scheduled rides
      .addCase(getScheduledRides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getScheduledRides.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduledRides = action.payload;
      })
      .addCase(getScheduledRides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetRideError, setActiveRide, clearPriceEstimate, resetRideState } = rideSlice.actions;
export default rideSlice.reducer; 
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService, { User, LoginData, RegisterData } from '../../services/authService';
import * as LocalStorage from '../../utils/localStorage';

// Define the state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

// Initialize auth state from storage
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const { user, token } = authService.initializeFromStorage();
      
      if (user && token) {
        console.log('Found stored auth data, restoring user session for:', user.email);
        
        // Return the stored user directly to maintain the actual logged-in user
        // Only validate token if we want to double-check, but prioritize stored user data
        return user;
        
        // Optional: Uncomment below if you want to validate token with server
        // But this might replace actual user with dummy/mock user
        /*
        try {
          const currentUser = await authService.getCurrentUser();
          return currentUser;
        } catch (error: any) {
          console.warn('Token validation failed, but keeping stored user:', error.message);
          // If token validation fails, we could either:
          // 1. Clear storage and require re-login (strict security)
          // 2. Keep the stored user (better UX, assume token is still valid)
          
          // For now, keep the stored user for better UX
          return user;
        }
        */
      }
      
      console.log('No stored auth data found');
      return null;
    } catch (error: any) {
      console.error('Error during auth initialization:', error);
      authService.clearStoredAuth();
      return rejectWithValue('Failed to initialize auth state');
    }
  }
);

// Validate auth token with server (optional, separate from initialization)
export const validateAuthToken = createAsyncThunk(
  'auth/validateAuthToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const currentUser = state.auth.user;
      
      if (!currentUser) {
        return rejectWithValue('No user to validate');
      }
      
      console.log('Validating auth token for user:', currentUser.email);
      const validatedUser = await authService.getCurrentUser();
      
      if (validatedUser) {
        console.log('Token validation successful');
        return validatedUser;
      } else {
        console.log('Token validation failed');
        authService.clearStoredAuth();
        return rejectWithValue('Token validation failed');
      }
    } catch (error: any) {
      console.log('Token validation error, clearing auth data');
      authService.clearStoredAuth();
      return rejectWithValue(error.response?.data?.message || 'Token validation failed');
    }
  }
);

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginData, { rejectWithValue }) => {
    try {
      const user = await authService.login(credentials);
      console.log('Login successful for user:', user.email, 'ID:', user.id);
      return user;
    } catch (error: any) {
      console.error('Login failed:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to login');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const user = await authService.register(data);
      console.log('Registration successful for user:', user.email, 'ID:', user.id);
      return user;
    } catch (error: any) {
      console.error('Registration failed:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to register');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const currentUser = state.auth.user;
      
      if (currentUser) {
        console.log('Logging out user:', currentUser.email);
      }
      
      await authService.logout();
      console.log('User logged out successfully');
      return null;
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local data
      authService.clearStoredAuth();
      return rejectWithValue(error.response?.data?.message || 'Failed to logout');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // Check if token exists
      const token = authService.getStoredToken();
      if (!token) {
        console.log('No auth token found');
        return null;
      }
      
      console.log('Validating stored auth token...');
      return await authService.getCurrentUser();
    } catch (error: any) {
      // Clear stored data on error
      console.log('Token validation failed, clearing stored auth data');
      authService.clearStoredAuth();
      return rejectWithValue(error.response?.data?.message || 'Failed to get current user');
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        if (action.payload) {
          console.log('Auth state restored from storage:', action.payload.email);
        } else {
          console.log('No valid stored auth state found');
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
    
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        console.log('User logged in successfully:', action.payload.email);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        console.log('User registered successfully:', action.payload.email);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        console.log('User logged out successfully');
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        console.log('Logout completed (with errors)');
      })
      
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        if (action.payload) {
          console.log('Current user validated:', action.payload.email);
        }
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        console.log('Current user validation failed');
      })
      
      // Validate auth token
      .addCase(validateAuthToken.pending, (state) => {
        // Don't set loading for validation as it's a background process
        state.error = null;
      })
      .addCase(validateAuthToken.fulfilled, (state, action) => {
        // Only update user if validation returns a different user
        if (action.payload && action.payload.id === state.user?.id) {
          console.log('Token validation successful, user data confirmed');
        } else if (action.payload) {
          console.log('Token validation returned updated user data');
          state.user = action.payload;
        }
      })
      .addCase(validateAuthToken.rejected, (state, action) => {
        console.log('Token validation failed, user will be logged out');
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer; 
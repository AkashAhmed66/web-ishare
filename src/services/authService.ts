import apiService from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'user' | 'rider' | 'driver' | 'admin';
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

// Registration data interface
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'user' | 'rider' | 'driver';
}

// Login data interface
export interface LoginData {
  email: string;
  password: string;
}

// Auth response interface
interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

// Get stored auth token
const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Get stored user
const getStoredUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      return null;
    }
  }
  return null;
};

// Initialize from stored data
const initializeFromStorage = (): { user: User | null; token: string | null } => {
  const token = getStoredToken();
  const user = getStoredUser();
  
  // Validate that both token and user exist together
  if (token && user) {
    console.log('Auth data found in storage:', { user: user.email, hasToken: !!token });
    return { user, token };
  } else if (token || user) {
    // Inconsistent state - clear everything
    console.warn('Inconsistent auth state detected, clearing storage');
    clearStoredAuth();
    return { user: null, token: null };
  }
  
  return { user: null, token: null };
};

// Clear stored auth data
const clearStoredAuth = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Store auth data
const storeAuthData = (user: User, token: string, refreshToken?: string): void => {
  localStorage.setItem('auth_token', token);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
  localStorage.setItem('user', JSON.stringify(user));
};

// Register new user
const register = async (data: RegisterData): Promise<User> => {
  try {
    const response = await apiService.post<AuthResponse>(API_ENDPOINTS.REGISTER, data);
    
    // Store auth data
    storeAuthData(response.user, response.token, response.refreshToken);
    
    return response.user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

// Login user
const login = async (data: LoginData): Promise<User> => {
  try {
    const response = await apiService.post<AuthResponse>(API_ENDPOINTS.LOGIN, data);
    
    // Store auth data
    storeAuthData(response.user, response.token, response.refreshToken);
    
    return response.user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Logout user
const logout = async (): Promise<void> => {
  try {
    // Call logout API
    if (isAuthenticated()) {
      await apiService.post(API_ENDPOINTS.LOGOUT);
    }
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    // Clear local storage
    clearStoredAuth();
  }
};

// Get current user profile
const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiService.get<User>(API_ENDPOINTS.CURRENT_USER);
    
    // Update stored user
    localStorage.setItem('user', JSON.stringify(response));
    
    return response;
  } catch (error) {
    console.error('Failed to get current user:', error);
    // Clear auth data if user fetch fails (likely token expired)
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as any;
      if (apiError.response?.status === 401) {
        console.log('Auth token expired, clearing stored data');
        clearStoredAuth();
      }
    }
    throw error;
  }
};

// Reset password request
const forgotPassword = async (email: string): Promise<void> => {
  try {
    await apiService.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
  } catch (error) {
    console.error('Forgot password request failed:', error);
    throw error;
  }
};

// Reset password with token
const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    await apiService.post(API_ENDPOINTS.RESET_PASSWORD, {
      token,
      password: newPassword,
    });
  } catch (error) {
    console.error('Reset password failed:', error);
    throw error;
  }
};

// Verify email
const verifyEmail = async (token: string): Promise<void> => {
  try {
    await apiService.post(API_ENDPOINTS.VERIFY_EMAIL, { token });
  } catch (error) {
    console.error('Email verification failed:', error);
    throw error;
  }
};

// Auth service object with all functions
export const authService = {
  isAuthenticated,
  getStoredUser,
  getStoredToken,
  initializeFromStorage,
  clearStoredAuth,
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
};

export default authService; 
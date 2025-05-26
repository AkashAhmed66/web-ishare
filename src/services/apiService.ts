import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_URL, DEFAULT_HEADERS, REQUEST_TIMEOUT } from '../config/apiConfig';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT,
  headers: DEFAULT_HEADERS,
});

// Add a request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle unauthorized errors (401) - token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token or logout
      try {
        // Refresh token logic could go here
        // const refreshToken = localStorage.getItem('refresh_token');
        // const response = await refreshTokenCall(refreshToken);
        // localStorage.setItem('auth_token', response.data.token);
        // originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
        // return api(originalRequest);
        
        // For now, just clear tokens and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Log errors
    console.error('API Error:', error.response?.data || error.message);
    
    return Promise.reject(error);
  }
);

// Generic API request function
const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// REST API methods
export const apiService = {
  get: <T>(url: string, params?: any): Promise<T> => {
    return apiRequest<T>({
      method: 'GET',
      url,
      params,
    });
  },
  
  post: <T>(url: string, data?: any): Promise<T> => {
    return apiRequest<T>({
      method: 'POST',
      url,
      data,
    });
  },
  
  put: <T>(url: string, data?: any): Promise<T> => {
    return apiRequest<T>({
      method: 'PUT',
      url,
      data,
    });
  },
  
  patch: <T>(url: string, data?: any): Promise<T> => {
    return apiRequest<T>({
      method: 'PATCH',
      url,
      data,
    });
  },
  
  delete: <T>(url: string): Promise<T> => {
    return apiRequest<T>({
      method: 'DELETE',
      url,
    });
  },
};

export default apiService; 
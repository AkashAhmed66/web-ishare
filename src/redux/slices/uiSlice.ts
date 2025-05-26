import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast interface
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Modal interface
export interface Modal {
  id: string;
  component: string;
  props?: Record<string, any>;
}

export enum AppMode {
  PASSENGER = 'passenger',
  RIDER = 'rider'
}

// Define the state
interface UIState {
  toasts: Toast[];
  activeModal: Modal | null;
  isSidebarOpen: boolean;
  isMapFullscreen: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  appMode: AppMode;
}

// Initial state
const initialState: UIState = {
  toasts: [],
  activeModal: null,
  isSidebarOpen: false,
  isMapFullscreen: false,
  theme: 'light',
  loading: false,
  appMode: AppMode.PASSENGER,
};

// Create the UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toast actions
    showToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = Date.now().toString();
      state.toasts.push({
        ...action.payload,
        id,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // Modal actions
    showModal: (state, action: PayloadAction<Omit<Modal, 'id'>>) => {
      const id = Date.now().toString();
      state.activeModal = {
        ...action.payload,
        id,
      };
    },
    hideModal: (state) => {
      state.activeModal = null;
    },
    
    // Sidebar actions
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    
    // Map actions
    toggleMapFullscreen: (state: UIState) => {
      state.isMapFullscreen = !state.isMapFullscreen;
    },
    setMapFullscreen: (state: UIState, action: PayloadAction<boolean>) => {
      state.isMapFullscreen = action.payload;
    },
    
    // Theme actions
    toggleTheme: (state: UIState) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state: UIState, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    // Loading state
    setLoading: (state: UIState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // App mode actions
    setAppMode: (state: UIState, action: PayloadAction<AppMode>) => {
      state.appMode = action.payload;
    },
  },
});

export const {
  showToast,
  removeToast,
  clearToasts,
  showModal,
  hideModal,
  toggleSidebar,
  setSidebarOpen,
  toggleMapFullscreen,
  setMapFullscreen,
  toggleTheme,
  setTheme,
  setLoading,
  setAppMode,
} = uiSlice.actions;

export default uiSlice.reducer; 
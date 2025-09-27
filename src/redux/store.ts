import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import reducers
import authReducer from './slices/authSlice';
import rideReducer from './slices/rideSlice';
import locationReducer from './slices/locationSlice';
import notificationReducer from './slices/notificationSlice';
import messageReducer from './slices/messageSlice';
import uiReducer from './slices/uiSlice';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ride: rideReducer,
    location: locationReducer,
    notification: notificationReducer,
    message: messageReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values for certain actions
        ignoredActions: ['ride/setActiveRide'],
      },
    }),
});

// Types for Redux state and dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use in components
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store; 
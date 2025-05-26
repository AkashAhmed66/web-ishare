import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';

// Import layouts
import AuthLayout from '../components/layouts/AuthLayout';
import MainLayout from '../components/layouts/MainLayout';

// Import auth screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

// Import main screens
import HomeScreen from '../screens/HomeScreen';
import RideScreen from '../screens/RideScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RideHistoryScreen from '../screens/RideHistoryScreen';
import MapScreen from '../screens/MapScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChatScreen from '../screens/ChatScreen';
import ScheduleRideScreen from '../screens/ScheduleRideScreen';
import AppModeScreen from '../screens/AppModeScreen';
import RideConfirmationScreen from '../screens/RideConfirmationScreen';
import RideStatusScreen from '../screens/RideStatusScreen';
import LocationSearchScreen from '../screens/LocationSearchScreen';
import RideOptionsScreen from '../screens/RideOptionsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import HotZonesScreen from '../screens/HotZonesScreen';
import DriverSignupScreen from '../screens/DriverSignupScreen';
import DriverHomeScreen from '../screens/DriverHomeScreen';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public route component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes (authentication screens) */}
      <Route path="/login" element={
        <PublicRoute>
          <AuthLayout>
            <LoginScreen />
          </AuthLayout>
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <AuthLayout>
            <RegisterScreen />
          </AuthLayout>
        </PublicRoute>
      } />
      
      <Route path="/forgot-password" element={
        <PublicRoute>
          <AuthLayout>
            <ForgotPasswordScreen />
          </AuthLayout>
        </PublicRoute>
      } />
      
      <Route path="/reset-password" element={
        <PublicRoute>
          <AuthLayout>
            <ResetPasswordScreen />
          </AuthLayout>
        </PublicRoute>
      } />

      {/* Protected routes (main app) */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <HomeScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/app-mode" element={
        <ProtectedRoute>
          <AppModeScreen />
        </ProtectedRoute>
      } />

      <Route path="/map" element={
        <ProtectedRoute>
          <MainLayout>
            <MapScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/ride" element={
        <ProtectedRoute>
          <MainLayout>
            <RideScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/ride-confirmation" element={
        <ProtectedRoute>
          <MainLayout>
            <RideConfirmationScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/ride-status/:rideId" element={
        <ProtectedRoute>
          <MainLayout>
            <RideStatusScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/ride-options" element={
        <ProtectedRoute>
          <MainLayout>
            <RideOptionsScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/schedule-ride" element={
        <ProtectedRoute>
          <MainLayout>
            <ScheduleRideScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/location-search" element={
        <ProtectedRoute>
          <MainLayout>
            <LocationSearchScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/ride-history" element={
        <ProtectedRoute>
          <MainLayout>
            <RideHistoryScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <ProfileScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <SettingsScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/notifications" element={
        <ProtectedRoute>
          <MainLayout>
            <NotificationsScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/chat/:rideId?" element={
        <ProtectedRoute>
          <MainLayout>
            <ChatScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/payment" element={
        <ProtectedRoute>
          <MainLayout>
            <PaymentScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/hot-zones" element={
        <ProtectedRoute>
          <MainLayout>
            <HotZonesScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Driver routes */}
      <Route path="/driver-signup" element={
        <ProtectedRoute>
          <MainLayout>
            <DriverSignupScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/driver" element={
        <ProtectedRoute>
          <MainLayout>
            <DriverHomeScreen />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 
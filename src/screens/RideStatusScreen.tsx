import React from 'react';
import { useAppSelector } from '../redux/store';
import { COLORS, STYLES } from '../styles/theme';

const RideStatusScreen: React.FC = () => {
  const { activeRide, loading } = useAppSelector((state) => state.ride);

  if (loading) {
    return <div>Loading ride status...</div>;
  }

  if (!activeRide) {
    return <div>No active ride found.</div>;
  }

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
        <h1>Ride Status</h1>
        <p>Ride ID: {activeRide.id}</p>
        <p>Status: {activeRide.status}</p>
        <p>From: {activeRide.pickup?.address}</p>
        <p>To: {activeRide.destination?.address}</p>
      </div>
    </div>
  );
};

export default RideStatusScreen; 
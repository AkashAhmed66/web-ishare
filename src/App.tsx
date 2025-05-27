import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AppRoutes from './navigation/AppRoutes';
import { API_URL } from './config/apiConfig';
import * as LocalStorage from './utils/localStorage';
import { initializeAuth } from './redux/slices/authSlice';

function App() {
  // Log initialization and restore auth state
  useEffect(() => {
    console.log('===== IShare Web App Initializing =====');
    console.log('API URL:', API_URL);
    
    // Test localStorage availability and restore auth state
    const initializeApp = async () => {
      const isAvailable = LocalStorage.testLocalStorage();
      console.log(`LocalStorage available: ${isAvailable}`);
      
      if (!isAvailable) {
        console.warn('LocalStorage is not available. The app may not function correctly.');
        return;
      }

      // Initialize auth state from storage
      try {
        console.log('Initializing authentication state...');
        
        // Dispatch initializeAuth to restore and validate auth state
        store.dispatch(initializeAuth());
      } catch (error) {
        console.error('Error during auth initialization:', error);
      }
    };
    
    initializeApp();
  }, []);
  
  return (
    <Provider store={store}>
      <Router>
        <div className="app-container">
          <AppRoutes />
        </div>
      </Router>
    </Provider>
  );
}

export default App;

import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AppRoutes from './navigation/AppRoutes';
import { API_URL } from './config/apiConfig';
import * as LocalStorage from './utils/localStorage';

function App() {
  // Log initialization
  useEffect(() => {
    console.log('===== IShare Web App Initializing =====');
    console.log('API URL:', API_URL);
    
    // Test localStorage availability
    const checkStorage = async () => {
      const isAvailable = LocalStorage.testLocalStorage();
      console.log(`LocalStorage available: ${isAvailable}`);
      
      if (!isAvailable) {
        console.warn('LocalStorage is not available. The app may not function correctly.');
      }
    };
    
    checkStorage();
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

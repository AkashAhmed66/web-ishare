/**
 * Local Storage Utility
 * Web equivalent of AsyncStorage from React Native
 */

// Get item from localStorage with error handling
export const getItem = async (key: string): Promise<string | null> => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error);
    return null;
  }
};

// Set item in localStorage with error handling
export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting item in localStorage: ${key}`, error);
  }
};

// Remove item from localStorage with error handling
export const removeItem = async (key: string): Promise<void> => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from localStorage: ${key}`, error);
  }
};

// Clear all localStorage items with error handling
export const clear = async (): Promise<void> => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage', error);
  }
};

// Get multiple items from localStorage
export const multiGet = async (keys: string[]): Promise<Array<[string, string | null]>> => {
  try {
    return keys.map(key => [key, localStorage.getItem(key)]);
  } catch (error) {
    console.error('Error getting multiple items from localStorage', error);
    return keys.map(key => [key, null]);
  }
};

// Set multiple items in localStorage
export const multiSet = async (keyValuePairs: Array<[string, string]>): Promise<void> => {
  try {
    keyValuePairs.forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    console.error('Error setting multiple items in localStorage', error);
  }
};

// Remove multiple items from localStorage
export const multiRemove = async (keys: string[]): Promise<void> => {
  try {
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error removing multiple items from localStorage', error);
  }
};

// Get all keys in localStorage
export const getAllKeys = async (): Promise<string[]> => {
  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.error('Error getting all keys from localStorage', error);
    return [];
  }
};

// Store object in localStorage (with JSON.stringify)
export const setObject = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    localStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing object in localStorage: ${key}`, error);
  }
};

// Get object from localStorage (with JSON.parse)
export const getObject = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = localStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) as T : null;
  } catch (error) {
    console.error(`Error retrieving object from localStorage: ${key}`, error);
    return null;
  }
};

// Test if localStorage is available
export const testLocalStorage = (): boolean => {
  try {
    const testKey = '__test_key__';
    localStorage.setItem(testKey, 'test');
    const result = localStorage.getItem(testKey) === 'test';
    localStorage.removeItem(testKey);
    return result;
  } catch (error) {
    return false;
  }
};

export default {
  getItem,
  setItem,
  removeItem,
  clear,
  multiGet,
  multiSet,
  multiRemove,
  getAllKeys,
  setObject,
  getObject,
  testLocalStorage,
}; 
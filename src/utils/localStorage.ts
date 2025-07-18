/**
 * Utility functions for working with localStorage
 */

// Check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get item from localStorage with error handling
 * @param key - The key to retrieve
 * @param defaultValue - Default value if key doesn't exist or localStorage is unavailable
 */
export const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  if (!isLocalStorageAvailable()) {
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Set item in localStorage with error handling
 * @param key - The key to set
 * @param value - The value to store
 */
export const setLocalStorageItem = <T>(key: string, value: T): void => {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error);
  }
};

/**
 * Remove item from localStorage with error handling
 * @param key - The key to remove
 */
export const removeLocalStorageItem = (key: string): void => {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage item ${key}:`, error);
  }
};

/**
 * Clear all items from localStorage with error handling
 */
export const clearLocalStorage = (): void => {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { api, API_ENDPOINTS } from '@/lib/api';

// Define the shape of the authentication context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  addOrUpdateAddress: (address: any) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

// Register data interface
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Auth response interface
interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
  };
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props interface
interface AuthProviderProps {
  children: ReactNode;
}

// Local storage keys
const TOKEN_KEY = 'candleAuth_token';
const REFRESH_TOKEN_KEY = 'candleAuth_refreshToken';
const USER_KEY = 'candleAuth_user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Initialize auth state from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        const token = localStorage.getItem(TOKEN_KEY);
        
        if (storedUser && token) {
          // Validate token by fetching user profile
          try {
            const response = await api.get<{ success: boolean; data: { user: User } }>(
              API_ENDPOINTS.auth.me,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            
            if (response.success) {
              setUser(response.data.user);
            } else {
              // Token is invalid, clear storage
              clearAuthData();
            }
          } catch (error) {
            console.error('Error validating token:', error);
            clearAuthData();
          }
        } else {
          clearAuthData();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Clear authentication data
  const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  // Save authentication data
  const saveAuthData = (user: User, token: string, refreshToken?: string) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    setUser(user);
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.auth.login,
        { email, password }
      );
      
      if (response.success) {
        saveAuthData(
          response.data.user,
          response.data.token,
          response.data.refreshToken
        );
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.auth.register,
        userData
      );
      
      if (response.success) {
        saveAuthData(
          response.data.user,
          response.data.token,
          response.data.refreshToken
        );
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (token) {
        await api.post(
          API_ENDPOINTS.auth.logout,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      clearAuthData();
      setIsLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post(
        API_ENDPOINTS.auth.forgotPassword,
        { email }
      );
      
      if (!response.success) {
        setError('Failed to send password reset email. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post(
        API_ENDPOINTS.auth.resetPassword,
        { token, newPassword }
      );
      
      if (!response.success) {
        setError('Failed to reset password. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to reset password. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        setError('You must be logged in to update your profile.');
        return;
      }
      
      const response = await api.put(
        API_ENDPOINTS.auth.updateProfile,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.success) {
        setUser(prevUser => prevUser ? { ...prevUser, ...response.data.user } : null);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update profile. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        setError('You must be logged in to change your password.');
        return;
      }
      
      const response = await api.put(
        API_ENDPOINTS.auth.changePassword,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.success) {
        setError('Failed to change password. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to change password. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete account function
  const deleteAccount = async (password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        setError('You must be logged in to delete your account.');
        return;
      }
      
      const response = await api.delete(
        API_ENDPOINTS.auth.deleteAccount,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
        }
      );
      
      if (response.success) {
        clearAuthData();
      } else {
        setError('Failed to delete account. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete account. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add or update address function
  const addOrUpdateAddress = async (address: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        setError('You must be logged in to update your address.');
        return;
      }
      
      const response = await api.put(
        API_ENDPOINTS.auth.updateAddress,
        { address },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.success) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            addresses: response.data.addresses,
          };
        });
        
        // Update user in local storage
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem(USER_KEY, JSON.stringify({
            ...parsedUser,
            addresses: response.data.addresses,
          }));
        }
      } else {
        setError('Failed to update address. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update address. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete address function
  const deleteAddress = async (addressId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        setError('You must be logged in to delete an address.');
        return;
      }
      
      const response = await api.delete(
        `${API_ENDPOINTS.auth.deleteAddress}/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.success) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            addresses: response.data.addresses,
          };
        });
        
        // Update user in local storage
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem(USER_KEY, JSON.stringify({
            ...parsedUser,
            addresses: response.data.addresses,
          }));
        }
      } else {
        setError('Failed to delete address. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete address. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    deleteAccount,
    addOrUpdateAddress,
    deleteAddress,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
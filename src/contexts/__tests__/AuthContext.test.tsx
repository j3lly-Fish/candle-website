import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { api } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  API_ENDPOINTS: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
      me: '/api/auth/me',
      updateProfile: '/api/auth/update-profile',
      changePassword: '/api/auth/change-password',
      deleteAccount: '/api/auth/delete-account',
      updateAddress: '/api/auth/update-address',
      deleteAddress: '/api/auth/delete-address',
    },
  },
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses the auth context
const TestComponent = () => {
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    login, 
    register, 
    logout, 
    error, 
    clearError 
  } = useAuth();

  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="auth-state">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-email">{user?.email || 'No User'}</div>
      <div data-testid="error-message">{error || 'No Error'}</div>
      <button onClick={() => login('test@example.com', 'password123')}>Login</button>
      <button onClick={() => register({
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      })}>Register</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => clearError()}>Clear Error</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Default mock for API calls
    (api.get as jest.Mock).mockResolvedValue({ success: false });
    (api.post as jest.Mock).mockResolvedValue({ success: false });
    (api.put as jest.Mock).mockResolvedValue({ success: false });
    (api.delete as jest.Mock).mockResolvedValue({ success: false });
  });

  it('initializes with unauthenticated state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('No User');
  });

  it('handles login successfully', async () => {
    // Mock successful login response
    (api.post as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        user: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        },
        token: 'new-token',
        refreshToken: 'refresh-token'
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });

    // Click login button
    fireEvent.click(screen.getByText('Login'));

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    // Should have stored auth data in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('candleAuth_token', 'new-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('candleAuth_refreshToken', 'refresh-token');
  });

  it('handles registration successfully', async () => {
    // Mock successful registration response
    (api.post as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        user: {
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User'
        },
        token: 'new-token',
        refreshToken: 'refresh-token'
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });

    // Click register button
    fireEvent.click(screen.getByText('Register'));

    // Wait for registration to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('new@example.com');
    });
  });

  it('handles logout correctly', async () => {
    // Mock successful login response first
    (api.post as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        user: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        },
        token: 'new-token',
        refreshToken: 'refresh-token'
      }
    });

    // Mock successful logout
    (api.post as jest.Mock).mockResolvedValueOnce({ success: true });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });

    // Login first
    fireEvent.click(screen.getByText('Login'));

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
    });

    // Click logout button
    fireEvent.click(screen.getByText('Logout'));

    // Wait for logout to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No User');
    });

    // Should have cleared auth data from localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('candleAuth_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('candleAuth_refreshToken');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('candleAuth_user');
  });
});
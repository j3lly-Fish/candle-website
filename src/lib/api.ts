// API configuration and utilities

// Base API URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// API endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
    refreshToken: `${API_BASE_URL}/auth/refresh-token`,
    me: `${API_BASE_URL}/auth/me`,
    updateProfile: `${API_BASE_URL}/auth/update-profile`,
    changePassword: `${API_BASE_URL}/auth/change-password`,
    deleteAccount: `${API_BASE_URL}/auth/delete-account`,
    reactivateAccount: `${API_BASE_URL}/auth/reactivate-account`,
    updateAddress: `${API_BASE_URL}/auth/update-address`,
    deleteAddress: `${API_BASE_URL}/auth/delete-address`,
  },
  // Product endpoints
  products: {
    list: `${API_BASE_URL}/products`,
    detail: (id: string) => `${API_BASE_URL}/products/${id}`,
    create: `${API_BASE_URL}/products`,
    update: (id: string) => `${API_BASE_URL}/products/${id}`,
    delete: (id: string) => `${API_BASE_URL}/products/${id}`,
    options: `${API_BASE_URL}/products/options`,
    search: `${API_BASE_URL}/products/search`,
  },
  // Cart endpoints
  cart: {
    get: `${API_BASE_URL}/cart`,
    addItem: `${API_BASE_URL}/cart/items`,
    updateItem: (id: string) => `${API_BASE_URL}/cart/items/${id}`,
    removeItem: (id: string) => `${API_BASE_URL}/cart/items/${id}`,
    merge: `${API_BASE_URL}/cart/merge`,
  },
  // Order endpoints
  orders: {
    create: `${API_BASE_URL}/orders`,
    list: `${API_BASE_URL}/orders`,
    detail: (id: string) => `${API_BASE_URL}/orders/${id}`,
    updateStatus: (id: string) => `${API_BASE_URL}/orders/${id}/status`,
  },
  // Admin endpoints
  admin: {
    dashboard: `${API_BASE_URL}/admin/dashboard`,
    orders: `${API_BASE_URL}/admin/orders`,
    users: `${API_BASE_URL}/admin/users`,
    updateUser: (id: string) => `${API_BASE_URL}/admin/users/${id}`,
  },
};

// Generic fetch wrapper with error handling
export async function fetchApi<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred');
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// API request methods
export const api = {
  get: <T>(url: string, options: RequestInit = {}) =>
    fetchApi<T>(url, { ...options, method: 'GET' }),
  
  post: <T>(url: string, data: unknown, options: RequestInit = {}) =>
    fetchApi<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: <T>(url: string, data: unknown, options: RequestInit = {}) =>
    fetchApi<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: <T>(url: string, options: RequestInit = {}) =>
    fetchApi<T>(url, { ...options, method: 'DELETE' }),
};
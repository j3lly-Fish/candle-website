// API configuration and utilities
import { env } from '@/utils/env';

// Base API URL with proper environment handling
export const API_BASE_URL = env.apiUrl;

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

// API Error types for better error handling
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

export class ApiException extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Helper function to wait for a specified time
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic fetch wrapper with enhanced error handling and retry logic
export async function fetchApi<T>(
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Try to parse error response
      let errorData: { message?: string; code?: string; details?: unknown };
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      const apiError: ApiError = {
        message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        code: errorData.code,
        details: errorData.details,
      };

      // Retry logic for specific status codes
      if (
        retryCount < RETRY_CONFIG.maxRetries &&
        RETRY_CONFIG.retryableStatuses.includes(response.status)
      ) {
        const delay = RETRY_CONFIG.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        await wait(delay);
        return fetchApi<T>(url, options, retryCount + 1);
      }

      throw new ApiException(apiError);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return {} as T; // Return empty object for non-JSON responses
    }
  } catch (error) {
    // Handle network errors and timeouts
    if (error instanceof ApiException) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiException({
          message: 'Request timeout',
          status: 408,
          code: 'TIMEOUT',
        });
      }

      // Retry network errors
      if (retryCount < RETRY_CONFIG.maxRetries) {
        const delay = RETRY_CONFIG.retryDelay * Math.pow(2, retryCount);
        await wait(delay);
        return fetchApi<T>(url, options, retryCount + 1);
      }

      throw new ApiException({
        message: error.message || 'Network error occurred',
        status: 0,
        code: 'NETWORK_ERROR',
        details: error,
      });
    }

    throw new ApiException({
      message: 'Unknown error occurred',
      status: 0,
      code: 'UNKNOWN_ERROR',
    });
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
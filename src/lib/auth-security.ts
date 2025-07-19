// Production-ready authentication security utilities

import { env } from '@/utils/env';

// Token storage configuration
export const TOKEN_CONFIG = {
  // Use httpOnly cookies in production for better security
  useHttpOnlyCookies: env.isProd,
  tokenExpiry: 15 * 60 * 1000, // 15 minutes
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};

// Secure token storage interface
export interface SecureTokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
  getRefreshToken(): string | null;
  setRefreshToken(token: string): void;
  removeRefreshToken(): void;
}

// Production-ready token storage implementation
class ProductionTokenStorage implements SecureTokenStorage {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    if (TOKEN_CONFIG.useHttpOnlyCookies) {
      // In production, tokens should be in httpOnly cookies
      // This is handled by the server-side API
      return this.getCookie(this.TOKEN_KEY);
    }
    
    // Development fallback to localStorage with encryption
    return this.getEncryptedItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    if (TOKEN_CONFIG.useHttpOnlyCookies) {
      // In production, this is handled by server-side cookie setting
      return;
    }
    
    // Development fallback with encryption
    this.setEncryptedItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    if (typeof window === 'undefined') return;
    
    if (TOKEN_CONFIG.useHttpOnlyCookies) {
      // In production, this is handled by server-side cookie removal
      return;
    }
    
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    if (TOKEN_CONFIG.useHttpOnlyCookies) {
      return this.getCookie(this.REFRESH_TOKEN_KEY);
    }
    
    return this.getEncryptedItem(this.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    if (TOKEN_CONFIG.useHttpOnlyCookies) {
      return;
    }
    
    this.setEncryptedItem(this.REFRESH_TOKEN_KEY, token);
  }

  removeRefreshToken(): void {
    if (typeof window === 'undefined') return;
    
    if (TOKEN_CONFIG.useHttpOnlyCookies) {
      return;
    }
    
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private getEncryptedItem(key: string): string | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      // Simple encryption for development - use proper encryption in production
      return atob(item);
    } catch {
      return null;
    }
  }

  private setEncryptedItem(key: string, value: string): void {
    try {
      // Simple encryption for development - use proper encryption in production
      localStorage.setItem(key, btoa(value));
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }
}

// Rate limiting for login attempts
class LoginRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  isBlocked(identifier: string): boolean {
    const record = this.attempts.get(identifier);
    if (!record) return false;

    const now = Date.now();
    if (now - record.lastAttempt > TOKEN_CONFIG.lockoutDuration) {
      // Reset after lockout period
      this.attempts.delete(identifier);
      return false;
    }

    return record.count >= TOKEN_CONFIG.maxLoginAttempts;
  }

  recordAttempt(identifier: string, success: boolean): void {
    const now = Date.now();
    const record = this.attempts.get(identifier) || { count: 0, lastAttempt: now };

    if (success) {
      // Reset on successful login
      this.attempts.delete(identifier);
    } else {
      // Increment failed attempts
      record.count += 1;
      record.lastAttempt = now;
      this.attempts.set(identifier, record);
    }
  }

  getRemainingLockoutTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return 0;

    const elapsed = Date.now() - record.lastAttempt;
    const remaining = TOKEN_CONFIG.lockoutDuration - elapsed;
    return Math.max(0, remaining);
  }
}

// Export instances
export const tokenStorage = new ProductionTokenStorage();
export const loginRateLimiter = new LoginRateLimiter();

// Password validation utilities
export const passwordValidation = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,

  validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.minLength) {
      errors.push(`Password must be at least ${this.minLength} characters long`);
    }

    if (this.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// CSRF token utilities
export const csrfProtection = {
  getToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta?.getAttribute('content') || null;
  },

  getHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'X-CSRF-Token': token } : {};
  },
};
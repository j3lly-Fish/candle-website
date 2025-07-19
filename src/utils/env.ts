// Environment configuration utilities

/**
 * Get environment variable with type safety and validation
 * @param key - Environment variable key
 * @param defaultValue - Default value if environment variable is not set
 * @param required - Whether the environment variable is required
 * @returns The environment variable value or default value
 */
export const getEnv = (key: string, defaultValue: string = '', required: boolean = false): string => {
  const value = process.env[key] || defaultValue;
  
  if (required && !value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  
  return value;
};

/**
 * Get required environment variable - throws error if not set
 */
export const getRequiredEnv = (key: string): string => {
  return getEnv(key, '', true);
};

/**
 * Check if the application is running in production
 */
export const isProd = process.env.NODE_ENV === 'production';

/**
 * Check if the application is running in development
 */
export const isDev = process.env.NODE_ENV === 'development';

/**
 * Check if the application is running in test
 */
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Environment variables used in the application
 * Production-ready configuration with proper validation
 */
export const env = {
  // API URL - allow localhost for development
  apiUrl: getEnv('NEXT_PUBLIC_API_URL', isDev ? 'http://localhost:3001/api' : ''),
  
  // Database configuration - required in production
  mongodbUri: isProd ? getRequiredEnv('MONGODB_URI') : getEnv('MONGODB_URI', 'mongodb://localhost:27017/candle-ecommerce'),
  
  // JWT secret - MUST be set in production
  jwtSecret: isProd ? getRequiredEnv('JWT_SECRET') : getEnv('JWT_SECRET', 'dev-secret-key-change-in-production'),
  
  // Stripe configuration - required for payments in production
  stripePublicKey: isProd 
    ? getRequiredEnv('NEXT_PUBLIC_STRIPE_PUBLIC_KEY') 
    : getEnv('NEXT_PUBLIC_STRIPE_PUBLIC_KEY', getEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_test_development_key')),
  stripeSecretKey: isProd 
    ? getRequiredEnv('STRIPE_SECRET_KEY') 
    : getEnv('STRIPE_SECRET_KEY', 'sk_test_development_key'),
  
  // Cloudinary configuration - required for image uploads in production
  cloudinaryCloudName: isProd 
    ? getRequiredEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME') 
    : getEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'dev-cloud-name'),
  cloudinaryApiKey: isProd 
    ? getRequiredEnv('CLOUDINARY_API_KEY') 
    : getEnv('CLOUDINARY_API_KEY', 'dev-api-key'),
  cloudinaryApiSecret: isProd 
    ? getRequiredEnv('CLOUDINARY_API_SECRET') 
    : getEnv('CLOUDINARY_API_SECRET', 'dev-api-secret'),
  
  // Additional production environment variables
  nextAuthSecret: isProd ? getRequiredEnv('NEXTAUTH_SECRET') : getEnv('NEXTAUTH_SECRET', 'dev-nextauth-secret'),
  nextAuthUrl: getEnv('NEXTAUTH_URL', isDev ? 'http://localhost:3000' : ''),
  
  // Email configuration (for order confirmations, etc.)
  emailFrom: getEnv('EMAIL_FROM', 'noreply@candleshop.com'),
  emailApiKey: isProd ? getRequiredEnv('EMAIL_API_KEY') : getEnv('EMAIL_API_KEY', ''),
  
  // Security headers
  corsOrigin: getEnv('CORS_ORIGIN', isDev ? 'http://localhost:3000' : ''),
};
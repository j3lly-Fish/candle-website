// Environment configuration utilities

/**
 * Get environment variable with type safety
 * @param key - Environment variable key
 * @param defaultValue - Default value if environment variable is not set
 * @returns The environment variable value or default value
 */
export const getEnv = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
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
 */
export const env = {
  // API URL
  apiUrl: getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001/api'),
  
  // MongoDB connection string
  mongodbUri: getEnv('MONGODB_URI', 'mongodb://localhost:27017/candle-ecommerce'),
  
  // JWT secret
  jwtSecret: getEnv('JWT_SECRET', 'your-secret-key'),
  
  // Stripe API key
  stripePublicKey: getEnv('NEXT_PUBLIC_STRIPE_PUBLIC_KEY', ''),
  stripeSecretKey: getEnv('STRIPE_SECRET_KEY', ''),
  
  // Cloudinary configuration
  cloudinaryCloudName: getEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', ''),
  cloudinaryApiKey: getEnv('CLOUDINARY_API_KEY', ''),
  cloudinaryApiSecret: getEnv('CLOUDINARY_API_SECRET', ''),
};
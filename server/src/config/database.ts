/**
 * Database configuration
 * 
 * This module provides configuration settings for the MongoDB database.
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration object
const dbConfig = {
  // MongoDB connection URI
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/candle-ecommerce',
  
  // Database name
  dbName: process.env.DB_NAME || 'candle-ecommerce',
  
  // Connection options
  options: {
    // Maximum number of connections in the pool
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10', 10),
    
    // How long to wait for a connection from the pool (milliseconds)
    connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '30000', 10),
    
    // How long to wait for a response from MongoDB (milliseconds)
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000', 10),
    
    // Whether to retry failed operations
    retryWrites: true,
    
    // Whether to retry reads if the primary is unavailable
    retryReads: true,
  },
  
  // Retry configuration for initial connection
  retry: {
    // Maximum number of connection attempts
    maxAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '5', 10),
    
    // Initial delay between attempts (milliseconds)
    initialDelayMs: parseInt(process.env.DB_RETRY_DELAY || '1000', 10),
    
    // Factor by which to increase delay on each attempt
    backoffFactor: parseFloat(process.env.DB_RETRY_BACKOFF || '2.0'),
  },
};

export default dbConfig;
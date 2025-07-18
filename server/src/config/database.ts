/**
 * Database configuration
 * 
 * This module provides configuration settings for the MongoDB database.
 */

import mongoose from 'mongoose';
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

/**
 * Connect to MongoDB database
 */
export async function connectDB(): Promise<typeof mongoose> {
  try {
    const connection = await mongoose.connect(dbConfig.uri, dbConfig.options);
    console.log('MongoDB connected successfully');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB database
 */
export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw error;
  }
}

/**
 * Get connection state as string
 */
export function getConnectionStateString(): string {
  const state = mongoose.connection.readyState;
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return stateMap[state as keyof typeof stateMap] || 'unknown';
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  collections: number;
  documents: number;
  indexes: number;
  dataSize: number;
  storageSize: number;
}> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const stats = await db.stats();
    const collections = await db.listCollections().toArray();
    
    let totalDocuments = 0;
    let totalIndexes = 0;
    
    for (const collection of collections) {
      const collectionStats = await db.collection(collection.name).stats();
      totalDocuments += collectionStats.count || 0;
      totalIndexes += collectionStats.nindexes || 0;
    }

    return {
      collections: collections.length,
      documents: totalDocuments,
      indexes: totalIndexes,
      dataSize: stats.dataSize || 0,
      storageSize: stats.storageSize || 0,
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      collections: 0,
      documents: 0,
      indexes: 0,
      dataSize: 0,
      storageSize: 0,
    };
  }
}

/**
 * Database event handlers
 */
export const dbEvents = {
  connected: () => console.log('MongoDB connected'),
  error: (err: Error) => console.error('MongoDB error:', err),
  disconnected: () => console.log('MongoDB disconnected'),
};
/**
 * Database connection utility
 * 
 * This module provides functions for connecting to MongoDB and handling connection events.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/candle-ecommerce';

// Connection options
const options: mongoose.ConnectOptions = {
  // No need to specify useNewUrlParser, useUnifiedTopology, etc. in newer mongoose versions
};

// Track connection status
let isConnected = false;

/**
 * Connect to MongoDB database
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (isConnected) {
    console.log('Using existing database connection');
    return mongoose;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, options);
    
    isConnected = true;
    console.log('New database connection established');
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      isConnected = false;
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to application termination');
      process.exit(0);
    });
    
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB database
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }
  
  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
    process.exit(1);
  }
}

/**
 * Get current database connection status
 */
export async function getConnectionStatus(): Promise<{
  isConnected: boolean;
  readyState: number;
  readyStateString: string;
  state: string;
  host?: string;
  port?: number;
  name?: string;
  latency?: number;
}> {
  const readyState = mongoose.connection.readyState;
  const readyStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const state = readyStateMap[readyState as keyof typeof readyStateMap] || 'unknown';

  return {
    isConnected: readyState === 1,
    readyState,
    readyStateString: state,
    state: state,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    latency: 0, // Could implement actual latency measurement if needed
  };
}

/**
 * Register database event handlers
 */
export function registerDbEventHandlers(): void {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
    isConnected = true;
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
    isConnected = false;
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
    isConnected = true;
  });
}
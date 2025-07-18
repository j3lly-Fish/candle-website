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
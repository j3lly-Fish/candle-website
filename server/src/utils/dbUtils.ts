/**
 * Database utility functions
 * 
 * This module provides helper functions for database operations.
 */

import mongoose from 'mongoose';

/**
 * Check if a MongoDB ObjectId is valid
 * @param id - The ID to validate
 * @returns Boolean indicating if the ID is valid
 */
export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Convert a string to MongoDB ObjectId
 * @param id - The ID string to convert
 * @returns MongoDB ObjectId
 */
export function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

/**
 * Create a pagination object for MongoDB queries
 * @param page - The page number (1-based)
 * @param limit - The number of items per page
 * @returns Pagination object with skip and limit properties
 */
export function createPagination(page: number = 1, limit: number = 10): { skip: number; limit: number } {
  const parsedPage = Math.max(1, parseInt(String(page), 10));
  const parsedLimit = Math.max(1, Math.min(100, parseInt(String(limit), 10)));
  
  return {
    skip: (parsedPage - 1) * parsedLimit,
    limit: parsedLimit,
  };
}

/**
 * Create a sort object for MongoDB queries
 * @param sortField - The field to sort by
 * @param sortOrder - The sort order ('asc' or 'desc')
 * @returns Sort object for MongoDB
 */
export function createSortObject(sortField: string = 'createdAt', sortOrder: string = 'desc'): Record<string, 1 | -1> {
  const order = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
  return { [sortField]: order };
}

/**
 * Handle database errors
 * @param error - The error object
 * @returns Standardized error object
 */
export function handleDatabaseError(error: any): { message: string; code: number } {
  console.error('Database error:', error);
  
  if (error.name === 'ValidationError') {
    return {
      message: 'Validation error: ' + Object.values(error.errors).map((err: any) => err.message).join(', '),
      code: 400,
    };
  }
  
  if (error.name === 'CastError') {
    return {
      message: 'Invalid ID format',
      code: 400,
    };
  }
  
  if (error.code === 11000) {
    return {
      message: 'Duplicate key error',
      code: 409,
    };
  }
  
  return {
    message: 'Database error occurred',
    code: 500,
  };
}

/**
 * Check if the database is connected
 * @returns Promise that resolves to a boolean indicating connection status
 */
export async function isDatabaseConnected(): Promise<boolean> {
  return mongoose.connection.readyState === 1;
}

/**
 * Create database indexes for all models
 * @returns Promise that resolves when all indexes are created
 */
export async function createIndexes(): Promise<void> {
  try {
    console.log('Creating database indexes...');
    
    // Get all registered models
    const models = mongoose.models;
    
    // Create indexes for each model
    for (const modelName in models) {
      const model = models[modelName];
      console.log(`Creating indexes for ${modelName}...`);
      await model.createIndexes();
    }
    
    console.log('Database indexes created successfully!');
  } catch (error) {
    console.error('Error creating database indexes:', error);
    throw error;
  }
}
/**
 * Test script for database connection
 * 
 * This script tests the database connection and performs basic operations
 * to verify that the database is properly configured.
 * 
 * Usage: ts-node testDbConnection.ts
 */

import mongoose from 'mongoose';
import { connectDB, disconnectDB, getDatabaseStats } from '../config/database';
import { getConnectionStatus } from '../utils/dbConnection';
import { createIndexes } from '../utils/dbUtils';

// Import models
import User from '../models/User';
import Product from '../models/Product';
import Cart from '../models/Cart';
import Order from '../models/Order';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Get connection status
    const status = await getConnectionStatus();
    console.log('Connection status:', status);
    
    // Get database stats
    const stats = await getDatabaseStats();
    console.log('Database stats:', {
      collections: stats.collections,
      documents: stats.objects,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
      indexes: stats.indexes,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
    });
    
    // Create indexes
    console.log('Creating indexes...');
    await createIndexes();
    console.log('✅ Indexes created successfully');
    
    // List all models
    console.log('Registered models:');
    Object.keys(mongoose.models).forEach(modelName => {
      console.log(`- ${modelName}`);
    });
    
    // Test model schemas
    console.log('\nTesting model schemas...');
    
    // User model
    console.log('User schema:', Object.keys(User.schema.paths).join(', '));
    
    // Product model
    console.log('Product schema:', Object.keys(Product.schema.paths).join(', '));
    
    // Cart model
    console.log('Cart schema:', Object.keys(Cart.schema.paths).join(', '));
    
    // Order model
    console.log('Order schema:', Object.keys(Order.schema.paths).join(', '));
    
    console.log('\n✅ All models loaded successfully');
    
    // Disconnect from database
    await disconnectDB();
    console.log('✅ Database disconnected successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Database connection test completed successfully');
      process.exit(0);
    } else {
      console.error('\n❌ Database connection test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  });
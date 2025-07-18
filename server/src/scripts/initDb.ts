/**
 * Database initialization script
 * 
 * This script initializes the MongoDB database with required collections and indexes.
 * It also creates an admin user if one doesn't exist.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectToDatabase } from '../utils/dbConnection';

// Load environment variables
dotenv.config();

// Define models
import '../models/User';
import '../models/Product';
import '../models/Order';
import '../models/Cart';
import '../models/Color';
import '../models/Scent';
import '../models/Size';

const User = mongoose.model('User');

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      console.log('Creating admin user...');
      
      // Generate hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminPassword123', salt);
      
      // Create admin user
      const adminUser = new User({
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      });
      
      await adminUser.save();
      console.log('Admin user created successfully!');
      console.log('Email: admin@example.com');
      console.log('Password: adminPassword123');
      console.log('IMPORTANT: Change this password immediately after first login!');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

async function createIndexes() {
  try {
    console.log('Creating database indexes...');
    
    // Product indexes
    await mongoose.model('Product').createIndexes();
    
    // Order indexes
    await mongoose.model('Order').createIndexes();
    
    // User indexes
    await mongoose.model('User').createIndexes();
    
    console.log('Database indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

async function initializeDatabase() {
  try {
    // Connect to database
    await connectToDatabase();
    console.log('Connected to MongoDB');
    
    // Create indexes
    await createIndexes();
    
    // Create admin user
    await createAdminUser();
    
    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
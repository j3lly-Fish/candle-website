import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import mongoose from 'mongoose';
import { connectDB, dbEvents, getConnectionStateString, getDatabaseStats } from './config/database';
import { createIndexes } from './utils/dbUtils';
import { getConnectionStatus, registerDbEventHandlers } from './utils/dbConnection';

// Import routes
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import checkoutRoutes from './routes/checkout.routes';
import adminRoutes from './routes/admin.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize server
const initializeServer = async () => {
  try {
    console.log('Starting server initialization...');
    
    // Connect to MongoDB with retry mechanism
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connection established');
    
    // Create indexes for all models
    console.log('Creating database indexes...');
    await createIndexes();
    
    // Register database event handlers
    registerDbEventHandlers();
    
    // Start server only after successful database connection
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
      console.log(`Database status available at http://localhost:${PORT}/api/system/db-status`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
    });
    
    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(async () => {
        console.log('HTTP server closed');
        try {
          await mongoose.connection.close();
          console.log('MongoDB connection closed');
          process.exit(0);
        } catch (err) {
          console.error('Error during shutdown:', err);
          process.exit(1);
        }
      });
      
      // Force shutdown after timeout
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };
    
    // Handle termination signals
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    
    return server;
  } catch (error) {
    console.error('Failed to initialize server:', error);
    throw error;
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await getConnectionStatus();
    
    // Get more detailed database stats if connected
    let dbStats = null;
    if (dbStatus.isConnected) {
      dbStats = await getDatabaseStats();
    }
    
    res.status(dbStatus.isConnected ? 200 : 503).json({
      status: dbStatus.isConnected ? 'ok' : 'degraded',
      server: {
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      },
      database: {
        status: dbStatus.state,
        connected: dbStatus.isConnected,
        host: dbStatus.host,
        latency: dbStatus.latency,
        stats: dbStats ? {
          collections: dbStats.collections,
          views: dbStats.views,
          objects: dbStats.objects,
          avgObjSize: dbStats.avgObjSize,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes,
          indexSize: dbStats.indexSize,
        } : null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      server: {
        status: 'running',
        uptime: process.uptime()
      },
      database: {
        status: getConnectionStateString(),
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Database status endpoint
app.get('/api/system/db-status', async (req, res) => {
  try {
    const dbStatus = await getConnectionStatus();
    
    let stats = null;
    if (dbStatus.isConnected) {
      stats = await getDatabaseStats();
    }
    
    res.json({
      status: dbStatus.state,
      connected: dbStatus.isConnected,
      host: dbStatus.host,
      latency: dbStatus.latency,
      stats: stats,
      models: Object.keys(mongoose.models),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize server
initializeServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
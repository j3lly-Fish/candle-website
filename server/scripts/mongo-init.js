// MongoDB initialization script for Docker
// This script runs when the MongoDB container starts for the first time

// Switch to the candle-ecommerce database
db = db.getSiblingDB('candle-ecommerce');

// Create an application user with read/write permissions
db.createUser({
  user: 'candle-app',
  pwd: 'candle-app-password',
  roles: [
    {
      role: 'readWrite',
      db: 'candle-ecommerce'
    }
  ]
});

// Create initial collections with indexes
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.createCollection('products');
db.products.createIndex({ name: 'text', description: 'text' });
db.products.createIndex({ category: 1 });
db.products.createIndex({ tags: 1 });
db.products.createIndex({ featured: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ rating: -1 });

db.createCollection('orders');
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ user: 1 });
db.orders.createIndex({ email: 1 });
db.orders.createIndex({ 'paymentDetails.transactionId': 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

db.createCollection('carts');
db.carts.createIndex({ user: 1 });
db.carts.createIndex({ sessionId: 1 });
db.carts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

db.createCollection('colors');
db.colors.createIndex({ name: 1 }, { unique: true });
db.colors.createIndex({ active: 1 });

db.createCollection('scents');
db.scents.createIndex({ name: 1 }, { unique: true });
db.scents.createIndex({ category: 1 });
db.scents.createIndex({ active: 1 });

db.createCollection('sizes');
db.sizes.createIndex({ name: 1 }, { unique: true });
db.sizes.createIndex({ active: 1 });

print('Database initialization completed successfully!');
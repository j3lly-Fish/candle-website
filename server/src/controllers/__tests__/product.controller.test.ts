import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { productController } from '../product.controller';
import Product from '../../models/Product';

// Create an express app for testing
const app = express();
app.use(express.json());
app.get('/api/products', productController.getAllProducts);
app.get('/api/products/:id', productController.getProductById);

describe('Product Controller', () => {
  beforeEach(async () => {
    // Clear products collection before each test
    await Product.deleteMany({});
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      // Create test products
      await Product.create([
        {
          name: 'Vanilla Candle',
          description: 'A sweet vanilla scented candle',
          basePrice: 15.99,
          images: ['vanilla1.jpg', 'vanilla2.jpg'],
          category: 'scented',
          featured: true,
          customizationOptions: {
            scents: [
              {
                name: 'Vanilla',
                description: 'Sweet vanilla scent',
                additionalPrice: 0,
                available: true
              }
            ],
            colors: [
              {
                name: 'White',
                hexCode: '#FFFFFF',
                additionalPrice: 0,
                available: true
              }
            ],
            sizes: [
              {
                name: 'Medium',
                dimensions: '3x3 inches',
                additionalPrice: 0,
                available: true
              }
            ]
          },
          inventory: {
            quantity: 50,
            lowStockThreshold: 10
          }
        },
        {
          name: 'Lavender Candle',
          description: 'A relaxing lavender scented candle',
          basePrice: 17.99,
          images: ['lavender1.jpg', 'lavender2.jpg'],
          category: 'scented',
          featured: false,
          customizationOptions: {
            scents: [
              {
                name: 'Lavender',
                description: 'Relaxing lavender scent',
                additionalPrice: 0,
                available: true
              }
            ],
            colors: [
              {
                name: 'Purple',
                hexCode: '#A020F0',
                additionalPrice: 0,
                available: true
              }
            ],
            sizes: [
              {
                name: 'Large',
                dimensions: '4x4 inches',
                additionalPrice: 2,
                available: true
              }
            ]
          },
          inventory: {
            quantity: 30,
            lowStockThreshold: 5
          }
        }
      ]);

      // Make request to get all products
      const response = await request(app).get('/api/products');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].name).toBe('Vanilla Candle');
      expect(response.body.data[1].name).toBe('Lavender Candle');
    });

    it('should filter products by category', async () => {
      // Create test products with different categories
      await Product.create([
        {
          name: 'Vanilla Candle',
          description: 'A sweet vanilla scented candle',
          basePrice: 15.99,
          images: ['vanilla1.jpg'],
          category: 'scented',
          featured: true,
          customizationOptions: {
            scents: [],
            colors: [],
            sizes: []
          },
          inventory: {
            quantity: 50,
            lowStockThreshold: 10
          }
        },
        {
          name: 'Plain Candle',
          description: 'A plain unscented candle',
          basePrice: 12.99,
          images: ['plain1.jpg'],
          category: 'unscented',
          featured: false,
          customizationOptions: {
            scents: [],
            colors: [],
            sizes: []
          },
          inventory: {
            quantity: 40,
            lowStockThreshold: 8
          }
        }
      ]);

      // Make request with category filter
      const response = await request(app).get('/api/products?category=unscented');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Plain Candle');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by ID', async () => {
      // Create a test product
      const product = await Product.create({
        name: 'Vanilla Candle',
        description: 'A sweet vanilla scented candle',
        basePrice: 15.99,
        images: ['vanilla1.jpg'],
        category: 'scented',
        featured: true,
        customizationOptions: {
          scents: [],
          colors: [],
          sizes: []
        },
        inventory: {
          quantity: 50,
          lowStockThreshold: 10
        }
      });

      // Make request to get product by ID
      const response = await request(app).get(`/api/products/${product._id}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Vanilla Candle');
      expect(response.body.data._id).toBe(product._id.toString());
    });

    it('should return 404 for non-existent product ID', async () => {
      // Generate a random MongoDB ID that doesn't exist
      const nonExistentId = new mongoose.Types.ObjectId();

      // Make request with non-existent ID
      const response = await request(app).get(`/api/products/${nonExistentId}`);

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
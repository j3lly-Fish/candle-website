/**
 * Test setup file
 * 
 * This file contains setup code for Jest tests.
 */

// Set environment variables for testing
(process.env as any).NODE_ENV = 'test';
(process.env as any).JWT_SECRET = 'test-jwt-secret';
(process.env as any).MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/candle-ecommerce-test';

// Mock modules as needed (commented out for build compatibility)
// jest.mock('../utils/emailService', () => ({
//   sendEmail: jest.fn().mockResolvedValue({}),
//   sendErrorNotification: jest.fn().mockResolvedValue({}),
//   sendOrderConfirmation: jest.fn().mockResolvedValue({}),
//   default: {
//     sendEmail: jest.fn().mockResolvedValue({}),
//     sendErrorNotification: jest.fn().mockResolvedValue({}),
//     sendOrderConfirmation: jest.fn().mockResolvedValue({}),
//   },
// }));

// Global setup before all tests (commented out for build compatibility)
// beforeAll(async () => {
//   // Add any global setup code here
// });

// Global teardown after all tests (commented out for build compatibility)
// afterAll(async () => {
//   // Add any global teardown code here
// });

// Reset mocks before each test (commented out for build compatibility)
// beforeEach(() => {
//   jest.clearAllMocks();
// });
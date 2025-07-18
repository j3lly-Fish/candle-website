import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import adminController from '../controllers/admin.controller';

const router = Router();

// Apply protection middleware to all admin routes
router.use(protect);
router.use(requireAdmin);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard metrics
 * @access  Admin
 */
router.get('/dashboard', adminController.getDashboardMetrics);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filtering
 * @access  Admin
 */
router.get('/users', adminController.getUsers);

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get user details
 * @access  Admin
 */
router.get('/users/:userId', adminController.getUserById);

/**
 * @route   PUT /api/admin/users/:userId
 * @desc    Update user details (admin only)
 * @access  Admin
 */
router.put('/users/:userId', adminController.updateUser);

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with filtering
 * @access  Admin
 */
router.get('/orders', adminController.getOrders);

/**
 * @route   GET /api/admin/orders/:orderId
 * @desc    Get order details
 * @access  Admin
 */
router.get('/orders/:orderId', adminController.getOrderById);

/**
 * @route   PUT /api/admin/orders/:orderId/status
 * @desc    Update order status
 * @access  Admin
 */
router.put('/orders/:orderId/status', adminController.updateOrderStatus);

/**
 * @route   GET /api/admin/products
 * @desc    Get all products with filtering
 * @access  Admin
 */
router.get('/products', adminController.getProducts);

/**
 * @route   POST /api/admin/products
 * @desc    Create a new product
 * @access  Admin
 */
router.post('/products', adminController.createProduct);

/**
 * @route   GET /api/admin/products/:productId
 * @desc    Get product details
 * @access  Admin
 */
router.get('/products/:productId', adminController.getProductById);

/**
 * @route   PUT /api/admin/products/:productId
 * @desc    Update product details
 * @access  Admin
 */
router.put('/products/:productId', adminController.updateProduct);

/**
 * @route   DELETE /api/admin/products/:productId
 * @desc    Delete a product
 * @access  Admin
 */
router.delete('/products/:productId', adminController.deleteProduct);

export default router;
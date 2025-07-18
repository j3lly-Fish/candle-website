import { Router } from 'express';
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus,
  getOrderByOrderNumber,
  updateOrderTracking
} from '../controllers/order.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Public/Private
 */
router.post('/', createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get user orders
 * @access  Private
 */
router.get('/', authMiddleware, getUserOrders);

/**
 * @route   GET /api/orders/track/:orderNumber
 * @desc    Track order by order number and email (for guest users)
 * @access  Public
 */
router.get('/track/:orderNumber', getOrderByOrderNumber);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, getOrderById);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private/Admin
 */
router.put('/:id/status', authMiddleware, updateOrderStatus);

/**
 * @route   PUT /api/orders/:id/tracking
 * @desc    Update order tracking information
 * @access  Private/Admin
 */
router.put('/:id/tracking', authMiddleware, updateOrderTracking);

export default router;
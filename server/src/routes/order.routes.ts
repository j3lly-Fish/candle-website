import { Router } from 'express';
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus,
  getOrderByOrderNumber,
  updateOrderTracking
} from '../controllers/order.controller';
import { protect } from '../middleware/authMiddleware';

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
router.get('/', protect, getUserOrders);

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
router.get('/:id', protect, getOrderById);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private/Admin
 */
router.put('/:id/status', protect, updateOrderStatus);

/**
 * @route   PUT /api/orders/:id/tracking
 * @desc    Update order tracking information
 * @access  Private/Admin
 */
router.put('/:id/tracking', protect, updateOrderTracking);

export default router;
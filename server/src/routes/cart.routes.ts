import { Router } from 'express';
import cartController from '../controllers/cart.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   GET /api/cart
 * @desc    Get current cart
 * @access  Public/Private
 */
router.get('/', cartController.getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Public/Private
 */
router.post('/items', cartController.addItemToCart);

/**
 * @route   PUT /api/cart/items/:id
 * @desc    Update cart item
 * @access  Public/Private
 */
router.put('/items/:id', cartController.updateCartItem);

/**
 * @route   DELETE /api/cart/items/:id
 * @desc    Remove cart item
 * @access  Public/Private
 */
router.delete('/items/:id', cartController.removeCartItem);

/**
 * @route   POST /api/cart/merge
 * @desc    Merge guest cart with user cart
 * @access  Private
 */
router.post('/merge', protect, cartController.mergeCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Public/Private
 */
router.delete('/', cartController.clearCart);

export default router;
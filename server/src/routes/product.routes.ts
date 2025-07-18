import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getCustomizationOptions,
  searchProducts
} from '../controllers/product.controller';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   GET /api/products/search
 * @desc    Search products with text search
 * @access  Public
 */
router.get('/search', searchProducts);

/**
 * @route   GET /api/products/options
 * @desc    Get all customization options
 * @access  Public
 */
router.get('/options', getCustomizationOptions);

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, sorting, and pagination
 * @access  Public
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private/Admin
 */
router.post('/', protect, restrictTo('admin'), createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private/Admin
 */
router.put('/:id', protect, restrictTo('admin'), updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private/Admin
 */
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

export default router;
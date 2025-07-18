import { Router } from 'express';
import {
  validateCheckout,
  calculateShipping,
  processCheckout
} from '../controllers/checkout.controller';

const router = Router();

/**
 * @route   POST /api/checkout/validate
 * @desc    Validate checkout data
 * @access  Public
 */
router.post('/validate', validateCheckout);

/**
 * @route   POST /api/checkout/shipping
 * @desc    Calculate shipping costs
 * @access  Public
 */
router.post('/shipping', calculateShipping);

/**
 * @route   POST /api/checkout/process
 * @desc    Process checkout and create order
 * @access  Public
 */
router.post('/process', processCheckout);

export default router;
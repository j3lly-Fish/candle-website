import express from 'express';
import {
  validateCustomization,
  getProductCustomizationOptions,
  getProductPreview
} from '../controllers/customization.controller';

const router = express.Router();

// Validate customization combination
router.post('/products/:id/validate-customization', validateCustomization);

// Get available customization options for a product
router.get('/products/:id/customization-options', getProductCustomizationOptions);

// Get product preview with customization
router.post('/products/:id/preview', getProductPreview);

export default router;
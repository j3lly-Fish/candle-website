import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Scent from '../models/Scent';
import Color from '../models/Color';
import Size from '../models/Size';
import { NotFoundError, ValidationError } from '../utils/errors';
import { CustomizationValidator } from '../utils/customizationValidator';

/**
 * Validate customization combination for a product
 * @route POST /api/products/:id/validate-customization
 * @access Public
 */
export const validateCustomization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { scentId, colorId, sizeId } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid product ID format');
    }

    // Find product
    const product = await Product.findById(id)
      .populate('customizationOptions.scents')
      .populate('customizationOptions.colors')
      .populate('customizationOptions.sizes');

    // Check if product exists
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Validate customization combination
    const validationResult = await CustomizationValidator.validateProductCustomizationCombination(
      id,
      { scentId, colorId, sizeId }
    );

    // Calculate price if valid
    let price = product.basePrice;
    
    if (validationResult.isValid) {
      const priceResult = await CustomizationValidator.calculateCustomizedPrice(
        id,
        { scentId, colorId, sizeId }
      );
      
      price = priceResult.price;
    }

    // Return validation result and price
    res.status(200).json({
      success: true,
      isValid: validationResult.isValid,
      message: validationResult.message || 'Customization is valid',
      price
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available customization options for a product
 * @route GET /api/products/:id/customization-options
 * @access Public
 */
export const getProductCustomizationOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid product ID format');
    }

    // Find product
    const product = await Product.findById(id);

    // Check if product exists
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Get scents
    const scents = await Scent.find({
      _id: { $in: product.customizationOptions.scents },
      available: true,
      inStock: true
    });

    // Get colors
    const colors = await Color.find({
      _id: { $in: product.customizationOptions.colors },
      available: true,
      inStock: true
    });

    // Get sizes
    const sizes = await Size.find({
      _id: { $in: product.customizationOptions.sizes },
      available: true,
      inStock: true
    });

    // Return options
    res.status(200).json({
      success: true,
      data: {
        scents,
        colors,
        sizes
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product preview with customization
 * @route POST /api/products/:id/preview
 * @access Public
 */
export const getProductPreview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { scentId, colorId, sizeId } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid product ID format');
    }

    // Find product
    const product = await Product.findById(id);

    // Check if product exists
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // In a real app, this would generate a preview image based on the customization
    // For now, we'll just return a mock preview URL
    const previewUrl = `/api/previews/${id}?scent=${scentId || ''}&color=${colorId || ''}&size=${sizeId || ''}`;

    // Return preview URL
    res.status(200).json({
      success: true,
      data: {
        previewUrl
      }
    });
  } catch (error) {
    next(error);
  }
};
import mongoose from 'mongoose';
import Scent from '../models/Scent';
import Color from '../models/Color';
import Size from '../models/Size';
import Product from '../models/Product';

/**
 * Interface for customization combination
 */
export interface CustomizationCombination {
  scentId?: string;
  colorId?: string;
  sizeId?: string;
}

/**
 * Class for validating customization options and combinations
 */
export class CustomizationValidator {
  /**
   * Validates if all customization options exist and are available
   * @param combination - The customization combination to validate
   * @returns Promise resolving to validation result and error message if any
   */
  static async validateCustomizationOptions(
    combination: CustomizationCombination
  ): Promise<{ isValid: boolean; message?: string }> {
    try {
      // Check if IDs are valid MongoDB ObjectIds
      if (combination.scentId && !mongoose.Types.ObjectId.isValid(combination.scentId)) {
        return { isValid: false, message: 'Invalid scent ID format' };
      }
      
      if (combination.colorId && !mongoose.Types.ObjectId.isValid(combination.colorId)) {
        return { isValid: false, message: 'Invalid color ID format' };
      }
      
      if (combination.sizeId && !mongoose.Types.ObjectId.isValid(combination.sizeId)) {
        return { isValid: false, message: 'Invalid size ID format' };
      }

      // Check if options exist and are available
      if (combination.scentId) {
        const scent = await Scent.findById(combination.scentId);
        if (!scent) {
          return { isValid: false, message: 'Scent not found' };
        }
        if (!scent.available || !scent.inStock) {
          return { isValid: false, message: 'Selected scent is not available or out of stock' };
        }
      }

      if (combination.colorId) {
        const color = await Color.findById(combination.colorId);
        if (!color) {
          return { isValid: false, message: 'Color not found' };
        }
        if (!color.available || !color.inStock) {
          return { isValid: false, message: 'Selected color is not available or out of stock' };
        }
      }

      if (combination.sizeId) {
        const size = await Size.findById(combination.sizeId);
        if (!size) {
          return { isValid: false, message: 'Size not found' };
        }
        if (!size.available || !size.inStock) {
          return { isValid: false, message: 'Selected size is not available or out of stock' };
        }
      }

      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        message: `Error validating customization options: ${(error as Error).message}` 
      };
    }
  }

  /**
   * Validates if a customization combination is valid for a specific product
   * @param productId - The product ID
   * @param combination - The customization combination to validate
   * @returns Promise resolving to validation result and error message if any
   */
  static async validateProductCustomizationCombination(
    productId: string,
    combination: CustomizationCombination
  ): Promise<{ isValid: boolean; message?: string }> {
    try {
      // First validate the individual options
      const optionsValidation = await this.validateCustomizationOptions(combination);
      if (!optionsValidation.isValid) {
        return optionsValidation;
      }

      // Check if product exists
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return { isValid: false, message: 'Invalid product ID format' };
      }

      const product = await Product.findById(productId);
      if (!product) {
        return { isValid: false, message: 'Product not found' };
      }

      // Check if the options are available for this specific product
      if (combination.scentId) {
        const productHasScent = product.customizationOptions.scents.some(
          scent => scent._id.toString() === combination.scentId
        );
        if (!productHasScent) {
          return { isValid: false, message: 'Selected scent is not available for this product' };
        }
      }

      if (combination.colorId) {
        const productHasColor = product.customizationOptions.colors.some(
          color => color._id.toString() === combination.colorId
        );
        if (!productHasColor) {
          return { isValid: false, message: 'Selected color is not available for this product' };
        }
      }

      if (combination.sizeId) {
        const productHasSize = product.customizationOptions.sizes.some(
          size => size._id.toString() === combination.sizeId
        );
        if (!productHasSize) {
          return { isValid: false, message: 'Selected size is not available for this product' };
        }
      }

      // Check for specific combination restrictions
      // This is where you would implement any business rules about invalid combinations
      // For example, certain scents might not be available in certain colors
      
      // For now, we'll just return valid since we've checked each option individually
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        message: `Error validating product customization combination: ${(error as Error).message}` 
      };
    }
  }

  /**
   * Calculates the final price for a product with selected customizations
   * @param productId - The product ID
   * @param combination - The customization combination
   * @returns Promise resolving to the calculated price or error
   */
  static async calculateCustomizedPrice(
    productId: string,
    combination: CustomizationCombination
  ): Promise<{ price: number; error?: string }> {
    try {
      // Check if product exists
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return { price: 0, error: 'Invalid product ID format' };
      }

      const product = await Product.findById(productId);
      if (!product) {
        return { price: 0, error: 'Product not found' };
      }

      let finalPrice = product.basePrice;

      // Add additional price for scent
      if (combination.scentId) {
        const scent = await Scent.findById(combination.scentId);
        if (scent) {
          finalPrice += scent.additionalPrice;
        }
      }

      // Add additional price for color
      if (combination.colorId) {
        const color = await Color.findById(combination.colorId);
        if (color) {
          finalPrice += color.additionalPrice;
        }
      }

      // Add additional price for size
      if (combination.sizeId) {
        const size = await Size.findById(combination.sizeId);
        if (size) {
          finalPrice += size.additionalPrice;
        }
      }

      return { price: finalPrice };
    } catch (error) {
      return { 
        price: 0, 
        error: `Error calculating customized price: ${(error as Error).message}` 
      };
    }
  }
}

export default CustomizationValidator;
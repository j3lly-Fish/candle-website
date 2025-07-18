import { CustomizationOption, ScentOption, ColorOption, SizeOption } from '@/types';

/**
 * Interface for customization combination
 */
export interface CustomizationCombination {
  scentId?: string | null;
  colorId?: string | null;
  sizeId?: string | null;
}

/**
 * Interface for validation result
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  price: number;
}

/**
 * Interface for customization options
 */
export interface CustomizationOptions {
  scents: ScentOption[];
  colors: ColorOption[];
  sizes: SizeOption[];
}

/**
 * API client for customization-related operations
 */
export const CustomizationApi = {
  /**
   * Validate a customization combination for a product
   * @param productId - The product ID
   * @param combination - The customization combination to validate
   * @returns Promise resolving to validation result
   */
  async validateCustomization(
    productId: string,
    combination: CustomizationCombination
  ): Promise<ValidationResult> {
    try {
      const response = await fetch(`/api/products/${productId}/validate-customization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(combination),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          isValid: false,
          message: errorData.message || 'Error validating customization',
          price: 0
        };
      }

      const data = await response.json();
      return {
        isValid: data.isValid,
        message: data.message,
        price: data.price
      };
    } catch (error) {
      console.error('Error validating customization:', error);
      return {
        isValid: false,
        message: 'Error connecting to server',
        price: 0
      };
    }
  },

  /**
   * Get available customization options for a product
   * @param productId - The product ID
   * @returns Promise resolving to customization options
   */
  async getProductCustomizationOptions(productId: string): Promise<CustomizationOptions> {
    try {
      const response = await fetch(`/api/products/${productId}/customization-options`);

      if (!response.ok) {
        throw new Error('Error fetching customization options');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching customization options:', error);
      return {
        scents: [],
        colors: [],
        sizes: []
      };
    }
  },

  /**
   * Get product preview with customization
   * @param productId - The product ID
   * @param combination - The customization combination
   * @returns Promise resolving to preview URL
   */
  async getProductPreview(
    productId: string,
    combination: CustomizationCombination
  ): Promise<string> {
    try {
      const response = await fetch(`/api/products/${productId}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(combination),
      });

      if (!response.ok) {
        throw new Error('Error generating preview');
      }

      const data = await response.json();
      return data.data.previewUrl;
    } catch (error) {
      console.error('Error generating preview:', error);
      return '';
    }
  }
};
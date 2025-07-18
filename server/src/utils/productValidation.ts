import { IProduct } from '../models/Product';

/**
 * Validates that a product has all required customization options
 * @param product The product to validate
 * @returns An object containing validation result and error message if any
 */
export const validateProductCustomizations = (product: IProduct): { isValid: boolean; message?: string } => {
  // Check if product has at least one of each customization option
  if (!product.customizationOptions.scents || product.customizationOptions.scents.length === 0) {
    return { isValid: false, message: 'Product must have at least one scent option' };
  }

  if (!product.customizationOptions.colors || product.customizationOptions.colors.length === 0) {
    return { isValid: false, message: 'Product must have at least one color option' };
  }

  if (!product.customizationOptions.sizes || product.customizationOptions.sizes.length === 0) {
    return { isValid: false, message: 'Product must have at least one size option' };
  }

  // Check if at least one option in each category is available
  // Note: This assumes customization options are populated with full objects
  const hasAvailableScent = product.customizationOptions.scents.some((scent: any) => scent.available && scent.inStock);
  const hasAvailableColor = product.customizationOptions.colors.some((color: any) => color.available && color.inStock);
  const hasAvailableSize = product.customizationOptions.sizes.some((size: any) => size.available && size.inStock);

  if (!hasAvailableScent) {
    return { isValid: false, message: 'Product must have at least one available scent option' };
  }

  if (!hasAvailableColor) {
    return { isValid: false, message: 'Product must have at least one available color option' };
  }

  if (!hasAvailableSize) {
    return { isValid: false, message: 'Product must have at least one available size option' };
  }

  return { isValid: true };
};

/**
 * Validates that a customization combination is valid for a product
 * @param product The product to validate against
 * @param scentId The selected scent ID
 * @param colorId The selected color ID
 * @param sizeId The selected size ID
 * @returns An object containing validation result and error message if any
 */
export const validateCustomizationCombination = (
  product: IProduct,
  scentId: string,
  colorId: string,
  sizeId: string
): { isValid: boolean; message?: string } => {
  // Find the selected options (using find instead of id method)
  const scent = product.customizationOptions.scents.find((s: any) => s._id?.toString() === scentId);
  const color = product.customizationOptions.colors.find((c: any) => c._id?.toString() === colorId);
  const size = product.customizationOptions.sizes.find((s: any) => s._id?.toString() === sizeId);

  // Check if all options exist
  if (!scent) {
    return { isValid: false, message: 'Selected scent option does not exist' };
  }

  if (!color) {
    return { isValid: false, message: 'Selected color option does not exist' };
  }

  if (!size) {
    return { isValid: false, message: 'Selected size option does not exist' };
  }

  // Check if all options are available (with type assertions)
  if (!(scent as any)?.available) {
    return { isValid: false, message: `The scent "${(scent as any)?.name}" is not available` };
  }

  if (!(color as any)?.available) {
    return { isValid: false, message: `The color "${(color as any)?.name}" is not available` };
  }

  if (!(size as any)?.available) {
    return { isValid: false, message: `The size "${(size as any)?.name}" is not available` };
  }

  // Check if all options are in stock (with type assertions)
  if (!(scent as any)?.inStock) {
    return { isValid: false, message: `The scent "${(scent as any)?.name}" is out of stock` };
  }

  if (!(color as any)?.inStock) {
    return { isValid: false, message: `The color "${(color as any)?.name}" is out of stock` };
  }

  if (!(size as any)?.inStock) {
    return { isValid: false, message: `The size "${(size as any)?.name}" is out of stock` };
  }

  // All checks passed
  return { isValid: true };
};

/**
 * Validates product inventory status
 * @param product The product to validate
 * @returns An object containing validation result and error message if any
 */
export const validateProductInventory = (product: IProduct): { isValid: boolean; message?: string } => {
  if (product.inventory < 0) {
    return { isValid: false, message: 'Product inventory quantity cannot be negative' };
  }

  // Note: lowStockThreshold is not available in the current inventory model
  // if (product.inventory.lowStockThreshold < 0) {
  //   return { isValid: false, message: 'Product low stock threshold cannot be negative' };
  // }

  return { isValid: true };
};

/**
 * Validates product pricing
 * @param product The product to validate
 * @returns An object containing validation result and error message if any
 */
export const validateProductPricing = (product: IProduct): { isValid: boolean; message?: string } => {
  if (product.basePrice < 0) {
    return { isValid: false, message: 'Product base price cannot be negative' };
  }

  // Check for negative additional prices in customization options (with type assertions)
  for (const scent of product.customizationOptions.scents) {
    if ((scent as any)?.additionalPrice < 0) {
      return { isValid: false, message: `Scent "${(scent as any)?.name}" has a negative additional price` };
    }
  }

  for (const color of product.customizationOptions.colors) {
    if ((color as any)?.additionalPrice < 0) {
      return { isValid: false, message: `Color "${(color as any)?.name}" has a negative additional price` };
    }
  }

  for (const size of product.customizationOptions.sizes) {
    if ((size as any)?.additionalPrice < 0) {
      return { isValid: false, message: `Size "${(size as any)?.name}" has a negative additional price` };
    }
  }

  return { isValid: true };
};

/**
 * Comprehensive product validation
 * @param product The product to validate
 * @returns An object containing validation result and all error messages if any
 */
export const validateProduct = (product: IProduct): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate customizations
  const customizationsValidation = validateProductCustomizations(product);
  if (!customizationsValidation.isValid && customizationsValidation.message) {
    errors.push(customizationsValidation.message);
  }

  // Validate inventory
  const inventoryValidation = validateProductInventory(product);
  if (!inventoryValidation.isValid && inventoryValidation.message) {
    errors.push(inventoryValidation.message);
  }

  // Validate pricing
  const pricingValidation = validateProductPricing(product);
  if (!pricingValidation.isValid && pricingValidation.message) {
    errors.push(pricingValidation.message);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
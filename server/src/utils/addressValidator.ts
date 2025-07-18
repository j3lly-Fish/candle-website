import { z } from 'zod';

// Address validation schema
export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code format (must be 12345 or 12345-6789)'),
  country: z.string().min(1, 'Country is required'),
});

// Type for address data
export type AddressData = z.infer<typeof addressSchema>;

/**
 * Validates address data
 * @param address The address data to validate
 * @returns Object with validation result and any errors
 */
export const validateAddress = (address: any): { 
  valid: boolean; 
  errors?: Record<string, string>;
} => {
  try {
    addressSchema.parse(address);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0]] = err.message;
        }
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { general: 'Invalid address data' } };
  }
};

/**
 * Validates that billing and shipping addresses are valid
 * @param shippingAddress The shipping address
 * @param billingAddress The billing address
 * @returns Object with validation result and any errors
 */
export const validateOrderAddresses = (
  shippingAddress: any,
  billingAddress: any
): {
  valid: boolean;
  errors?: {
    shipping?: Record<string, string>;
    billing?: Record<string, string>;
  };
} => {
  const shippingValidation = validateAddress(shippingAddress);
  const billingValidation = validateAddress(billingAddress);
  
  if (shippingValidation.valid && billingValidation.valid) {
    return { valid: true };
  }
  
  const errors: {
    shipping?: Record<string, string>;
    billing?: Record<string, string>;
  } = {};
  
  if (!shippingValidation.valid) {
    errors.shipping = shippingValidation.errors;
  }
  
  if (!billingValidation.valid) {
    errors.billing = billingValidation.errors;
  }
  
  return { valid: false, errors };
};
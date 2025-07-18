import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TransitionElement } from '../animation';

// Address validation schema
const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string()
    .min(1, 'Zip code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code format (must be 12345 or 12345-6789)'),
  country: z.string().min(1, 'Country is required'),
});

export type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  title: string;
  onSubmit: (data: AddressFormData) => void;
  initialData?: Partial<AddressFormData>;
  submitLabel?: string;
  showSameAsShipping?: boolean;
  onSameAsShippingChange?: (checked: boolean) => void;
  isSameAsShipping?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  title,
  onSubmit,
  initialData = {},
  submitLabel = 'Continue',
  showSameAsShipping = false,
  onSameAsShippingChange,
  isSameAsShipping = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData,
  });

  const [formEnabled, setFormEnabled] = useState(!isSameAsShipping);

  const handleSameAsShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFormEnabled(!checked);
    if (onSameAsShippingChange) {
      onSameAsShippingChange(checked);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        
        {showSameAsShipping && (
          <div className="flex items-center">
            <input
              id="same-as-shipping"
              type="checkbox"
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              checked={isSameAsShipping}
              onChange={handleSameAsShippingChange}
            />
            <label htmlFor="same-as-shipping" className="ml-2 text-sm text-gray-700">
              Same as shipping address
            </label>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <fieldset disabled={!formEnabled || isSubmitting} className={!formEnabled ? 'opacity-50' : ''}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                {...register('firstName')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm
                  ${errors.firstName ? 'border-red-300' : ''}`}
              />
              {errors.firstName && (
                <TransitionElement>
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                </TransitionElement>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                {...register('lastName')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm
                  ${errors.lastName ? 'border-red-300' : ''}`}
              />
              {errors.lastName && (
                <TransitionElement>
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                </TransitionElement>
              )}
            </div>

            {/* Street Address */}
            <div className="md:col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                type="text"
                id="street"
                {...register('street')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm
                  ${errors.street ? 'border-red-300' : ''}`}
              />
              {errors.street && (
                <TransitionElement>
                  <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
                </TransitionElement>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                {...register('city')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm
                  ${errors.city ? 'border-red-300' : ''}`}
              />
              {errors.city && (
                <TransitionElement>
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                </TransitionElement>
              )}
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State / Province
              </label>
              <input
                type="text"
                id="state"
                {...register('state')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm
                  ${errors.state ? 'border-red-300' : ''}`}
              />
              {errors.state && (
                <TransitionElement>
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                </TransitionElement>
              )}
            </div>

            {/* Zip Code */}
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                id="zipCode"
                {...register('zipCode')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm
                  ${errors.zipCode ? 'border-red-300' : ''}`}
              />
              {errors.zipCode && (
                <TransitionElement>
                  <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                </TransitionElement>
              )}
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                id="country"
                {...register('country')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm
                  ${errors.country ? 'border-red-300' : ''}`}
              >
                <option value="">Select a country</option>
                <option value="USA">United States</option>
                <option value="Canada">Canada</option>
                <option value="Mexico">Mexico</option>
                {/* Add more countries as needed */}
              </select>
              {errors.country && (
                <TransitionElement>
                  <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                </TransitionElement>
              )}
            </div>
          </div>
        </fieldset>

        {!showSameAsShipping && (
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddressForm;
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TransitionElement } from '../animation';

// Payment form validation schema
const paymentSchema = z.object({
  cardholderName: z.string().min(1, 'Cardholder name is required'),
  cardNumber: z.string()
    .min(1, 'Card number is required')
    .regex(/^[0-9]{16}$/, 'Card number must be 16 digits'),
  expiryMonth: z.string().min(1, 'Expiry month is required'),
  expiryYear: z.string().min(1, 'Expiry year is required'),
  cvv: z.string()
    .min(1, 'CVV is required')
    .regex(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits'),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  initialData?: Partial<PaymentFormData>;
  submitLabel?: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  initialData = {},
  submitLabel = 'Continue to Review',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData,
  });

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal'>('credit_card');

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      value: month.toString().padStart(2, '0'),
      label: month.toString().padStart(2, '0'),
    };
  });

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear + i;
    return {
      value: year.toString(),
      label: year.toString(),
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>

      <div className="space-y-4">
        {/* Payment Method Selection */}
        <div className="flex space-x-4">
          <div
            className={`
              flex-1 p-4 border rounded-md cursor-pointer transition-all
              ${paymentMethod === 'credit_card' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
            `}
            onClick={() => setPaymentMethod('credit_card')}
          >
            <div className="flex items-center">
              <input
                id="payment-credit-card"
                name="payment-method"
                type="radio"
                checked={paymentMethod === 'credit_card'}
                onChange={() => setPaymentMethod('credit_card')}
                className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
              />
              <label htmlFor="payment-credit-card" className="ml-3 block text-sm font-medium text-gray-700">
                Credit Card
              </label>
            </div>
          </div>

          <div
            className={`
              flex-1 p-4 border rounded-md cursor-pointer transition-all
              ${paymentMethod === 'paypal' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
            `}
            onClick={() => setPaymentMethod('paypal')}
          >
            <div className="flex items-center">
              <input
                id="payment-paypal"
                name="payment-method"
                type="radio"
                checked={paymentMethod === 'paypal'}
                onChange={() => setPaymentMethod('paypal')}
                className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
              />
              <label htmlFor="payment-paypal" className="ml-3 block text-sm font-medium text-gray-700">
                PayPal
              </label>
            </div>
          </div>
        </div>

        {/* Credit Card Form */}
        {paymentMethod === 'credit_card' && (
          <TransitionElement>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
              {/* Cardholder Name */}
              <div>
                <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="cardholderName"
                  {...register('cardholderName')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm
                    ${errors.cardholderName ? 'border-red-300' : ''}`}
                />
                {errors.cardholderName && (
                  <TransitionElement>
                    <p className="mt-1 text-sm text-red-600">{errors.cardholderName.message}</p>
                  </TransitionElement>
                )}
              </div>

              {/* Card Number */}
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  {...register('cardNumber')}
                  placeholder="1234 5678 9012 3456"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm
                    ${errors.cardNumber ? 'border-red-300' : ''}`}
                />
                {errors.cardNumber && (
                  <TransitionElement>
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                  </TransitionElement>
                )}
              </div>

              {/* Expiry Date and CVV */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700">
                    Month
                  </label>
                  <select
                    id="expiryMonth"
                    {...register('expiryMonth')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm
                      ${errors.expiryMonth ? 'border-red-300' : ''}`}
                  >
                    <option value="">MM</option>
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  {errors.expiryMonth && (
                    <TransitionElement>
                      <p className="mt-1 text-sm text-red-600">{errors.expiryMonth.message}</p>
                    </TransitionElement>
                  )}
                </div>

                <div>
                  <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700">
                    Year
                  </label>
                  <select
                    id="expiryYear"
                    {...register('expiryYear')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm
                      ${errors.expiryYear ? 'border-red-300' : ''}`}
                  >
                    <option value="">YYYY</option>
                    {years.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                  {errors.expiryYear && (
                    <TransitionElement>
                      <p className="mt-1 text-sm text-red-600">{errors.expiryYear.message}</p>
                    </TransitionElement>
                  )}
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    {...register('cvv')}
                    placeholder="123"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm
                      ${errors.cvv ? 'border-red-300' : ''}`}
                  />
                  {errors.cvv && (
                    <TransitionElement>
                      <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
                    </TransitionElement>
                  )}
                </div>
              </div>

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
            </form>
          </TransitionElement>
        )}

        {/* PayPal Option */}
        {paymentMethod === 'paypal' && (
          <TransitionElement>
            <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-500">
                You will be redirected to PayPal to complete your payment.
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    // In a real implementation, this would redirect to PayPal
                    alert('This would redirect to PayPal in a real implementation');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue with PayPal
                </button>
              </div>
            </div>
          </TransitionElement>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;
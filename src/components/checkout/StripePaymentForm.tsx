'use client';

import React, { useState, useEffect } from 'react';
import { 
  CardElement, 
  useStripe, 
  useElements, 
  Elements 
} from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { TransitionElement } from '../animation';

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

const StripePaymentFormContent: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  amount,
  onPaymentSuccess,
  onPaymentError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    if (!cardComplete) {
      setError('Please complete your card details');
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails
        }
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
        onPaymentError(paymentError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        onPaymentSuccess(paymentIntent.id);
      } else {
        setError('Payment status unknown. Please contact support.');
        onPaymentError('Payment status unknown');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      onPaymentError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    setError(event.error ? event.error.message : null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Cardholder Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={billingDetails.name}
            onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={billingDetails.email}
            onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="card" className="block text-sm font-medium text-gray-700">
            Card Details
          </label>
          <div className="mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500">
            <CardElement
              id="card"
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
              onChange={handleCardChange}
            />
          </div>
        </div>
      </div>

      {error && (
        <TransitionElement>
          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </TransitionElement>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Your card will be charged ${(amount / 100).toFixed(2)}
        </p>
        <button
          type="submit"
          disabled={!stripe || processing || succeeded}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : succeeded ? (
            'Payment Successful'
          ) : (
            'Pay Now'
          )}
        </button>
      </div>
    </form>
  );
};

interface StripeWrapperProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

export const StripePaymentForm: React.FC<StripeWrapperProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Stripe
    const loadStripeInstance = async () => {
      try {
        const stripe = await getStripe();
        setStripePromise(stripe);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Stripe');
      }
    };

    loadStripeInstance();
  }, []);

  useEffect(() => {
    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/checkout/payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create payment intent');
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        onPaymentError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, onPaymentError]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !stripePromise) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-sm text-red-700">
          {error || 'Failed to initialize payment system. Please try again later.'}
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripePaymentFormContent
        clientSecret={clientSecret}
        amount={amount}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default StripePaymentForm;
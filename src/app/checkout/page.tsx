'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckoutLayout, 
  CheckoutStepper, 
  AddressForm, 
  PaymentForm, 
  OrderSummary,
  ShippingOptions,
  StripePaymentForm
} from '@/components/checkout';
import { FadeInSection, PageTransition } from '@/components/animation';
import type { CheckoutStep } from '@/components/checkout/CheckoutStepper';
import type { AddressFormData } from '@/components/checkout/AddressForm';
import type { PaymentFormData } from '@/components/checkout/PaymentForm';
import type { ShippingOption } from '@/components/checkout/ShippingOptions';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingAddress, setShippingAddress] = useState<AddressFormData | null>(null);
  const [billingAddress, setBillingAddress] = useState<AddressFormData | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentFormData | null>(null);
  const [selectedShippingOption, setSelectedShippingOption] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Shipping options
  const shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '3-5 business days',
      price: 5.99,
      estimatedDelivery: '3-5 business days'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '1-2 business days',
      price: 12.99,
      estimatedDelivery: '1-2 business days'
    }
  ];
  
  // Calculate order totals
  const subtotal = cart?.totalPrice || 0;
  const shippingCost = subtotal > 50 ? 0 : 
    selectedShippingOption === 'express' ? 12.99 : 5.99;
  const tax = parseFloat((subtotal * 0.08).toFixed(2)); // 8% tax rate
  const totalPrice = parseFloat((subtotal + tax + shippingCost).toFixed(2));
  
  // Check if cart is empty and redirect if needed
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);
  
  // Handle shipping address submission
  const handleShippingSubmit = (data: AddressFormData) => {
    setShippingAddress(data);
    if (sameAsShipping) {
      setBillingAddress(data);
    }
    setCurrentStep('payment');
  };
  
  // Handle billing address submission
  const handleBillingSubmit = (data: AddressFormData) => {
    setBillingAddress(data);
  };
  
  // Handle payment submission
  const handlePaymentSubmit = (data: PaymentFormData) => {
    setPaymentDetails(data);
    setCurrentStep('review');
  };
  
  // Handle order submission
  const handlePlaceOrder = async () => {
    if (!shippingAddress || !billingAddress || !paymentDetails || !cart) {
      setError('Missing required information');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartId: cart._id,
          email: user?.email || '',
          shippingAddress,
          billingAddress,
          paymentDetails: {
            method: 'credit_card',
            cardNumber: paymentDetails.cardNumber,
            expiryMonth: paymentDetails.expiryMonth,
            expiryYear: paymentDetails.expiryYear,
            cardholderName: paymentDetails.cardholderName,
          },
          shippingMethod: selectedShippingOption,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to process order');
      }
      
      // Clear cart and redirect to order confirmation
      clearCart();
      router.push(`/checkout/confirmation?orderId=${data.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsProcessing(false);
    }
  };
  
  // Render order summary sidebar
  const renderOrderSummary = () => {
    if (!cart) return null;
    
    const summaryItems = cart.items.map(item => ({
      id: item._id,
      name: item.product.name,
      price: item.price / item.quantity,
      quantity: item.quantity,
      image: item.product.images?.[0] || '',
      customizations: {
        scent: item.customizations.scent ? { name: item.customizations.scent } : undefined,
        color: item.customizations.color ? { name: item.customizations.color } : undefined,
        size: item.customizations.size ? { name: item.customizations.size } : undefined,
      },
    }));
    
    return (
      <OrderSummary
        items={summaryItems}
        subtotal={subtotal}
        tax={tax}
        shippingCost={shippingCost}
        totalPrice={totalPrice}
        showItemDetails={true}
      />
    );
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'shipping':
        return (
          <FadeInSection>
            <div className="space-y-8">
              <AddressForm
                title="Shipping Address"
                onSubmit={handleShippingSubmit}
                initialData={shippingAddress || {}}
                submitLabel="Continue to Payment"
              />
              
              <ShippingOptions
                options={shippingOptions}
                selectedOption={selectedShippingOption}
                onOptionChange={setSelectedShippingOption}
                subtotal={subtotal}
                freeShippingThreshold={50}
              />
            </div>
          </FadeInSection>
        );
        
      case 'payment':
        return (
          <FadeInSection>
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
              
              {/* Stripe Payment Form */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <StripePaymentForm
                  amount={Math.round(totalPrice * 100)} // Convert to cents for Stripe
                  onPaymentSuccess={(paymentIntentId) => {
                    // Store payment intent ID and move to review
                    setPaymentDetails({
                      cardholderName: 'Stripe Payment',
                      cardNumber: 'Stripe',
                      expiryMonth: 'XX',
                      expiryYear: 'XXXX',
                      cvv: 'XXX',
                      stripePaymentIntentId: paymentIntentId
                    } as PaymentFormData & { stripePaymentIntentId: string });
                    setCurrentStep('review');
                  }}
                  onPaymentError={(errorMessage) => {
                    setError(errorMessage);
                  }}
                />
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
                
                <AddressForm
                  title="Billing Address"
                  onSubmit={handleBillingSubmit}
                  initialData={billingAddress || {}}
                  showSameAsShipping={true}
                  onSameAsShippingChange={(checked) => {
                    setSameAsShipping(checked);
                    if (checked && shippingAddress) {
                      setBillingAddress(shippingAddress);
                    }
                  }}
                  isSameAsShipping={sameAsShipping}
                />
              </div>
            </div>
          </FadeInSection>
        );
        
      case 'review':
        return (
          <FadeInSection>
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-900">Review Your Order</h2>
              
              {/* Shipping Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {shippingAddress && (
                    <div className="text-sm text-gray-700">
                      <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                      <p>{shippingAddress.street}</p>
                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                      <p>{shippingAddress.country}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Billing Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {billingAddress && (
                    <div className="text-sm text-gray-700">
                      <p>{billingAddress.firstName} {billingAddress.lastName}</p>
                      <p>{billingAddress.street}</p>
                      <p>{billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}</p>
                      <p>{billingAddress.country}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {paymentDetails && (
                    <div className="text-sm text-gray-700">
                      <p>{paymentDetails.cardholderName}</p>
                      <p>Card ending in {paymentDetails.cardNumber.slice(-4)}</p>
                      <p>Expires {paymentDetails.expiryMonth}/{paymentDetails.expiryYear}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Error message */}
              {error && (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              {/* Place Order Button */}
              <div className="flex justify-end">
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </div>
          </FadeInSection>
        );
        
      default:
        return null;
    }
  };
  
  if (!cart) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>
          
          <CheckoutStepper 
            currentStep={currentStep} 
            onStepClick={(step) => {
              // Only allow going back to previous steps
              if (
                (step === 'shipping') || 
                (step === 'payment' && shippingAddress) ||
                (step === 'review' && shippingAddress && paymentDetails)
              ) {
                setCurrentStep(step);
              }
            }}
            allowNavigation={true}
          />
          
          <CheckoutLayout sidebar={renderOrderSummary()}>
            {renderStepContent()}
          </CheckoutLayout>
        </div>
      </div>
    </PageTransition>
  );
}
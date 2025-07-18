import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutPage from '../page';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock contexts
jest.mock('@/contexts/CartContext', () => ({
  useCart: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock checkout components
jest.mock('@/components/checkout', () => ({
  CheckoutLayout: ({ children, sidebar }: any) => (
    <div data-testid="checkout-layout">
      <div data-testid="checkout-main">{children}</div>
      <div data-testid="checkout-sidebar">{sidebar}</div>
    </div>
  ),
  CheckoutStepper: ({ currentStep, onStepClick }: any) => (
    <div data-testid="checkout-stepper">
      <div data-testid="current-step">{currentStep}</div>
      <button onClick={() => onStepClick('shipping')}>Go to Shipping</button>
      <button onClick={() => onStepClick('payment')}>Go to Payment</button>
      <button onClick={() => onStepClick('review')}>Go to Review</button>
    </div>
  ),
  AddressForm: ({ title, onSubmit, initialData, submitLabel, showSameAsShipping, onSameAsShippingChange, isSameAsShipping }: any) => (
    <div data-testid={`address-form-${title.toLowerCase()}`}>
      <h3>{title}</h3>
      {showSameAsShipping && (
        <label>
          <input 
            type="checkbox" 
            checked={isSameAsShipping} 
            onChange={(e) => onSameAsShippingChange(e.target.checked)} 
            data-testid="same-as-shipping-checkbox"
          />
          Same as shipping
        </label>
      )}
      <button 
        onClick={() => onSubmit({
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA',
          phone: '555-123-4567'
        })}
        data-testid={`submit-${title.toLowerCase()}`}
      >
        {submitLabel || 'Submit'}
      </button>
    </div>
  ),
  PaymentForm: ({ onSubmit }: any) => (
    <div data-testid="payment-form">
      <button 
        onClick={() => onSubmit({
          cardholderName: 'John Doe',
          cardNumber: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123'
        })}
        data-testid="submit-payment"
      >
        Submit Payment
      </button>
    </div>
  ),
  OrderSummary: ({ items, subtotal, tax, shippingCost, totalPrice }: any) => (
    <div data-testid="order-summary">
      <div data-testid="summary-items">
        {items.map((item: any, index: number) => (
          <div key={index} data-testid={`summary-item-${index}`}>
            {item.name} - ${item.price} x {item.quantity}
          </div>
        ))}
      </div>
      <div data-testid="summary-subtotal">Subtotal: ${subtotal}</div>
      <div data-testid="summary-tax">Tax: ${tax}</div>
      <div data-testid="summary-shipping">Shipping: ${shippingCost}</div>
      <div data-testid="summary-total">Total: ${totalPrice}</div>
    </div>
  ),
  ShippingOptions: ({ options, selectedOption, onOptionChange }: any) => (
    <div data-testid="shipping-options">
      {options.map((option: any) => (
        <label key={option.id}>
          <input
            type="radio"
            name="shipping"
            value={option.id}
            checked={selectedOption === option.id}
            onChange={() => onOptionChange(option.id)}
            data-testid={`shipping-option-${option.id}`}
          />
          {option.name} - ${option.price}
        </label>
      ))}
    </div>
  ),
  StripePaymentForm: ({ amount, onPaymentSuccess, onPaymentError }: any) => (
    <div data-testid="stripe-payment-form">
      <div>Amount: ${(amount / 100).toFixed(2)}</div>
      <button 
        onClick={() => onPaymentSuccess('pi_mock_123456')}
        data-testid="stripe-payment-success"
      >
        Complete Payment
      </button>
      <button 
        onClick={() => onPaymentError('Payment failed')}
        data-testid="stripe-payment-error"
      >
        Fail Payment
      </button>
    </div>
  ),
}));

// Mock animation components
jest.mock('@/components/animation', () => ({
  FadeInSection: ({ children }: any) => <div data-testid="fade-in-section">{children}</div>,
  PageTransition: ({ children }: any) => <div data-testid="page-transition">{children}</div>,
}));

// Mock fetch API
global.fetch = jest.fn();

describe('Checkout Flow', () => {
  // Mock cart data
  const mockCart = {
    id: 'cart123',
    items: [
      {
        id: 'item1',
        product: {
          id: 'product1',
          name: 'Vanilla Candle',
          basePrice: 15.99,
          images: ['vanilla1.jpg']
        },
        quantity: 1,
        price: 15.99,
        customizations: {
          scent: { id: 'scent1', name: 'Vanilla' },
          color: { id: 'color1', name: 'White' },
          size: { id: 'size1', name: 'Small' }
        }
      },
      {
        id: 'item2',
        product: {
          id: 'product2',
          name: 'Lavender Candle',
          basePrice: 17.99,
          images: ['lavender1.jpg']
        },
        quantity: 2,
        price: 35.98,
        customizations: {
          scent: { id: 'scent2', name: 'Lavender' },
          color: { id: 'color2', name: 'Purple' },
          size: { id: 'size1', name: 'Small' }
        }
      }
    ],
    totalPrice: 51.97
  };

  // Setup mocks before each test
  beforeEach(() => {
    // Mock router
    const mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Mock cart context
    const mockCartContext = {
      cart: mockCart,
      clearCart: jest.fn(),
      isLoading: false
    };
    (useCart as jest.Mock).mockReturnValue(mockCartContext);

    // Mock auth context
    const mockAuthContext = {
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false
    };
    (useAuth as jest.Mock).mockReturnValue(mockAuthContext);

    // Mock fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ 
        success: true, 
        order: { id: 'order123' } 
      })
    });
  });

  it('renders the checkout page with cart items', async () => {
    render(<CheckoutPage />);

    // Check if page title is displayed
    expect(screen.getByText('Checkout')).toBeInTheDocument();

    // Check if stepper is displayed with shipping as current step
    expect(screen.getByTestId('current-step')).toHaveTextContent('shipping');

    // Check if shipping address form is displayed
    expect(screen.getByTestId('address-form-shipping address')).toBeInTheDocument();

    // Check if order summary is displayed with correct items
    expect(screen.getByTestId('summary-items')).toBeInTheDocument();
    expect(screen.getByTestId('summary-item-0')).toHaveTextContent('Vanilla Candle');
    expect(screen.getByTestId('summary-item-1')).toHaveTextContent('Lavender Candle');
  });

  it('completes the full checkout flow', async () => {
    render(<CheckoutPage />);

    // Step 1: Fill shipping address
    expect(screen.getByTestId('current-step')).toHaveTextContent('shipping');
    fireEvent.click(screen.getByTestId('submit-shipping address'));

    // Should move to payment step
    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('payment');
    });

    // Step 2: Complete Stripe payment
    expect(screen.getByTestId('stripe-payment-form')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('stripe-payment-success'));

    // Should move to review step
    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('review');
    });

    // Step 3: Place order
    const placeOrderButton = screen.getByText('Place Order');
    fireEvent.click(placeOrderButton);

    // Should call fetch with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/checkout/process', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.any(String)
      }));
    });

    // Check if cart was cleared
    const { clearCart } = useCart();
    expect(clearCart).toHaveBeenCalled();

    // Check if redirected to confirmation page
    const { push } = useRouter();
    expect(push).toHaveBeenCalledWith('/checkout/confirmation?orderId=order123');
  });

  it('redirects to cart if cart is empty', async () => {
    // Mock empty cart
    (useCart as jest.Mock).mockReturnValue({
      ...useCart(),
      cart: {
        id: 'cart123',
        items: [],
        totalPrice: 0
      }
    });

    render(<CheckoutPage />);

    // Should redirect to cart page
    const { push } = useRouter();
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/cart');
    });
  });
});
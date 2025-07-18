import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import { api } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  API_ENDPOINTS: {
    cart: {
      get: '/api/cart',
      addItem: '/api/cart/items',
      updateItem: (id: string) => `/api/cart/items/${id}`,
      removeItem: (id: string) => `/api/cart/items/${id}`,
      merge: '/api/cart/merge',
    },
  },
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the AuthContext
jest.mock('../AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock localStorage utilities
jest.mock('@/utils/localStorage', () => ({
  getLocalStorageItem: jest.fn(),
  setLocalStorageItem: jest.fn(),
  removeLocalStorageItem: jest.fn(),
}));

// Test component that uses the cart context
const TestComponent = () => {
  const { 
    cart, 
    isLoading, 
    isCartOpen, 
    openCart, 
    closeCart, 
    toggleCart, 
    addToCart, 
    updateCartItem, 
    removeCartItem, 
    clearCart, 
    itemCount 
  } = useCart();

  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="cart-state">{isCartOpen ? 'Open' : 'Closed'}</div>
      <div data-testid="item-count">{itemCount}</div>
      <div data-testid="cart-items">
        {cart?.items.map((item, index) => (
          <div key={index} data-testid={`cart-item-${index}`}>
            {item.product.name} - Qty: {item.quantity}
          </div>
        ))}
      </div>
      <button onClick={() => openCart()}>Open Cart</button>
      <button onClick={() => closeCart()}>Close Cart</button>
      <button onClick={() => toggleCart()}>Toggle Cart</button>
      <button onClick={() => addToCart({
        productId: 'product1',
        quantity: 1,
        customizations: {
          scentId: 'scent1',
          colorId: 'color1',
          sizeId: 'size1'
        }
      })}>Add Item</button>
      <button onClick={() => updateCartItem('item1', { quantity: 2 })}>Update Item</button>
      <button onClick={() => removeCartItem('item1')}>Remove Item</button>
      <button onClick={() => clearCart()}>Clear Cart</button>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock for API calls
    (api.get as jest.Mock).mockResolvedValue({ success: false });
    (api.post as jest.Mock).mockResolvedValue({ success: false });
    (api.put as jest.Mock).mockResolvedValue({ success: false });
    (api.delete as jest.Mock).mockResolvedValue({ success: false });
  });

  it('initializes with empty cart', async () => {
    // Mock empty cart response
    (api.get as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        items: [],
        totalPrice: 0,
        guestId: 'guest123'
      }
    });

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });

  it('fetches cart with items', async () => {
    // Mock cart with items response
    (api.get as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        items: [
          {
            _id: 'item1',
            product: {
              _id: 'product1',
              name: 'Vanilla Candle',
              basePrice: 15.99
            },
            quantity: 1,
            customizations: {
              scent: { _id: 'scent1', name: 'Vanilla' },
              color: { _id: 'color1', name: 'White' },
              size: { _id: 'size1', name: 'Medium' }
            },
            price: 15.99
          },
          {
            _id: 'item2',
            product: {
              _id: 'product2',
              name: 'Lavender Candle',
              basePrice: 17.99
            },
            quantity: 2,
            customizations: {
              scent: { _id: 'scent2', name: 'Lavender' },
              color: { _id: 'color2', name: 'Purple' },
              size: { _id: 'size1', name: 'Medium' }
            },
            price: 35.98
          }
        ],
        totalPrice: 51.97,
        guestId: 'guest123'
      }
    });

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    expect(screen.getByTestId('item-count')).toHaveTextContent('3');
    expect(screen.getByTestId('cart-item-0')).toHaveTextContent('Vanilla Candle - Qty: 1');
    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Lavender Candle - Qty: 2');
  });

  it('handles cart drawer open/close/toggle', async () => {
    // Mock empty cart response
    (api.get as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        items: [],
        totalPrice: 0,
        guestId: 'guest123'
      }
    });

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Cart should be closed initially
    expect(screen.getByTestId('cart-state')).toHaveTextContent('Closed');
    
    // Open cart
    fireEvent.click(screen.getByText('Open Cart'));
    expect(screen.getByTestId('cart-state')).toHaveTextContent('Open');
    
    // Close cart
    fireEvent.click(screen.getByText('Close Cart'));
    expect(screen.getByTestId('cart-state')).toHaveTextContent('Closed');
    
    // Toggle cart (open)
    fireEvent.click(screen.getByText('Toggle Cart'));
    expect(screen.getByTestId('cart-state')).toHaveTextContent('Open');
    
    // Toggle cart (close)
    fireEvent.click(screen.getByText('Toggle Cart'));
    expect(screen.getByTestId('cart-state')).toHaveTextContent('Closed');
  });

  it('adds item to cart', async () => {
    // Mock empty cart for initial fetch
    (api.get as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        items: [],
        totalPrice: 0,
        guestId: 'guest123'
      }
    });

    // Mock add item response
    (api.post as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        items: [
          {
            _id: 'item1',
            product: {
              _id: 'product1',
              name: 'Vanilla Candle',
              basePrice: 15.99
            },
            quantity: 1,
            customizations: {
              scent: { _id: 'scent1', name: 'Vanilla' },
              color: { _id: 'color1', name: 'White' },
              size: { _id: 'size1', name: 'Medium' }
            },
            price: 15.99
          }
        ],
        totalPrice: 15.99,
        guestId: 'guest123'
      }
    });

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Cart should be empty initially
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    
    // Add item to cart
    fireEvent.click(screen.getByText('Add Item'));
    
    // Wait for add item to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Cart should have 1 item
    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-item-0')).toHaveTextContent('Vanilla Candle - Qty: 1');
    
    // Cart should be open after adding item
    expect(screen.getByTestId('cart-state')).toHaveTextContent('Open');
  });
});
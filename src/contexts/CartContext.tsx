'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api, API_ENDPOINTS } from '../lib/api';
import { Cart, AddToCartPayload, UpdateCartItemPayload, CartResponse, MergeCartPayload } from '../types/cart';
import { useAuth } from './AuthContext';
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from '../utils/localStorage';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  updateCartItem: (itemId: string, payload: UpdateCartItemPayload) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const { user, isAuthenticated } = useAuth();
  
  // Local storage key for guest cart ID
  const GUEST_CART_ID_KEY = 'candle_shop_guest_cart_id';

  // Calculate total item count
  const itemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<CartResponse>(API_ENDPOINTS.cart.get);
      setCart(response.data);
      
      // If this is a guest cart, store the ID in localStorage
      if (!isAuthenticated && response.data && response.data.guestId) {
        setLocalStorageItem(GUEST_CART_ID_KEY, response.data.guestId);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Merge guest cart with user cart
  const mergeGuestCart = useCallback(async () => {
    try {
      const guestCartId = getLocalStorageItem<string | null>(GUEST_CART_ID_KEY, null);
      
      if (!guestCartId || !isAuthenticated) {
        return;
      }
      
      setIsLoading(true);
      
      // Call the merge API endpoint
      const payload: MergeCartPayload = { guestId: guestCartId };
      const response = await api.post<CartResponse>(API_ENDPOINTS.cart.merge, payload);
      
      // Update cart with merged result
      setCart(response.data);
      
      // Remove guest cart ID from localStorage after successful merge
      removeLocalStorageItem(GUEST_CART_ID_KEY);
    } catch (error) {
      console.error('Error merging carts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch cart on initial load and when user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
  
  // Check if user just logged in and needs to merge carts
  useEffect(() => {
    if (isAuthenticated && user) {
      const guestCartId = getLocalStorageItem<string | null>(GUEST_CART_ID_KEY, null);
      if (guestCartId) {
        mergeGuestCart();
      }
    }
  }, [isAuthenticated, user, mergeGuestCart]);

  // Add item to cart
  const addToCart = async (payload: AddToCartPayload) => {
    try {
      setIsLoading(true);
      const response = await api.post<CartResponse>(API_ENDPOINTS.cart.addItem, payload);
      setCart(response.data);
      openCart(); // Open cart drawer when item is added
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update cart item
  const updateCartItem = async (itemId: string, payload: UpdateCartItemPayload) => {
    try {
      setIsLoading(true);
      const response = await api.put<CartResponse>(
        API_ENDPOINTS.cart.updateItem(itemId),
        payload
      );
      setCart(response.data);
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeCartItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      const response = await api.delete<CartResponse>(API_ENDPOINTS.cart.removeItem(itemId));
      setCart(response.data);
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setIsLoading(true);
      const response = await api.delete<CartResponse>(API_ENDPOINTS.cart.get);
      setCart(response.data);
      
      // If guest cart, remove the ID from localStorage
      if (!isAuthenticated) {
        removeLocalStorageItem(GUEST_CART_ID_KEY);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Cart drawer controls
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  return (
    <CartContext.Provider
      value={{
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
        mergeGuestCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
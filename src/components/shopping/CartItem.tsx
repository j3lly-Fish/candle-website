import React from 'react';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/types/cart';
import { TransitionElement } from '@/components/animation';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateCartItem, removeCartItem, isLoading } = useCart();
  
  // Handle quantity change
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(item._id, { quantity: newQuantity });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };
  
  // Handle item removal
  const handleRemove = async () => {
    try {
      await removeCartItem(item._id);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };
  
  // Format customizations for display
  const formatCustomizations = () => {
    const customizations = [];
    
    if (item.customizations.scent) {
      customizations.push(`Scent: ${item.customizations.scent}`);
    }
    
    if (item.customizations.color) {
      customizations.push(`Color: ${item.customizations.color}`);
    }
    
    if (item.customizations.size) {
      customizations.push(`Size: ${item.customizations.size}`);
    }
    
    return customizations.length > 0 
      ? customizations.join(' | ') 
      : 'No customizations';
  };

  return (
    <TransitionElement
      className="flex items-start p-4 border-b border-gray-200"
      animation="fade"
      hoverScale={1.01}
      duration={0.2}
    >
      {/* Product Image */}
      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100">
        {item.product.images && item.product.images.length > 0 ? (
          <Image
            src={item.product.images[0]}
            alt={item.product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>
      
      {/* Product Details */}
      <div className="flex-1 ml-4">
        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
        <p className="text-sm text-gray-500 mt-1">{formatCustomizations()}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="text-maroon font-medium">
            ${(item.price * item.quantity).toFixed(2)}
          </div>
          
          {/* Quantity Controls */}
          <div className="flex items-center">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isLoading || item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              -
            </button>
            
            <span className="mx-2 w-8 text-center">{item.quantity}</span>
            
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={isLoading}
        className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Remove item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </TransitionElement>
  );
};

export default CartItem;
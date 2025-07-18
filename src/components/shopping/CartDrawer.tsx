import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import CartItem from './CartItem';
import { InteractiveButton, LoadingSpinner, TransitionElement } from '@/components/animation';

const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, closeCart, isLoading, clearCart } = useCart();

  // Animation variants for the drawer
  const drawerVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      x: '100%', 
      opacity: 0,
      transition: { 
        ease: 'easeInOut',
        duration: 0.3
      }
    }
  };

  // Animation variants for the overlay
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeCart}
          />
          
          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-xl flex flex-col"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Your Cart</h2>
              <TransitionElement
                hoverScale={1.1}
                hoverRotation={5}
                duration={0.2}
              >
                <button
                  onClick={closeCart}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full"
                  aria-label="Close cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </TransitionElement>
            </div>
            
            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <LoadingSpinner size="medium" />
                </div>
              ) : cart && cart.items.length > 0 ? (
                <>
                  {/* Cart Items */}
                  <div className="divide-y divide-gray-200">
                    {cart.items.map((item) => (
                      <CartItem key={item._id} item={item} />
                    ))}
                  </div>
                  
                  {/* Clear Cart Button */}
                  <div className="p-4">
                    <InteractiveButton
                      onClick={handleClearCart}
                      disabled={isLoading}
                      variant="text"
                      size="small"
                      hoverEffect="color-shift"
                      feedbackType="scale"
                      colorShiftTo="#FF0000"
                    >
                      Clear Cart
                    </InteractiveButton>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 p-4 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-600 mb-4">Your cart is empty</p>
                  <Link href="/products" onClick={closeCart}>
                    <InteractiveButton
                      variant="outline"
                      hoverEffect="color-shift"
                      feedbackType="scale"
                      colorShiftTo="#FF0000"
                    >
                      Continue Shopping
                    </InteractiveButton>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Footer */}
            {cart && cart.items.length > 0 && (
              <div className="border-t border-gray-200 p-4">
                {/* Summary */}
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-semibold">${cart.totalPrice.toFixed(2)}</span>
                </div>
                
                {/* Checkout Button */}
                <Link href="/checkout" onClick={closeCart} className="block w-full">
                  <InteractiveButton
                    variant="primary"
                    fullWidth
                    size="large"
                    hoverEffect="glow"
                    feedbackType="ripple"
                    glowColor="rgba(128, 0, 0, 0.5)"
                  >
                    Proceed to Checkout
                  </InteractiveButton>
                </Link>
                
                {/* Continue Shopping */}
                <div className="mt-2">
                  <InteractiveButton
                    variant="secondary"
                    fullWidth
                    onClick={closeCart}
                    hoverEffect="scale"
                    feedbackType="scale"
                  >
                    Continue Shopping
                  </InteractiveButton>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
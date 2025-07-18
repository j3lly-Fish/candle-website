import React from 'react';
import { motion } from 'framer-motion';
import { GlassMorphism } from '@/components/animation';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  discount?: number;
  currency?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'highlight' | 'sale';
}

/**
 * PriceDisplay component with glass morphism effects
 * Displays product price with optional original price and discount
 */
const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  discount,
  currency = '$',
  size = 'medium',
  variant = 'default'
}) => {
  // Determine text size based on the size prop
  const textSizeClass = {
    small: 'text-base',
    medium: 'text-xl',
    large: 'text-2xl'
  }[size];

  // Determine preset based on variant
  const preset = {
    default: 'light',
    highlight: 'maroon',
    sale: 'red'
  }[variant];

  // Format price with currency
  const formatPrice = (value: number) => {
    return `${currency}${value.toFixed(2)}`;
  };

  // Calculate discount percentage if not provided but original price exists
  const discountPercentage = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div className="flex items-center space-x-2">
      <GlassMorphism
        preset={preset}
        opacity={variant === 'default' ? 0.1 : 0.2}
        blurAmount={3}
        hoverEffect={true}
        hoverOpacity={variant === 'default' ? 0.15 : 0.25}
        hoverGlow={variant !== 'default'}
        glowColor={variant === 'sale' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(128, 0, 0, 0.3)'}
        borderRadius="0.375rem"
        className="px-3 py-1"
      >
        <span className={`font-bold ${textSizeClass} ${variant === 'sale' ? 'text-red-600' : variant === 'highlight' ? 'text-maroon' : 'text-gray-900'}`}>
          {formatPrice(price)}
        </span>
      </GlassMorphism>

      {hasDiscount && (
        <>
          <span className="text-gray-500 line-through text-sm">
            {formatPrice(originalPrice)}
          </span>

          <GlassMorphism
            preset="red"
            opacity={0.8}
            blurAmount={2}
            borderRadius="9999px"
            className="px-2 py-0.5"
          >
            <span className="text-xs font-medium text-white">
              -{discountPercentage}%
            </span>
          </GlassMorphism>
        </>
      )}
    </div>
  );
};

export default PriceDisplay;
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { InteractiveCard, GlassMorphism, TransparentOverlay } from '../animation';
import { formatCurrency } from '@/utils/formatters';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

/**
 * ProductCard component displays a single product in a grid or list
 * Features hover animations, out of stock indicator, and rating display
 * Includes transparency effects for UI elements
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const {
    id,
    name,
    basePrice,
    images,
    category,
    rating,
    inventory,
    tags
  } = product;

  // Get the first image or use a placeholder
  const imageUrl = images && images.length > 0 
    ? images[0] 
    : '/placeholder-candle.jpg';

  // Format the price
  const formattedPrice = formatCurrency(basePrice);

  // Determine if product is out of stock
  const isOutOfStock = !inventory.isInStock;

  // Determine if product is low in stock
  const isLowStock = inventory.quantity <= inventory.lowStockThreshold && inventory.quantity > 0;

  return (
    <InteractiveCard
      className="group relative flex flex-col rounded-lg overflow-hidden"
      hoverEffect="multiple"
      clickEffect="scale"
      shadowEffect="medium"
      hoverShadowEffect="strong"
      glowColor="rgba(128, 0, 0, 0.2)"
      duration={0.3}
      transparencyEffect={true}
      transparencyLevel={0.95}
    >
      <Link href={`/product/${id}`} className="block h-full">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={priority}
          />
          
          {/* Subtle image overlay for better contrast */}
          <TransparentOverlay 
            gradientOverlay 
            gradientColors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)']} 
            gradientDirection="bottom"
            className="pointer-events-none"
          >
            <div />
          </TransparentOverlay>
          
          {/* Category Tag with glass effect */}
          <GlassMorphism
            preset="light"
            className="absolute top-3 left-3 px-3 py-1 z-10"
            opacity={0.7}
            blurAmount={5}
            hoverEffect={true}
            hoverOpacity={0.9}
            borderRadius="9999px"
          >
            <span className="text-xs font-medium text-gray-800">
              {category}
            </span>
          </GlassMorphism>
          
          {/* Featured Badge with glass effect */}
          {product.featured && (
            <GlassMorphism
              preset="red"
              className="absolute top-3 right-3 px-3 py-1 z-10"
              opacity={0.8}
              blurAmount={5}
              hoverEffect={true}
              hoverScale={1.05}
              hoverOpacity={0.9}
              borderRadius="9999px"
            >
              <span className="text-xs font-medium text-white">
                Featured
              </span>
            </GlassMorphism>
          )}
          
          {/* Out of Stock Overlay with glass effect */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
              <GlassMorphism
                preset="frosted"
                className="px-4 py-2"
                opacity={0.9}
                blurAmount={3}
                hoverEffect={true}
                hoverScale={1.05}
                borderRadius="0.375rem"
              >
                <span className="text-red-600 font-bold">
                  Out of Stock
                </span>
              </GlassMorphism>
            </div>
          )}
          
          {/* Low Stock Indicator with glass effect */}
          {isLowStock && !isOutOfStock && (
            <GlassMorphism
              className="absolute bottom-3 left-3 px-3 py-1 z-10 bg-amber-500/90 backdrop-blur-sm"
              hoverEffect={true}
              hoverScale={1.05}
              borderRadius="9999px"
              borderWidth="0"
            >
              <span className="text-xs font-medium text-white">
                Low Stock
              </span>
            </GlassMorphism>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2 transition-colors duration-300 group-hover:text-maroon">{name}</h3>
          
          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.round(rating.average) ? 'text-amber-400' : 'text-gray-300'} transition-transform duration-300 group-hover:scale-110`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1 transition-opacity duration-300 group-hover:opacity-80">({rating.count})</span>
          </div>
          
          {/* Tags with glass effect */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.slice(0, 3).map((tag, index) => (
                <GlassMorphism
                  key={index}
                  preset="light"
                  className="px-2 py-0.5"
                  opacity={0.5}
                  blurAmount={2}
                  borderRadius="9999px"
                  borderWidth="0"
                >
                  <span className="text-xs text-gray-600">
                    {tag}
                  </span>
                </GlassMorphism>
              ))}
              {tags.length > 3 && (
                <GlassMorphism
                  preset="light"
                  className="px-2 py-0.5"
                  opacity={0.5}
                  blurAmount={2}
                  borderRadius="9999px"
                  borderWidth="0"
                >
                  <span className="text-xs text-gray-600">
                    +{tags.length - 3}
                  </span>
                </GlassMorphism>
              )}
            </div>
          )}
          
          {/* Price with glass effect */}
          <div className="mt-auto">
            <GlassMorphism
              preset="maroon"
              className="inline-block px-2 py-1"
              opacity={0.1}
              blurAmount={2}
              hoverEffect={true}
              hoverOpacity={0.2}
              hoverScale={1.05}
              borderRadius="0.25rem"
              borderWidth="0"
            >
              <span className="text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-maroon">
                {formattedPrice}
              </span>
            </GlassMorphism>
          </div>
        </div>
      </Link>
    </InteractiveCard>
  );
};

export default ProductCard;
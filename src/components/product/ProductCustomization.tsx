'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScentOption, ColorOption, SizeOption, Product } from '@/types';
import { TransitionElement } from '@/components/animation';
import ProductPreview from './ProductPreview';
import { CustomizationApi } from '@/lib/customizationApi';

interface ProductCustomizationProps {
  product: Product;
  onCustomizationChange: (customization: {
    scent?: ScentOption | null;
    color?: ColorOption | null;
    size?: SizeOption | null;
    price: number;
    isValid: boolean;
  }) => void;
}

export default function ProductCustomization({ product, onCustomizationChange }: ProductCustomizationProps) {
  const [selectedScent, setSelectedScent] = useState<ScentOption | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [customizedPrice, setCustomizedPrice] = useState<number>(product.basePrice);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check if product has customization options
  const hasScents = product.customizationOptions?.scents?.length > 0;
  const hasColors = product.customizationOptions?.colors?.length > 0;
  const hasSizes = product.customizationOptions?.sizes?.length > 0;

  // Filter out unavailable options
  const availableScents = hasScents 
    ? product.customizationOptions.scents.filter(scent => scent.available && scent.inStock)
    : [];
  
  const availableColors = hasColors 
    ? product.customizationOptions.colors.filter(color => color.available && color.inStock)
    : [];
  
  const availableSizes = hasSizes 
    ? product.customizationOptions.sizes.filter(size => size.available && size.inStock)
    : [];

  // Validate customization combination and calculate price
  useEffect(() => {
    const validateCustomization = async () => {
      setIsLoading(true);
      setValidationMessage(null);
      
      try {
        // Prepare the combination data
        const combination = {
          scentId: selectedScent?.id,
          colorId: selectedColor?.id,
          sizeId: selectedSize?.id
        };
        
        // Call API to validate combination
        const result = await CustomizationApi.validateCustomization(product.id, combination);
        
        if (!result.isValid) {
          setValidationMessage(result.message || 'Invalid combination');
          onCustomizationChange({
            scent: selectedScent,
            color: selectedColor,
            size: selectedSize,
            price: product.basePrice,
            isValid: false
          });
          return;
        }
        
        // Update price and validation status
        setCustomizedPrice(result.price);
        onCustomizationChange({
          scent: selectedScent,
          color: selectedColor,
          size: selectedSize,
          price: result.price,
          isValid: result.isValid
        });
      } catch (error) {
        console.error('Error validating customization:', error);
        setValidationMessage('Error validating customization options');
        onCustomizationChange({
          scent: selectedScent,
          color: selectedColor,
          size: selectedSize,
          price: product.basePrice,
          isValid: false
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Simple client-side price calculation (will be validated server-side)
    const calculateClientSidePrice = () => {
      let price = product.basePrice;
      
      if (selectedScent) {
        price += selectedScent.additionalPrice;
      }
      
      if (selectedColor) {
        price += selectedColor.additionalPrice;
      }
      
      if (selectedSize) {
        price += selectedSize.additionalPrice;
      }
      
      return price;
    };
    
    // Update price immediately for better UX
    const clientSidePrice = calculateClientSidePrice();
    setCustomizedPrice(clientSidePrice);
    
    // Only validate with server if we have selections
    if (selectedScent || selectedColor || selectedSize) {
      validateCustomization();
    } else {
      // Reset to base price if no customizations
      setCustomizedPrice(product.basePrice);
      onCustomizationChange({
        scent: null,
        color: null,
        size: null,
        price: product.basePrice,
        isValid: true
      });
    }
  }, [selectedScent, selectedColor, selectedSize, product.id, product.basePrice, onCustomizationChange]);

  // Handle scent selection
  const handleScentChange = (scent: ScentOption | null) => {
    setSelectedScent(scent === selectedScent ? null : scent);
  };

  // Handle color selection
  const handleColorChange = (color: ColorOption | null) => {
    setSelectedColor(color === selectedColor ? null : color);
  };

  // Handle size selection
  const handleSizeChange = (size: SizeOption | null) => {
    setSelectedSize(size === selectedSize ? null : size);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h3 
        className="text-lg font-medium text-gray-900"
        variants={itemVariants}
      >
        Customize Your Candle
      </motion.h3>

      {/* Product Preview */}
      <motion.div variants={itemVariants} className="mb-6">
        <ProductPreview
          productId={product.id}
          productName={product.name}
          baseImage={product.images[0]}
          scent={selectedScent}
          color={selectedColor}
          size={selectedSize}
        />
      </motion.div>

      {/* Scent Selection */}
      {hasScents && (
        <motion.div className="space-y-3" variants={itemVariants}>
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">Scent</h4>
            {selectedScent && (
              <span className="text-xs text-gray-500">
                +${selectedScent.additionalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
            {availableScents.map((scent) => (
              <TransitionElement key={scent.id}>
                <button
                  type="button"
                  onClick={() => handleScentChange(scent)}
                  className={`w-full px-3 py-2 text-sm rounded-md transition-all duration-300 ${
                    selectedScent?.id === scent.id
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300'
                  }`}
                  aria-pressed={selectedScent?.id === scent.id}
                >
                  <div className="font-medium">{scent.name}</div>
                  <div className="text-xs opacity-80">
                    {scent.intensity} intensity
                  </div>
                </button>
              </TransitionElement>
            ))}
          </div>
          
          {selectedScent && (
            <motion.div 
              className="text-sm text-gray-600 italic"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {selectedScent.description}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Color Selection */}
      {hasColors && (
        <motion.div className="space-y-3" variants={itemVariants}>
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">Color</h4>
            {selectedColor && (
              <span className="text-xs text-gray-500">
                +${selectedColor.additionalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {availableColors.map((color) => (
              <TransitionElement key={color.id}>
                <button
                  type="button"
                  onClick={() => handleColorChange(color)}
                  className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center ${
                    selectedColor?.id === color.id
                      ? 'ring-2 ring-offset-2 ring-red-600 transform scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hexCode }}
                  aria-label={`Color: ${color.name}`}
                  aria-pressed={selectedColor?.id === color.id}
                >
                  {selectedColor?.id === color.id && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 text-white drop-shadow-md" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  )}
                </button>
              </TransitionElement>
            ))}
          </div>
          
          {selectedColor && (
            <motion.div 
              className="text-sm text-gray-600 italic"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {selectedColor.name}: {selectedColor.description}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Size Selection */}
      {hasSizes && (
        <motion.div className="space-y-3" variants={itemVariants}>
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">Size</h4>
            {selectedSize && (
              <span className="text-xs text-gray-500">
                +${selectedSize.additionalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {availableSizes.map((size) => (
              <TransitionElement key={size.id}>
                <button
                  type="button"
                  onClick={() => handleSizeChange(size)}
                  className={`w-full px-3 py-2 text-sm rounded-md transition-all duration-300 ${
                    selectedSize?.id === size.id
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300'
                  }`}
                  aria-pressed={selectedSize?.id === size.id}
                >
                  <div className="font-medium">{size.name}</div>
                  <div className="text-xs opacity-80">
                    {size.dimensions}
                  </div>
                </button>
              </TransitionElement>
            ))}
          </div>
          
          {selectedSize && (
            <motion.div 
              className="text-sm text-gray-600"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="italic">{selectedSize.description}</div>
              <div className="mt-1 grid grid-cols-2 gap-x-4 text-xs">
                <div>Weight: {selectedSize.weightOz} oz</div>
                <div>Burn time: ~{selectedSize.burnTimeHours} hours</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Price Display */}
      <motion.div 
        className="flex items-center justify-between pt-4 border-t border-gray-200"
        variants={itemVariants}
      >
        <div className="text-sm font-medium text-gray-700">
          Total Price:
        </div>
        <div className="text-xl font-bold text-red-600">
          ${customizedPrice.toFixed(2)}
        </div>
      </motion.div>

      {/* Validation Message */}
      {validationMessage && (
        <motion.div 
          className="text-sm text-red-600 bg-red-50 p-2 rounded-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {validationMessage}
        </motion.div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <motion.div 
          className="flex justify-center py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
        </motion.div>
      )}
    </motion.div>
  );
}
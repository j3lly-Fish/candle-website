'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ScentOption, ColorOption, SizeOption } from '@/types';
import { CustomizationApi } from '@/lib/customizationApi';

interface ProductPreviewProps {
  productId: string;
  productName: string;
  baseImage: string;
  scent: ScentOption | null;
  color: ColorOption | null;
  size: SizeOption | null;
}

export default function ProductPreview({
  productId,
  productName,
  baseImage,
  scent,
  color,
  size
}: ProductPreviewProps) {
  const [_previewUrl, setPreviewUrl] = useState<string>(baseImage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch preview if we have customization options selected
    if (scent || color || size) {
      const fetchPreview = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const url = await CustomizationApi.getProductPreview(productId, {
            scentId: scent?.id,
            colorId: color?.id,
            sizeId: size?.id
          });
          
          if (url) {
            setPreviewUrl(url);
          } else {
            // If no preview URL is returned, use a client-side visualization
            // In a real app, this would be handled by the server
            setPreviewUrl(baseImage);
          }
        } catch (error) {
          console.error('Error fetching preview:', error);
          setError('Could not load preview');
          setPreviewUrl(baseImage);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchPreview();
    } else {
      // Reset to base image if no customizations
      setPreviewUrl(baseImage);
    }
  }, [productId, baseImage, scent, color, size]);

  // For demo purposes, we'll simulate a preview by applying CSS filters
  // In a real app, this would be a server-generated image
  const getColorStyle = () => {
    if (!color) return {};
    
    // Convert hex to RGB for filter calculations
    const hex = color.hexCode.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Calculate sepia, hue-rotate, and saturate values to approximate the color
    // This is a simplified approach - real implementation would use proper image processing
    const sepia = Math.max(r, g, b) < 0.5 ? 0.5 : 0;
    const hue = Math.round((Math.atan2(
      Math.sqrt(3) * (g - b),
      2 * r - g - b
    ) * 180 / Math.PI + 360) % 360);
    const saturation = Math.max(0, 100 * (Math.max(r, g, b) - Math.min(r, g, b)));
    
    return {
      filter: `sepia(${sepia}) hue-rotate(${hue}deg) saturate(${saturation}%)`
    };
  };

  // Get size style based on selected size
  const getSizeStyle = () => {
    if (!size) return {};
    
    // Extract dimensions from size (format: "WxDxH")
    const dimensions = size.dimensions.split('x');
    if (dimensions.length !== 3) return {};
    
    const width = parseFloat(dimensions[0]);
    const height = parseFloat(dimensions[2]);
    
    // Calculate scale factor based on dimensions
    // This is a simplified approach - real implementation would use proper image processing
    const scaleFactor = 1 + (width * height) / 100;
    
    return {
      transform: `scale(${scaleFactor})`
    };
  };

  return (
    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-10 h-10 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-red-600 text-center p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p>{error}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="relative w-40 h-40 transition-all duration-500"
                style={getSizeStyle()}
              >
                <Image
                  src={baseImage}
                  alt={`${productName} preview`}
                  fill
                  className="object-contain transition-all duration-500"
                  style={getColorStyle()}
                  sizes="160px"
                />
                
                {/* Scent visualization (simplified) */}
                {scent && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`
                      w-full h-full opacity-20 rounded-full animate-pulse
                      ${scent.intensity === 'light' ? 'scale-110 animate-pulse' : 
                        scent.intensity === 'medium' ? 'scale-125 animate-pulse' : 
                        'scale-150 animate-pulse'}
                    `}>
                      {/* Visual representation of scent intensity */}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Customization labels */}
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
              {scent && (
                <span className="bg-white bg-opacity-80 text-xs px-2 py-1 rounded-full">
                  {scent.name}
                </span>
              )}
              {color && (
                <span className="bg-white bg-opacity-80 text-xs px-2 py-1 rounded-full flex items-center">
                  <span 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: color.hexCode }}
                  ></span>
                  {color.name}
                </span>
              )}
              {size && (
                <span className="bg-white bg-opacity-80 text-xs px-2 py-1 rounded-full">
                  {size.name}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
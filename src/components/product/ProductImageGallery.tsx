'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { TransitionElement, GlassMorphism, TransparentOverlay } from '@/components/animation';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  
  // If no images are provided, use a placeholder
  const displayImages = images.length > 0 ? images : ['/placeholder-candle.jpg'];
  
  const handleZoom = () => {
    setIsZoomed(!isZoomed);
  };
  
  return (
    <div className="space-y-4 relative">
      {/* Main Image */}
      <div 
        className="relative h-96 w-full overflow-hidden rounded-lg cursor-pointer"
        onClick={handleZoom}
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full"
          >
            <Image
              src={displayImages[selectedImage]}
              alt={productName}
              fill
              className={`object-cover transition-transform duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            
            {/* Subtle gradient overlay for better text visibility */}
            <TransparentOverlay 
              gradientOverlay 
              gradientColors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)']} 
              gradientDirection="bottom"
              opacity={0.1}
              className="pointer-events-none"
            >
              <div />
            </TransparentOverlay>
          </motion.div>
        </AnimatePresence>
        
        {/* Zoom indicator with glass effect */}
        <GlassMorphism
          preset="button"
          className="absolute bottom-2 right-2 p-1 z-10"
          opacity={0.6}
          hoverOpacity={0.8}
          hoverEffect={true}
          hoverScale={1.1}
          borderRadius="9999px"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-700" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {isZoomed ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" 
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" 
              />
            )}
          </svg>
        </GlassMorphism>
        
        {/* Image Navigation Arrows with glass effect */}
        {displayImages.length > 1 && (
          <>
            <GlassMorphism
              preset="button"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 z-10"
              opacity={0.6}
              hoverOpacity={0.8}
              hoverEffect={true}
              hoverScale={1.1}
              borderRadius="9999px"
              onClick={(e?: React.MouseEvent) => {
                e?.stopPropagation();
                setSelectedImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-gray-700" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </GlassMorphism>
            
            <GlassMorphism
              preset="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 z-10"
              opacity={0.6}
              hoverOpacity={0.8}
              hoverEffect={true}
              hoverScale={1.1}
              borderRadius="9999px"
              onClick={(e?: React.MouseEvent) => {
                e?.stopPropagation();
                setSelectedImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-gray-700" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </GlassMorphism>
          </>
        )}
        
        {/* Image info overlay that appears on hover */}
        <AnimatePresence>
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
            >
              <GlassMorphism
                preset="overlay"
                className="p-3"
                opacity={0.2}
                blurAmount={5}
                borderRadius="0 0 0.5rem 0.5rem"
                borderWidth="0"
              >
                <p className="text-white text-sm font-medium">
                  {productName} - Image {selectedImage + 1} of {displayImages.length}
                </p>
              </GlassMorphism>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Thumbnail Gallery with glass effect */}
      {displayImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <TransitionElement key={index}>
              <GlassMorphism
                preset={selectedImage === index ? "maroon" : "light"}
                className={`relative h-20 w-20 rounded-md overflow-hidden transition-all duration-300`}
                opacity={selectedImage === index ? 0.3 : 0.1}
                hoverEffect={true}
                hoverOpacity={selectedImage === index ? 0.4 : 0.2}
                hoverScale={1.05}
                borderWidth={selectedImage === index ? "2px" : "1px"}
                borderColor={selectedImage === index ? "rgba(128, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.2)"}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </GlassMorphism>
            </TransitionElement>
          ))}
        </div>
      )}
    </div>
  );
}
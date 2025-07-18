'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FadeInSection, GlassMorphism } from '@/components/animation';
import ProductImageGallery from './ProductImageGallery';
import ProductCustomization from './ProductCustomization';
import ProductTabs from './ProductTabs';
import PriceDisplay from './PriceDisplay';
import { Product as ProductType, ScentOption, ColorOption, SizeOption } from '@/types';

interface ProductDetailProps {
  product: ProductType;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [customization, setCustomization] = useState<{
    scent?: ScentOption | null;
    color?: ColorOption | null;
    size?: SizeOption | null;
    price: number;
    isValid: boolean;
  }>({
    price: product.basePrice,
    isValid: true
  });
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleAddToCart = async () => {
    if (!customization.isValid) return;
    
    setIsAddingToCart(true);
    
    try {
      // In a real app, this would be a fetch to your API
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      // Show success message or redirect to cart
      console.log('Added to cart:', {
        product,
        customization,
        quantity: 1
      });
      
      // Here you would typically show a success toast or notification
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Here you would typically show an error toast or notification
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }
  
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="relative">
          <FadeInSection>
            <ProductImageGallery 
              images={product.images} 
              productName={product.name} 
            />
          </FadeInSection>
        </div>
        
        {/* Product Information */}
        <div className="space-y-6">
          <FadeInSection>
            <motion.div 
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <motion.div custom={0} variants={fadeInUpVariants}>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              </motion.div>
              
              <motion.div custom={1} variants={fadeInUpVariants} className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating?.average || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  {product.rating?.average.toFixed(1)} ({product.rating?.count} reviews)
                </span>
              </motion.div>
              
              <motion.div custom={2} variants={fadeInUpVariants}>
                <PriceDisplay 
                  price={customization.price} 
                  originalPrice={customization.price > product.basePrice ? product.basePrice : undefined}
                  size="large"
                  variant="sale"
                />
              </motion.div>
              
              <motion.div custom={3} variants={fadeInUpVariants} className="prose prose-sm max-w-none">
                <p>{product.description}</p>
              </motion.div>
              
              {/* Product Tabs with Glass Morphism */}
              <motion.div custom={4} variants={fadeInUpVariants}>
                <ProductTabs
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  tabs={[
                    {
                      id: 'description',
                      label: 'Description',
                      content: (
                        <div className="prose prose-sm max-w-none">
                          <p className="mb-4">{product.description}</p>
                          <p>
                            Our candles are crafted with care using premium ingredients to ensure a clean, 
                            long-lasting burn. Each candle is hand-poured in small batches to maintain quality 
                            and attention to detail.
                          </p>
                        </div>
                      )
                    },
                    {
                      id: 'features',
                      label: 'Features',
                      content: (
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                          <li>100% soy wax for a clean, long-lasting burn</li>
                          <li>Hand-poured in small batches for quality control</li>
                          <li>Premium fragrance oils for a consistent scent throw</li>
                          <li>Lead-free cotton wicks for a clean burn</li>
                          <li>Reusable and recyclable container</li>
                          <li>Approximately {product.customizationOptions?.sizes?.length || 3} sizes available</li>
                          <li>Burn time varies by size (see product details)</li>
                        </ul>
                      )
                    },
                    {
                      id: 'details',
                      label: 'Details',
                      content: (
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                          <div className="text-gray-600">Category:</div>
                          <div className="capitalize">{product.category}</div>
                          
                          <div className="text-gray-600">Featured:</div>
                          <div>{product.featured ? 'Yes' : 'No'}</div>
                          
                          <div className="text-gray-600">Tags:</div>
                          <div>
                            {product.tags?.map((tag: string, index: number) => (
                              <GlassMorphism
                                key={index}
                                preset="light"
                                className="inline-block px-2 py-1 mr-1 mb-1"
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
                          </div>
                          
                          <div className="text-gray-600">In Stock:</div>
                          <div>
                            {product.inventory?.isInStock ? (
                              <span className="text-green-600 font-medium">Yes</span>
                            ) : (
                              <span className="text-red-600 font-medium">No</span>
                            )}
                          </div>
                        </div>
                      )
                    }
                  ]}
                />
              </motion.div>
              
              {/* Customization Interface */}
              <motion.div custom={5} variants={fadeInUpVariants} className="border-t border-gray-200 pt-6">
                <ProductCustomization 
                  product={product} 
                  onCustomizationChange={setCustomization} 
                />
                
                <div className="mt-6">
                  <GlassMorphism
                    preset={customization.isValid && product.inventory?.isInStock ? "red" : "light"}
                    opacity={customization.isValid && product.inventory?.isInStock ? 0.9 : 0.5}
                    blurAmount={3}
                    borderRadius="0.5rem"
                    borderWidth="0"
                    hoverEffect={customization.isValid && product.inventory?.isInStock}
                    hoverOpacity={1}
                    hoverGlow={true}
                    glowColor="rgba(255, 0, 0, 0.4)"
                    clickEffect={customization.isValid && product.inventory?.isInStock ? "scale" : "none"}
                    onClick={customization.isValid && product.inventory?.isInStock && !isAddingToCart ? handleAddToCart : undefined}
                    className="w-full py-3 px-6 flex items-center justify-center group"
                  >
                    {isAddingToCart ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <svg
                        className="w-5 h-5 mr-2 group-hover:animate-bounce"
                        fill="none"
                        stroke={customization.isValid && product.inventory?.isInStock ? "white" : "gray"}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    )}
                    <span className={customization.isValid && product.inventory?.isInStock ? "text-white" : "text-gray-500"}>
                      {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                    </span>
                  </GlassMorphism>
                  
                  {!product.inventory?.isInStock && (
                    <GlassMorphism
                      preset="light"
                      opacity={0.7}
                      blurAmount={2}
                      borderRadius="0.25rem"
                      className="mt-2 py-1"
                    >
                      <p className="text-red-600 text-sm text-center">
                        This product is currently out of stock
                      </p>
                    </GlassMorphism>
                  )}
                  
                  {!customization.isValid && product.inventory?.isInStock && (
                    <GlassMorphism
                      preset="light"
                      opacity={0.7}
                      blurAmount={2}
                      borderRadius="0.25rem"
                      className="mt-2 py-1"
                    >
                      <p className="text-red-600 text-sm text-center">
                        Please select valid customization options
                      </p>
                    </GlassMorphism>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </FadeInSection>
        </div>
      </div>
    </div>
  );
}
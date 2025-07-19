'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeInSection, TransitionElement, StaggeredList, GlassMorphism } from '@/components/animation';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  featured: boolean;
  scents: string[];
  colors: string[];
}

interface FeaturedProductsProps {
  className?: string;
}

export const FeaturedProducts = ({ className = '' }: FeaturedProductsProps) => {
  // Mock data - in real app this would come from API
  const featuredProducts: Product[] = [
    {
      id: 1,
      name: 'Vanilla Dreams',
      description: 'A warm and comforting vanilla scented candle perfect for relaxation.',
      price: 24.99,
      image: '/placeholder-candle-1.jpg',
      featured: true,
      scents: ['Vanilla', 'Cream'],
      colors: ['White', 'Cream'],
    },
    {
      id: 2,
      name: 'Lavender Serenity',
      description: 'Calming lavender fragrance to help you unwind after a long day.',
      price: 26.99,
      image: '/placeholder-candle-2.jpg',
      featured: true,
      scents: ['Lavender', 'Chamomile'],
      colors: ['Purple', 'White'],
    },
    {
      id: 3,
      name: 'Cinnamon Spice',
      description: 'Warm cinnamon and spice blend for cozy autumn evenings.',
      price: 25.99,
      image: '/placeholder-candle-3.jpg',
      featured: true,
      scents: ['Cinnamon', 'Clove'],
      colors: ['Red', 'Brown'],
    },
    {
      id: 4,
      name: 'Ocean Breeze',
      description: 'Fresh ocean scent that brings the seaside to your home.',
      price: 23.99,
      image: '/placeholder-candle-4.jpg',
      featured: true,
      scents: ['Ocean', 'Sea Salt'],
      colors: ['Blue', 'White'],
    },
    {
      id: 5,
      name: 'Citrus Sunshine',
      description: 'Bright and energizing citrus blend to refresh your space.',
      price: 22.99,
      image: '/placeholder-candle-5.jpg',
      featured: true,
      scents: ['Orange', 'Lemon'],
      colors: ['Orange', 'Yellow'],
    },
    {
      id: 6,
      name: 'Forest Pine',
      description: 'Crisp pine scent that brings the outdoors into your home.',
      price: 27.99,
      image: '/placeholder-candle-6.jpg',
      featured: true,
      scents: ['Pine', 'Cedar'],
      colors: ['Green', 'Brown'],
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(featuredProducts.length / itemsPerSlide);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoplay, totalSlides]);

  // Pause autoplay when user interacts with carousel
  const handleManualNavigation = (index: number) => {
    setAutoplay(false);
    setCurrentSlide(index);
    
    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => setAutoplay(true), 10000);
  };

  const nextSlide = () => {
    handleManualNavigation((currentSlide + 1) % totalSlides);
  };

  const prevSlide = () => {
    handleManualNavigation((currentSlide - 1 + totalSlides) % totalSlides);
  };

  const getCurrentProducts = () => {
    const start = currentSlide * itemsPerSlide;
    return featuredProducts.slice(start, start + itemsPerSlide);
  };

  // Animation variants for section title
  const _titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <section className={`py-16 bg-neutral-light ${className}`}>
      <div className="container-custom">
        {/* Section Header */}
        <FadeInSection delay={0.1} duration={0.6} staggerChildren={true} staggerDelay={0.15}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-neutral-dark max-w-2xl mx-auto">
              Discover our most popular handcrafted candles, each one carefully 
              made with premium materials and unique scent combinations.
            </p>
          </div>
        </FadeInSection>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mb-8">
            <TransitionElement 
              hoverScale={1.1} 
              hoverElevation={true}
              glowEffect={true}
              glowColor="maroon"
            >
              <button
                onClick={prevSlide}
                className="p-3 rounded-full bg-primary shadow-custom hover:shadow-custom-hover text-neutral-dark hover:text-secondary transition-colors duration-300"
                aria-label="Previous products"
              >
                <motion.svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  whileHover={{ x: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </motion.svg>
              </button>
            </TransitionElement>

            {/* Slide Indicators */}
            <div className="flex space-x-3">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleManualNavigation(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-secondary w-6' : 'bg-neutral-dark bg-opacity-30'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <TransitionElement 
              hoverScale={1.1} 
              hoverElevation={true}
              glowEffect={true}
              glowColor="maroon"
            >
              <button
                onClick={nextSlide}
                className="p-3 rounded-full bg-primary shadow-custom hover:shadow-custom-hover text-neutral-dark hover:text-secondary transition-colors duration-300"
                aria-label="Next products"
              >
                <motion.svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </motion.svg>
              </button>
            </TransitionElement>
          </div>

          {/* Products Grid */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="pb-4"
              >
                <StaggeredList
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  staggerDelay={0.1}
                >
                  {getCurrentProducts().map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </StaggeredList>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* View All Products Link */}
        <FadeInSection delay={0.4}>
          <div className="text-center mt-12">
            <TransitionElement 
              hoverScale={1.05} 
              glowEffect={true}
              glowColor="maroon"
              hoverElevation={true}
            >
              <Link
                href="/products"
                className="btn btn-primary px-8 py-3 text-lg font-semibold inline-flex items-center gap-2"
              >
                <span>View All Products</span>
                <motion.svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </motion.svg>
              </Link>
            </TransitionElement>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

// Product Card Component
interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Animation for the "Add to Cart" button
  const [isHovered, setIsHovered] = useState(false);
  
  // Get color for candle based on product colors
  const getCandleColor = () => {
    const mainColor = product.colors[0].toLowerCase();
    switch (mainColor) {
      case 'white': return 'bg-white';
      case 'cream': return 'bg-amber-50';
      case 'purple': return 'bg-purple-700';
      case 'red': return 'bg-red-600';
      case 'brown': return 'bg-amber-800';
      case 'blue': return 'bg-blue-600';
      case 'orange': return 'bg-orange-500';
      case 'yellow': return 'bg-yellow-400';
      case 'green': return 'bg-green-600';
      default: return 'bg-accent';
    }
  };

  return (
    <GlassMorphism
      opacity={0.9}
      blurAmount={5}
      hoverEffect={true}
      hoverOpacity={1}
      borderRadius="0.75rem"
      className="h-full p-6"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        {/* Product Image */}
        <div className="relative h-48 mb-4 rounded-lg bg-gradient-to-br from-neutral-light to-white overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Candle illustration */}
            <div className="text-center">
              <motion.div 
                className={`w-16 h-20 ${getCandleColor()} rounded-t-full mx-auto mb-2 relative`}
                animate={{ 
                  boxShadow: isHovered 
                    ? ['0 0 0px rgba(128, 0, 0, 0)', '0 0 15px rgba(128, 0, 0, 0.3)', '0 0 0px rgba(128, 0, 0, 0)'] 
                    : 'none'
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                {/* Candle flame */}
                <motion.div 
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2"
                  animate={{ 
                    y: [-1, 1, -1],
                    scale: isHovered ? [1, 1.3, 1] : [1, 1.1, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <div className="w-2 h-3 bg-gradient-to-t from-secondary to-yellow-400 rounded-full animate-pulse"></div>
                </motion.div>
              </motion.div>
              <motion.div 
                className="text-xs text-neutral-dark"
                animate={{ opacity: isHovered ? 1 : 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {product.name}
              </motion.div>
            </div>
          </div>
          
          {/* Featured badge */}
          {product.featured && (
            <motion.div 
              className="absolute top-2 right-2 bg-secondary text-primary text-xs px-2 py-1 rounded-full font-semibold"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Featured
            </motion.div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col">
          <motion.h3 
            className="text-xl font-semibold mb-2 text-neutral-dark"
            animate={{ color: isHovered ? '#800000' : '#333333' }}
            transition={{ duration: 0.3 }}
          >
            {product.name}
          </motion.h3>
          
          <p className="text-neutral-dark text-sm mb-4 flex-1">
            {product.description}
          </p>

          {/* Scents and Colors */}
          <div className="mb-4 space-y-2">
            <div className="flex flex-wrap gap-1">
              {product.scents.map((scent) => (
                <TransitionElement 
                  key={scent}
                  hoverScale={1.1}
                  hoverOpacity={1}
                >
                  <span
                    className="text-xs bg-neutral-light px-2 py-1 rounded-full text-neutral-dark"
                  >
                    {scent}
                  </span>
                </TransitionElement>
              ))}
            </div>
            <div className="flex gap-1">
              {product.colors.map((color) => (
                <TransitionElement 
                  key={color}
                  hoverScale={1.2}
                  hoverElevation={true}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-neutral-dark border-opacity-20"
                    style={{ 
                      backgroundColor: color.toLowerCase() === 'white' ? '#FFFFFF' : 
                                     color.toLowerCase() === 'cream' ? '#F5F5DC' :
                                     color.toLowerCase() === 'purple' ? '#800080' :
                                     color.toLowerCase() === 'red' ? '#FF0000' :
                                     color.toLowerCase() === 'brown' ? '#8B4513' :
                                     color.toLowerCase() === 'blue' ? '#0000FF' :
                                     color.toLowerCase() === 'orange' ? '#FFA500' :
                                     color.toLowerCase() === 'yellow' ? '#FFFF00' :
                                     color.toLowerCase() === 'green' ? '#008000' : '#CCCCCC'
                    }}
                    title={color}
                  />
                </TransitionElement>
              ))}
            </div>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex justify-between items-center">
            <motion.span 
              className="text-2xl font-bold text-secondary"
              animate={{ 
                scale: isHovered ? 1.05 : 1,
                textShadow: isHovered ? '0 0 8px rgba(255, 0, 0, 0.3)' : 'none'
              }}
              transition={{ duration: 0.3 }}
            >
              ${product.price}
            </motion.span>
            <TransitionElement
              hoverScale={1.1}
              hoverElevation={true}
              glowEffect={true}
              glowColor="red"
            >
              <button className="btn btn-primary text-sm px-4 py-2 flex items-center gap-1">
                <span>Add to Cart</span>
                <motion.svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: isHovered ? Infinity : 0, duration: 0.8 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </motion.svg>
              </button>
            </TransitionElement>
          </div>
        </div>
      </div>
    </GlassMorphism>
  );
};

export default FeaturedProducts;
import React from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { StaggeredGrid } from '@/components/animation';
import { useInView } from 'react-intersection-observer';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
  prioritizeFirst?: boolean;
  animationPattern?: 'wave' | 'rows' | 'columns' | 'random';
}

/**
 * ProductGrid component displays a grid of products with enhanced staggered animations
 */
const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  columns = 3,
  prioritizeFirst = true,
  animationPattern = 'wave',
}) => {
  // Determine grid columns class based on props
  const gridColumnsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  // Use intersection observer for triggering animations
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '50px 0px',
  });

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Loading skeleton with staggered animation
  if (loading) {
    return (
      <motion.div
        ref={ref}
        className={`grid ${gridColumnsClass} gap-6`}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-gray-100 rounded-lg overflow-hidden"
          >
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // No products found
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
      </motion.div>
    );
  }

  // Render product grid with enhanced staggered animations using StaggeredGrid component
  return (
    <StaggeredGrid
      columns={columns}
      pattern={animationPattern}
      className={`grid ${gridColumnsClass} gap-6`}
      itemClassName="h-full"
      staggerDelay={0.05}
      duration={0.5}
      initialScale={0.95}
      distance={20}
    >
      {products.map((product, index) => (
        <ProductCard 
          key={product.id}
          product={product} 
          priority={prioritizeFirst && index === 0} 
        />
      ))}
    </StaggeredGrid>
  );
};

export default ProductGrid;
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';

interface StaggeredGridProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  columns?: number;
  staggerDelay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
  pattern?: 'wave' | 'rows' | 'columns' | 'random';
  initialScale?: number;
  initialOpacity?: number;
  distance?: number;
}

/**
 * Component that creates a staggered animation effect for grid layouts
 * Items appear in a wave-like pattern or other configurable patterns
 * 
 * @example
 * // Basic usage with wave pattern (diagonal animation)
 * <StaggeredGrid columns={3}>
 *   {items.map(item => <YourItemComponent key={item.id} item={item} />)}
 * </StaggeredGrid>
 * 
 * @example
 * // Row by row animation
 * <StaggeredGrid columns={4} pattern="rows">
 *   {items.map(item => <YourItemComponent key={item.id} item={item} />)}
 * </StaggeredGrid>
 */
const StaggeredGrid = ({
  children,
  className = '',
  itemClassName = '',
  columns = 3,
  staggerDelay = 0.05,
  duration = 0.5,
  threshold = 0.1,
  triggerOnce = true,
  rootMargin = '0px',
  pattern = 'wave',
  initialScale = 0.95,
  initialOpacity = 0,
  distance = 20,
}: StaggeredGridProps) => {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
    rootMargin,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const baseItemVariants = {
    hidden: {
      opacity: initialOpacity,
      y: distance,
      scale: initialScale,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const getStaggeredChildren = () => {
    const items = Array.isArray(children) ? children : [children];
    const itemCount = items.length;
    
    return items.map((child, index) => {
      let customDelay = 0;
      
      // Calculate position in the grid
      const row = Math.floor(index / columns);
      const col = index % columns;
      
      // Apply different stagger patterns
      switch (pattern) {
        case 'wave':
          // Diagonal wave pattern (top-left to bottom-right)
          customDelay = (row + col) * staggerDelay;
          break;
        case 'rows':
          // Row by row animation
          customDelay = row * staggerDelay;
          break;
        case 'columns':
          // Column by column animation
          customDelay = col * staggerDelay;
          break;
        case 'random':
          // Random stagger effect
          customDelay = Math.random() * (itemCount * staggerDelay * 0.5);
          break;
        default:
          customDelay = index * staggerDelay;
      }
      
      return (
        <motion.div
          key={index}
          className={itemClassName}
          variants={{
            ...baseItemVariants,
            visible: {
              ...baseItemVariants.visible,
              transition: {
                ...baseItemVariants.visible.transition,
                delay: customDelay,
              },
            },
          }}
        >
          {child}
        </motion.div>
      );
    });
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {getStaggeredChildren()}
    </motion.div>
  );
};

export default StaggeredGrid;
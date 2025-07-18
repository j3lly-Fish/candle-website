import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';

interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'grid';
  distance?: number;
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
  childClassName?: string;
  childTag?: 'div' | 'li';
  delayStart?: number;
  easing?: [number, number, number, number];
  staggerDirection?: 'forward' | 'reverse' | 'alternate';
  onViewportEnter?: () => void;
  onViewportLeave?: () => void;
  // Hover effect props
  hoverEffect?: 'none' | 'scale' | 'lift' | 'glow' | 'border' | 'color-shift';
  hoverScale?: number;
  hoverLift?: number;
  glowColor?: string;
  borderColor?: string;
  colorShiftTo?: string;
  // Click effect props
  clickEffect?: 'none' | 'scale' | 'ripple';
  clickScale?: number;
}

/**
 * Enhanced component that animates a list of items with staggered timing
 * Perfect for product grids, feature lists, etc.
 * 
 * @example
 * // Basic usage
 * <StaggeredList>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </StaggeredList>
 * 
 * @example
 * // Grid staggering (items appear in a grid pattern)
 * <StaggeredList direction="grid" staggerDirection="alternate">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 *   <div>Item 4</div>
 * </StaggeredList>
 */
export const StaggeredList = ({
  children,
  className = '',
  staggerDelay = 0.1,
  duration = 0.5,
  direction = 'up',
  distance = 20,
  threshold = 0.1,
  triggerOnce = true,
  rootMargin = '0px',
  childClassName = '',
  childTag = 'div',
  delayStart = 0,
  easing = [0.4, 0, 0.2, 1],
  staggerDirection = 'forward',
  onViewportEnter,
  onViewportLeave,
  // Hover effect props
  hoverEffect = 'none',
  hoverScale = 1.03,
  hoverLift = -5,
  glowColor = 'rgba(128, 0, 0, 0.3)', // Maroon with transparency
  borderColor = '#800000', // Maroon
  colorShiftTo = '#FF0000', // Red
  // Click effect props
  clickEffect = 'none',
  clickScale = 0.97,
}: StaggeredListProps) => {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
    rootMargin,
    onChange: (inView) => {
      if (inView && onViewportEnter) onViewportEnter();
      if (!inView && onViewportLeave) onViewportLeave();
    }
  });

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { x: 0, y: distance };
      case 'down':
        return { x: 0, y: -distance };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      case 'grid':
        return { scale: 0.9, y: distance / 2 };
      default:
        return { x: 0, y: distance };
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayStart,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      ...getInitialPosition(),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: direction === 'grid' ? 1 : undefined,
      transition: {
        duration,
        ease: easing,
      },
    },
  };

  // Get hover animation based on hoverEffect
  const getHoverAnimation = () => {
    if (hoverEffect === 'none') return {};
    
    switch (hoverEffect) {
      case 'scale':
        return { scale: hoverScale };
      case 'lift':
        return { y: hoverLift };
      case 'glow':
        return { 
          boxShadow: `0 0 15px ${glowColor}`,
          filter: 'brightness(1.05)'
        };
      case 'border':
        return { 
          boxShadow: `inset 0 0 0 2px ${borderColor}`,
        };
      case 'color-shift':
        return { 
          color: colorShiftTo,
        };
      default:
        return {};
    }
  };

  // Get click/tap animation based on clickEffect
  const getClickAnimation = () => {
    if (clickEffect === 'none') return {};
    
    switch (clickEffect) {
      case 'scale':
        return { scale: clickScale };
      case 'ripple':
        return { 
          scale: clickScale,
          opacity: 0.9,
          transition: { duration: 0.1 }
        };
      default:
        return {};
    }
  };

  // Apply different stagger order based on staggerDirection
  const getStaggeredChildren = () => {
    const items = Array.isArray(children) ? children : [children];
    
    // Create a motion component with hover and click effects
    const createMotionItem = (child: ReactNode, index: number, customVariants?: any) => {
      return (
        <motion.div 
          key={index} 
          variants={customVariants || itemVariants} 
          className={childClassName}
          whileHover={hoverEffect !== 'none' ? getHoverAnimation() : {}}
          whileTap={clickEffect !== 'none' ? getClickAnimation() : {}}
          transition={{ 
            duration: 0.2,
            ease: easing,
          }}
        >
          {child}
        </motion.div>
      );
    };
    
    if (staggerDirection === 'reverse') {
      return [...items].reverse().map((child, index) => createMotionItem(child, index));
    }
    
    if (staggerDirection === 'alternate') {
      // For grid-like staggering, alternate items appear in a wave pattern
      const itemCount = items.length;
      const gridSize = Math.ceil(Math.sqrt(itemCount)); // Approximate grid dimensions
      
      return items.map((child, index) => {
        // Calculate grid position (row, col)
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        
        // Custom delay based on position in grid (creates a diagonal wave effect)
        const customDelay = (row + col) * staggerDelay;
        
        const customVariants = {
          ...itemVariants,
          visible: {
            ...itemVariants.visible,
            transition: {
              ...itemVariants.visible.transition,
              delay: customDelay,
            }
          }
        };
        
        return createMotionItem(child, index, customVariants);
      });
    }
    
    // Default forward direction
    return items.map((child, index) => createMotionItem(child, index));
  };

  const ChildTag = childTag === 'li' ? motion.li : motion.div;

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {getStaggeredChildren()}
    </motion.div>
  );
};

export default StaggeredList;
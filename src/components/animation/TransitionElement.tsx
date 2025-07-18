import { motion, MotionProps, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface TransitionElementProps extends MotionProps {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
  hoverElevation?: boolean;
  hoverOpacity?: number;
  hoverRotation?: number;
  duration?: number;
  tapScale?: number;
  enableTap?: boolean;
  glowEffect?: boolean;
  glowColor?: 'red' | 'maroon' | 'white' | string;
  transparencyEffect?: boolean;
  transparencyLevel?: number;
  shadowEffect?: 'none' | 'light' | 'medium' | 'strong';
  colorShift?: boolean;
  colorShiftTo?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'none';
  isVisible?: boolean;
}

/**
 * Component that adds hover and interaction animations to any element
 * Supports scaling, elevation, opacity changes, rotation, and glow effects
 * 
 * @example
 * // Basic usage
 * <TransitionElement>
 *   <button>Hover me</button>
 * </TransitionElement>
 * 
 * @example
 * // With glow effect
 * <TransitionElement glowEffect glowColor="maroon">
 *   <div>Product card</div>
 * </TransitionElement>
 * 
 * @example
 * // With transparency effect
 * <TransitionElement transparencyEffect transparencyLevel={0.8}>
 *   <div>Glass card</div>
 * </TransitionElement>
 */
export const TransitionElement = ({
  children,
  className = '',
  hoverScale = 1.05,
  hoverElevation = true,
  hoverOpacity,
  hoverRotation = 0,
  duration = 0.15,
  tapScale = 0.95,
  enableTap = true,
  glowEffect = false,
  glowColor = 'red',
  transparencyEffect = false,
  transparencyLevel = 0.9,
  shadowEffect = 'medium',
  colorShift = false,
  colorShiftTo = '#800000', // Maroon as default color shift target
  animation = 'none',
  isVisible = true,
  ...motionProps
}: TransitionElementProps) => {
  // Convert glowColor to rgba
  const getGlowColor = () => {
    if (glowColor === 'red') return 'rgba(255, 0, 0, 0.3)';
    if (glowColor === 'maroon') return 'rgba(128, 0, 0, 0.3)';
    if (glowColor === 'white') return 'rgba(255, 255, 255, 0.5)';
    return glowColor; // Use custom color if provided
  };

  // Get shadow based on shadowEffect level
  const getShadow = () => {
    switch (shadowEffect) {
      case 'none': return '';
      case 'light': return '0 4px 6px rgba(0, 0, 0, 0.1)';
      case 'medium': return '0 6px 12px rgba(0, 0, 0, 0.15)';
      case 'strong': return '0 10px 25px rgba(0, 0, 0, 0.2)';
      default: return '0 6px 12px rgba(0, 0, 0, 0.15)';
    }
  };

  // Base styles that apply before any hover
  const baseStyles = {
    ...(transparencyEffect && { 
      backgroundColor: `rgba(255, 255, 255, ${transparencyLevel})`,
      backdropFilter: 'blur(5px)',
    }),
    ...(shadowEffect !== 'none' && { boxShadow: getShadow() }),
  };

  // Styles that apply on hover
  const hoverStyles = {
    scale: hoverScale,
    ...(hoverElevation && { y: -5 }),
    ...(hoverOpacity !== undefined && { opacity: hoverOpacity }),
    ...(hoverRotation !== 0 && { rotate: hoverRotation }),
    ...(glowEffect && { 
      boxShadow: `0 0 20px ${getGlowColor()}`,
      filter: 'brightness(1.1)'
    }),
    ...(transparencyEffect && { 
      backgroundColor: 'rgba(255, 255, 255, 1)',
    }),
    ...(colorShift && {
      color: colorShiftTo,
      borderColor: colorShiftTo,
    }),
    ...(shadowEffect !== 'none' && { 
      boxShadow: shadowEffect === 'strong' 
        ? '0 14px 28px rgba(0, 0, 0, 0.25)' 
        : '0 10px 20px rgba(0, 0, 0, 0.2)' 
    }),
  };

  const tapStyles = enableTap ? {
    scale: tapScale,
    boxShadow: 'none',
  } : {};

  // Combine className with potential transparency class
  const combinedClassName = `${className} ${transparencyEffect ? 'transparency-effect' : ''}`;

  // Animation variants based on the animation prop
  const getAnimationVariants = () => {
    switch (animation) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
          exit: { opacity: 0 }
        };
      case 'slide':
        return {
          hidden: { x: -20, opacity: 0 },
          visible: { x: 0, opacity: 1 },
          exit: { x: 20, opacity: 0 }
        };
      case 'scale':
        return {
          hidden: { scale: 0.8, opacity: 0 },
          visible: { scale: 1, opacity: 1 },
          exit: { scale: 0.8, opacity: 0 }
        };
      default:
        return {
          hidden: {},
          visible: {},
          exit: {}
        };
    }
  };

  // Get animation transition settings
  const getAnimationTransition = () => {
    return {
      duration: animation !== 'none' ? 0.3 : duration,
      ease: [0.4, 0, 0.2, 1]
    };
  };

  // If using animation and visibility control
  if (animation !== 'none') {
    return (
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            className={combinedClassName}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={getAnimationVariants()}
            transition={getAnimationTransition()}
            whileHover={hoverStyles}
            whileTap={tapStyles}
            {...motionProps}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Default behavior without animation/visibility control
  return (
    <motion.div
      className={combinedClassName}
      initial={baseStyles}
      whileHover={hoverStyles}
      whileTap={tapStyles}
      transition={{ 
        duration, 
        ease: [0.4, 0, 0.2, 1], // Match the cubic-bezier from design doc
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export default TransitionElement;
import React, { ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';
import GlassMorphism from './GlassMorphism';

interface TransparentOverlayProps extends MotionProps {
  children: ReactNode;
  className?: string;
  opacity?: number;
  blurAmount?: number;
  showOnHover?: boolean;
  gradientOverlay?: boolean;
  gradientColors?: string[];
  gradientDirection?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onClick?: () => void;
}

/**
 * TransparentOverlay component creates a transparent overlay effect for images and content
 * Perfect for product images, cards, and hover effects
 * 
 * @example
 * // Basic usage
 * <TransparentOverlay>
 *   <div>Content with overlay</div>
 * </TransparentOverlay>
 * 
 * @example
 * // With gradient overlay
 * <TransparentOverlay 
 *   gradientOverlay 
 *   gradientColors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']} 
 *   gradientDirection="bottom"
 * >
 *   <div>Content with gradient overlay</div>
 * </TransparentOverlay>
 */
const TransparentOverlay: React.FC<TransparentOverlayProps> = ({
  children,
  className = '',
  opacity = 0.3,
  blurAmount = 0,
  showOnHover = false,
  gradientOverlay = false,
  gradientColors = ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)'],
  gradientDirection = 'bottom',
  onClick,
  ...motionProps
}) => {
  // Convert direction to CSS gradient direction
  const getGradientDirection = () => {
    switch (gradientDirection) {
      case 'top': return 'to top';
      case 'bottom': return 'to bottom';
      case 'left': return 'to left';
      case 'right': return 'to right';
      case 'top-left': return 'to top left';
      case 'top-right': return 'to top right';
      case 'bottom-left': return 'to bottom left';
      case 'bottom-right': return 'to bottom right';
      default: return 'to bottom';
    }
  };

  // Create gradient style
  const gradientStyle = gradientOverlay 
    ? { 
        background: `linear-gradient(${getGradientDirection()}, ${gradientColors.join(', ')})`,
        backdropFilter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
        WebkitBackdropFilter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
      }
    : {
        backgroundColor: `rgba(0, 0, 0, ${opacity})`,
        backdropFilter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
        WebkitBackdropFilter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
      };

  // Animation variants
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    hover: { opacity: 1 }
  };

  return (
    <motion.div
      className={`absolute inset-0 transition-opacity duration-300 ${className}`}
      style={gradientStyle}
      initial={showOnHover ? "hidden" : "visible"}
      whileHover={showOnHover ? "hover" : undefined}
      variants={variants}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export default TransparentOverlay;
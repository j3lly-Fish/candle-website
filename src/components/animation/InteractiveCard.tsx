import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: 'scale' | 'lift' | 'glow' | 'color-shift' | 'border' | 'multiple' | 'none';
  clickEffect?: 'ripple' | 'scale' | 'none';
  glowColor?: string;
  colorShiftTo?: string;
  borderColor?: string;
  transparencyEffect?: boolean;
  transparencyLevel?: number;
  shadowEffect?: 'none' | 'light' | 'medium' | 'strong';
  hoverShadowEffect?: 'none' | 'light' | 'medium' | 'strong';
  duration?: number;
  disabled?: boolean;
  as?: React.ElementType;
}

/**
 * Interactive card component with hover and interaction animations
 * 
 * @example
 * // Basic usage
 * <InteractiveCard>
 *   <div>Card content</div>
 * </InteractiveCard>
 * 
 * @example
 * // With hover and click effects
 * <InteractiveCard 
 *   hoverEffect="multiple" 
 *   clickEffect="scale"
 *   glowColor="rgba(255, 0, 0, 0.3)"
 *   shadowEffect="medium"
 *   hoverShadowEffect="strong"
 * >
 *   <div>Card with multiple effects</div>
 * </InteractiveCard>
 */
export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = 'scale',
  clickEffect = 'scale',
  glowColor = 'rgba(128, 0, 0, 0.3)', // Maroon with transparency
  colorShiftTo = '#FF0000', // Red
  borderColor = '#800000', // Maroon
  transparencyEffect = false,
  transparencyLevel = 0.9,
  shadowEffect = 'medium',
  hoverShadowEffect = 'strong',
  duration = 0.2,
  disabled = false,
  as: _as = 'div',
}) => {
  // Get shadow based on shadowEffect level
  const getShadow = (effect: 'none' | 'light' | 'medium' | 'strong') => {
    switch (effect) {
      case 'none': return 'none';
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
      WebkitBackdropFilter: 'blur(5px)',
    }),
    ...(shadowEffect !== 'none' && { boxShadow: getShadow(shadowEffect) }),
    cursor: disabled ? 'default' : onClick ? 'pointer' : 'default',
  };

  // Hover animation variants
  const getHoverAnimation = () => {
    if (disabled) return {};
    
    switch (hoverEffect) {
      case 'scale':
        return { scale: 1.03 };
      case 'lift':
        return { y: -5 };
      case 'glow':
        return { 
          boxShadow: `0 0 20px ${glowColor}`,
          filter: 'brightness(1.05)'
        };
      case 'color-shift':
        return { 
          backgroundColor: colorShiftTo,
          color: '#FFFFFF'
        };
      case 'border':
        return { 
          boxShadow: `inset 0 0 0 2px ${borderColor}`,
        };
      case 'multiple':
        return { 
          scale: 1.02,
          y: -3,
          boxShadow: getShadow(hoverShadowEffect),
          filter: 'brightness(1.03)'
        };
      case 'none':
        return {};
      default:
        return { scale: 1.03 };
    }
  };

  // Click/tap animation variants
  const getTapAnimation = () => {
    if (disabled) return {};
    
    switch (clickEffect) {
      case 'ripple':
        return { 
          scale: 0.98,
          opacity: 0.9,
          transition: { duration: 0.1 }
        };
      case 'scale':
        return { scale: 0.97 };
      case 'none':
        return {};
      default:
        return { scale: 0.97 };
    }
  };

  return (
    <motion.div
      className={`transition-all ${className}`}
      style={baseStyles}
      whileHover={getHoverAnimation()}
      whileTap={onClick ? getTapAnimation() : {}}
      onClick={disabled ? undefined : onClick}
      transition={{ 
        duration,
        ease: [0.4, 0, 0.2, 1], // Match the cubic-bezier from design doc
      }}
    >
      {children}
    </motion.div>
  );
};

export default InteractiveCard;
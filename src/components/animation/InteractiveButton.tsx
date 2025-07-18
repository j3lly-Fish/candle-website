import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface InteractiveButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  feedbackType?: 'ripple' | 'scale' | 'glow' | 'none';
  hoverEffect?: 'scale' | 'lift' | 'glow' | 'color-shift' | 'none';
  glowColor?: string;
  colorShiftTo?: string;
}

/**
 * Interactive button component with hover and interaction animations
 * 
 * @example
 * // Basic usage
 * <InteractiveButton>Click me</InteractiveButton>
 * 
 * @example
 * // With hover and feedback effects
 * <InteractiveButton 
 *   variant="primary" 
 *   hoverEffect="glow" 
 *   feedbackType="ripple"
 * >
 *   Submit
 * </InteractiveButton>
 */
export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  loading = false,
  type = 'button',
  ariaLabel,
  feedbackType = 'scale',
  hoverEffect = 'scale',
  glowColor = 'rgba(128, 0, 0, 0.5)', // Maroon with transparency
  colorShiftTo = '#FF0000', // Red
}) => {
  // Base button styles based on variant
  const getBaseStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-maroon text-white border-transparent hover:bg-red-800';
      case 'secondary':
        return 'bg-white text-maroon border border-maroon hover:bg-gray-50';
      case 'outline':
        return 'bg-transparent text-maroon border border-maroon hover:bg-maroon/5';
      case 'text':
        return 'bg-transparent text-maroon border-transparent hover:bg-maroon/5';
      default:
        return 'bg-maroon text-white border-transparent hover:bg-red-800';
    }
  };

  // Size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'py-1 px-3 text-sm';
      case 'medium':
        return 'py-2 px-4 text-base';
      case 'large':
        return 'py-3 px-6 text-lg';
      default:
        return 'py-2 px-4 text-base';
    }
  };

  // Hover animation variants
  const getHoverAnimation = () => {
    switch (hoverEffect) {
      case 'scale':
        return { scale: 1.05 };
      case 'lift':
        return { y: -3 };
      case 'glow':
        return { boxShadow: `0 0 15px ${glowColor}` };
      case 'color-shift':
        return variant === 'primary' 
          ? { backgroundColor: colorShiftTo } 
          : { color: colorShiftTo, borderColor: colorShiftTo };
      case 'none':
        return {};
      default:
        return { scale: 1.05 };
    }
  };

  // Tap/feedback animation variants
  const getTapAnimation = () => {
    switch (feedbackType) {
      case 'ripple':
        return { 
          scale: 0.98,
          backgroundColor: variant === 'primary' ? '#800000' : 'rgba(128, 0, 0, 0.1)'
        };
      case 'scale':
        return { scale: 0.95 };
      case 'glow':
        return { 
          boxShadow: `0 0 5px ${glowColor}`,
          scale: 0.98
        };
      case 'none':
        return {};
      default:
        return { scale: 0.95 };
    }
  };

  // Combined class names
  const buttonClasses = `
    ${getBaseStyles()} 
    ${getSizeStyles()} 
    ${fullWidth ? 'w-full' : ''} 
    rounded-md font-medium transition-all duration-200 
    flex items-center justify-center
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
    ${className}
  `.trim();

  return (
    <motion.button
      onClick={onClick}
      className={buttonClasses}
      disabled={disabled || loading}
      type={type}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      whileHover={!disabled && !loading ? getHoverAnimation() : {}}
      whileTap={!disabled && !loading ? getTapAnimation() : {}}
      transition={{ 
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1], // Match the cubic-bezier from design doc
      }}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default InteractiveButton;
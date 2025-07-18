import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassMorphismProps extends MotionProps {
  children: ReactNode;
  className?: string;
  opacity?: number;
  blurAmount?: number;
  borderOpacity?: number;
  hoverEffect?: boolean;
  hoverOpacity?: number;
  hoverBlurAmount?: number;
  hoverScale?: number;
  hoverRotate?: number;
  hoverElevation?: boolean;
  hoverGlow?: boolean;
  glowColor?: string;
  hoverColorShift?: boolean;
  colorShiftTo?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  boxShadow?: string;
  clickEffect?: 'none' | 'scale' | 'ripple';
  clickScale?: number;
  onClick?: () => void;
  preset?: 'default' | 'light' | 'dark' | 'frosted' | 'maroon' | 'red' | 'card' | 'overlay' | 'button' | 'tooltip';
  backgroundImage?: string;
  backgroundGradient?: boolean;
  gradientColors?: string[];
  as?: React.ElementType;
}

/**
 * Component that creates a glass morphism effect with customizable properties
 * Perfect for cards, modals, and other UI elements that need a modern glass look
 * 
 * @example
 * // Basic usage
 * <GlassMorphism>
 *   <div>Content with glass effect</div>
 * </GlassMorphism>
 * 
 * @example
 * // With hover effect
 * <GlassMorphism hoverEffect hoverOpacity={1} hoverScale={1.03}>
 *   <div>Hover me for effect</div>
 * </GlassMorphism>
 * 
 * @example
 * // Using a preset
 * <GlassMorphism preset="frosted">
 *   <div>Frosted glass effect</div>
 * </GlassMorphism>
 * 
 * @example
 * // Custom styling
 * <GlassMorphism 
 *   opacity={0.7} 
 *   blurAmount={8} 
 *   borderRadius="1rem"
 *   boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.2)"
 * >
 *   <div>Custom glass card</div>
 * </GlassMorphism>
 */
export const GlassMorphism = ({
  children,
  className = '',
  opacity,
  blurAmount,
  borderOpacity,
  hoverEffect,
  hoverOpacity,
  hoverBlurAmount,
  hoverScale,
  hoverRotate,
  hoverElevation,
  hoverGlow,
  glowColor,
  hoverColorShift,
  colorShiftTo,
  borderRadius,
  borderWidth,
  borderColor,
  boxShadow,
  clickEffect,
  clickScale,
  onClick,
  preset = 'default',
  backgroundImage,
  backgroundGradient = false,
  gradientColors,
  as = 'div',
  ...motionProps
}: GlassMorphismProps) => {
  // Define preset configurations
  const presets = {
    default: {
      opacity: 0.7,
      blurAmount: 10,
      borderOpacity: 0.2,
      hoverEffect: false,
      hoverOpacity: 0.9,
      hoverBlurAmount: 15,
      hoverScale: 1.02,
      hoverRotate: 0,
      hoverElevation: false,
      hoverGlow: false,
      glowColor: 'rgba(255, 255, 255, 0.5)',
      hoverColorShift: false,
      colorShiftTo: 'rgba(255, 0, 0, 0.1)',
      borderRadius: '0.5rem',
      borderWidth: '1px',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
      clickEffect: 'none',
      clickScale: 0.98,
    },
    light: {
      opacity: 0.5,
      blurAmount: 8,
      borderOpacity: 0.15,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.05)',
    },
    dark: {
      opacity: 0.2,
      blurAmount: 12,
      borderOpacity: 0.1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
    },
    frosted: {
      opacity: 0.3,
      blurAmount: 20,
      borderOpacity: 0.1,
      borderColor: 'rgba(255, 255, 255, 0.4)',
      boxShadow: '0 4px 16px 0 rgba(255, 255, 255, 0.1)',
      hoverEffect: true,
      hoverOpacity: 0.4,
      hoverBlurAmount: 25,
    },
    maroon: {
      opacity: 0.2,
      blurAmount: 10,
      borderOpacity: 0.2,
      borderColor: 'rgba(128, 0, 0, 0.3)',
      colorShiftTo: 'rgba(128, 0, 0, 0.3)',
      hoverColorShift: true,
      glowColor: 'rgba(128, 0, 0, 0.3)',
      hoverGlow: true,
    },
    red: {
      opacity: 0.2,
      blurAmount: 10,
      borderOpacity: 0.2,
      borderColor: 'rgba(255, 0, 0, 0.3)',
      colorShiftTo: 'rgba(255, 0, 0, 0.3)',
      hoverColorShift: true,
      glowColor: 'rgba(255, 0, 0, 0.3)',
      hoverGlow: true,
    },
    card: {
      opacity: 0.8,
      blurAmount: 12,
      borderOpacity: 0.2,
      borderRadius: '1rem',
      boxShadow: '0 10px 30px 0 rgba(31, 38, 135, 0.15)',
      hoverEffect: true,
      hoverScale: 1.02,
      hoverElevation: true,
    },
    overlay: {
      opacity: 0.15,
      blurAmount: 8,
      borderOpacity: 0,
      borderWidth: '0',
      boxShadow: 'none',
    },
    button: {
      opacity: 0.7,
      blurAmount: 5,
      borderOpacity: 0.3,
      borderRadius: '9999px',
      hoverEffect: true,
      hoverOpacity: 0.9,
      hoverScale: 1.05,
      hoverGlow: true,
      clickEffect: 'scale',
    },
    tooltip: {
      opacity: 0.9,
      blurAmount: 5,
      borderOpacity: 0.1,
      borderRadius: '0.5rem',
      boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
    },
  };

  // Merge preset with custom props
  const selectedPreset = presets[preset as keyof typeof presets];
  
  // Apply custom props over preset defaults
  const finalProps = {
    ...selectedPreset,
    opacity: opacity !== undefined ? opacity : selectedPreset.opacity,
    blurAmount: blurAmount !== undefined ? blurAmount : selectedPreset.blurAmount,
    borderOpacity: borderOpacity !== undefined ? borderOpacity : selectedPreset.borderOpacity,
    hoverEffect: hoverEffect !== undefined ? hoverEffect : selectedPreset.hoverEffect,
    hoverOpacity: hoverOpacity !== undefined ? hoverOpacity : selectedPreset.hoverOpacity,
    hoverBlurAmount: hoverBlurAmount !== undefined ? hoverBlurAmount : selectedPreset.hoverBlurAmount,
    hoverScale: hoverScale !== undefined ? hoverScale : selectedPreset.hoverScale,
    hoverRotate: hoverRotate !== undefined ? hoverRotate : selectedPreset.hoverRotate,
    hoverElevation: hoverElevation !== undefined ? hoverElevation : selectedPreset.hoverElevation,
    hoverGlow: hoverGlow !== undefined ? hoverGlow : selectedPreset.hoverGlow,
    glowColor: glowColor || selectedPreset.glowColor,
    hoverColorShift: hoverColorShift !== undefined ? hoverColorShift : selectedPreset.hoverColorShift,
    colorShiftTo: colorShiftTo || selectedPreset.colorShiftTo,
    borderRadius: borderRadius || selectedPreset.borderRadius,
    borderWidth: borderWidth || selectedPreset.borderWidth,
    borderColor: borderColor || selectedPreset.borderColor,
    boxShadow: boxShadow || selectedPreset.boxShadow,
    clickEffect: clickEffect || selectedPreset.clickEffect,
    clickScale: clickScale !== undefined ? clickScale : selectedPreset.clickScale,
  };

  // Generate background style
  let backgroundStyle = `rgba(255, 255, 255, ${finalProps.opacity})`;
  
  if (backgroundGradient && gradientColors && gradientColors.length >= 2) {
    backgroundStyle = `linear-gradient(to bottom right, ${gradientColors.join(', ')})`;
  } else if (backgroundImage) {
    backgroundStyle = `url(${backgroundImage})`;
  }

  // Base styles for the glass effect
  const glassStyles = {
    backgroundColor: backgroundGradient || backgroundImage ? 'transparent' : backgroundStyle,
    backgroundImage: backgroundGradient || backgroundImage ? backgroundStyle : 'none',
    backdropFilter: `blur(${finalProps.blurAmount}px)`,
    WebkitBackdropFilter: `blur(${finalProps.blurAmount}px)`,
    border: `${finalProps.borderWidth} solid rgba(255, 255, 255, ${finalProps.borderOpacity})`,
    borderRadius: finalProps.borderRadius,
    boxShadow: finalProps.boxShadow,
    cursor: onClick ? 'pointer' : 'default',
  };

  // Hover styles if hoverEffect is enabled
  const hoverStyles = finalProps.hoverEffect ? {
    backgroundColor: finalProps.hoverColorShift ? finalProps.colorShiftTo : `rgba(255, 255, 255, ${finalProps.hoverOpacity})`,
    backdropFilter: `blur(${finalProps.hoverBlurAmount}px)`,
    WebkitBackdropFilter: `blur(${finalProps.hoverBlurAmount}px)`,
    scale: finalProps.hoverScale,
    rotate: finalProps.hoverRotate,
    y: finalProps.hoverElevation ? -5 : 0,
    boxShadow: finalProps.hoverGlow 
      ? `0 15px 45px 0 rgba(31, 38, 135, 0.15), 0 0 20px ${finalProps.glowColor}` 
      : '0 15px 45px 0 rgba(31, 38, 135, 0.15)',
  } : {};

  // Get click/tap animation based on clickEffect
  const getTapStyles = () => {
    if (!onClick || finalProps.clickEffect === 'none') return {};
    
    switch (finalProps.clickEffect) {
      case 'scale':
        return { scale: finalProps.clickScale };
      case 'ripple':
        return { 
          scale: finalProps.clickScale,
          opacity: finalProps.opacity - 0.1,
          boxShadow: '0 5px 15px 0 rgba(31, 38, 135, 0.05)',
        };
      default:
        return {};
    }
  };

  const MotionComponent = motion[as as keyof typeof motion] || motion.div;

  return (
    <MotionComponent
      className={`${className} glass-effect`}
      initial={glassStyles}
      whileHover={hoverStyles}
      whileTap={getTapStyles()}
      onClick={onClick}
      transition={{ 
        duration: 0.2, 
        ease: [0.4, 0, 0.2, 1] 
      }}
      {...motionProps}
    >
      {children}
    </MotionComponent>
  );
};

export default GlassMorphism;
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  intensity?: 'subtle' | 'normal' | 'strong';
  duration?: number;
  direction?: 'vertical' | 'horizontal' | 'both';
}

/**
 * Component that adds a subtle floating animation to elements
 * Perfect for product images, decorative elements, or call-to-action buttons
 */
export const FloatingElement = ({
  children,
  className = '',
  intensity = 'normal',
  duration = 3,
  direction = 'vertical',
}: FloatingElementProps) => {
  const intensityMap = {
    subtle: 5,
    normal: 10,
    strong: 15,
  };

  const distance = intensityMap[intensity];

  const getAnimationProps = () => {
    switch (direction) {
      case 'vertical':
        return {
          y: [-distance, distance, -distance],
        };
      case 'horizontal':
        return {
          x: [-distance, distance, -distance],
        };
      case 'both':
        return {
          y: [-distance, distance, -distance],
          x: [-distance / 2, distance / 2, -distance / 2],
        };
      default:
        return {
          y: [-distance, distance, -distance],
        };
    }
  };

  return (
    <motion.div
      className={className}
      animate={getAnimationProps()}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export default FloatingElement;
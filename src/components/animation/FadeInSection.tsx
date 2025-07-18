import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ReactNode, Children, isValidElement, cloneElement } from 'react';

interface FadeInSectionProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
  rootMargin?: string;
  cascade?: boolean;
  amount?: number;
  damping?: number;
  childClassName?: string;
  childrenAs?: 'div' | 'li' | 'span';
  onViewportEnter?: () => void;
  onViewportLeave?: () => void;
}

/**
 * Enhanced component that fades in content when it enters the viewport
 * Supports multiple animation directions, customizable distance, and staggered children
 * 
 * @example
 * // Basic usage
 * <FadeInSection>
 *   <p>This content will fade in when scrolled into view</p>
 * </FadeInSection>
 * 
 * @example
 * // With direction and custom duration
 * <FadeInSection direction="left" duration={0.8}>
 *   <p>This content will slide in from the left</p>
 * </FadeInSection>
 * 
 * @example
 * // With staggered children
 * <FadeInSection staggerChildren staggerDelay={0.1}>
 *   <div>First item</div>
 *   <div>Second item</div>
 *   <div>Third item</div>
 * </FadeInSection>
 * 
 * @example
 * // With cascade effect (each child triggers the next)
 * <FadeInSection cascade>
 *   <div>First appears</div>
 *   <div>Then this one</div>
 *   <div>Finally this one</div>
 * </FadeInSection>
 */
export const FadeInSection = ({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
  threshold = 0.1,
  triggerOnce = true,
  direction = 'up',
  distance = 20,
  staggerChildren = false,
  staggerDelay = 0.1,
  rootMargin = '0px',
  cascade = false,
  amount = 0.5,
  damping = 12,
  childClassName = '',
  childrenAs = 'div',
  onViewportEnter,
  onViewportLeave,
}: FadeInSectionProps) => {
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
      case 'none':
        return { x: 0, y: 0 };
      default:
        return { x: 0, y: distance };
    }
  };

  const containerVariants = {
    hidden: { 
      opacity: 0,
      ...getInitialPosition(),
    },
    visible: { 
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier easing function as specified in design doc
        when: "beforeChildren",
        staggerChildren: staggerChildren ? staggerDelay : 0,
        delayChildren: delay,
      },
    },
  };

  const childVariants = {
    hidden: { 
      opacity: 0,
      y: 10,
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: duration * 0.8,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // For cascade effect, each child triggers the next
  const cascadeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * staggerDelay,
        duration: duration * 0.8,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  // If staggerChildren or cascade is true, wrap each child in a motion element
  const renderChildren = () => {
    if ((!staggerChildren && !cascade) || !Children.count(children)) {
      return children;
    }

    return Children.map(children, (child, index) => {
      if (!isValidElement(child)) return child;
      
      // For cascade effect, use custom variants with index
      if (cascade) {
        const MotionElement = motion[childrenAs as keyof typeof motion];
        return (
          <MotionElement
            key={index}
            custom={index}
            variants={cascadeVariants}
            className={`stagger-item ${childClassName}`}
          >
            {child}
          </MotionElement>
        );
      }
      
      // For regular staggered children
      return (
        <motion.div 
          key={index} 
          variants={childVariants} 
          className={`stagger-item ${childClassName}`}
        >
          {child}
        </motion.div>
      );
    });
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={`${className} fade-transition`}
    >
      {renderChildren()}
    </motion.div>
  );
};

export default FadeInSection;
import { useEffect, useRef, useState } from 'react';

interface ScrollAnimationOptions {
  /**
   * Animation class to apply when element is in view
   */
  animationClass: string;
  
  /**
   * Threshold for when the animation should trigger (0-1)
   * 0 = as soon as any part of the element is in view
   * 1 = when the entire element is in view
   */
  threshold?: number;
  
  /**
   * Whether to trigger the animation only once
   */
  once?: boolean;
  
  /**
   * Root margin for the intersection observer
   */
  rootMargin?: string;
  
  /**
   * Delay before applying the animation class (ms)
   */
  delay?: number;
}

/**
 * Hook to apply animations when elements scroll into view
 * 
 * @example
 * // Basic usage
 * const { ref, inView } = useScrollAnimation({ animationClass: 'visible' });
 * return <div ref={ref} className={`scroll-fade-in ${inView ? 'visible' : ''}`}>Content</div>;
 * 
 * @example
 * // With staggered children
 * const { ref, inView } = useScrollAnimation({ animationClass: 'visible', threshold: 0.2 });
 * return (
 *   <div ref={ref}>
 *     {items.map((item, i) => (
 *       <div 
 *         key={item.id} 
 *         className={`stagger-fade-up ${inView ? 'visible' : ''}`}
 *         style={{ transitionDelay: `${i * 100}ms` }}
 *       >
 *         {item.content}
 *       </div>
 *     ))}
 *   </div>
 * );
 */
export const useScrollAnimation = ({
  animationClass,
  threshold = 0.1,
  once = true,
  rootMargin = '0px',
  delay = 0,
}: ScrollAnimationOptions) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If element is in view and we want to trigger only once, disconnect the observer
        if (entry.isIntersecting) {
          if (delay) {
            setTimeout(() => {
              setInView(true);
            }, delay);
          } else {
            setInView(true);
          }
          
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );
    
    observer.observe(currentRef);
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once, rootMargin, delay]);
  
  return { ref, inView };
};

/**
 * Hook to apply staggered animations to a list of elements
 * 
 * @example
 * // Basic usage
 * const { containerRef, isInView } = useStaggeredAnimation();
 * return (
 *   <div ref={containerRef}>
 *     {items.map((item, i) => (
 *       <div 
 *         key={item.id} 
 *         className={`stagger-fade-up ${isInView ? 'visible' : ''}`}
 *         style={{ transitionDelay: `${i * 100}ms` }}
 *       >
 *         {item.content}
 *       </div>
 *     ))}
 *   </div>
 * );
 */
export const useStaggeredAnimation = ({
  threshold = 0.1,
  once = true,
  rootMargin = '0px',
  baseDelay = 0,
  staggerDelay = 100,
}: {
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
  baseDelay?: number;
  staggerDelay?: number;
} = {}) => {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const currentRef = containerRef.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );
    
    observer.observe(currentRef);
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once, rootMargin]);
  
  // Helper function to calculate delay for each item
  const getItemDelay = (index: number) => {
    return baseDelay + (index * staggerDelay);
  };
  
  return { containerRef, isInView, getItemDelay };
};

export default useScrollAnimation;
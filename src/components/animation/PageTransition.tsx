'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  key?: string;
}

/**
 * Component that adds smooth transitions between pages
 * Uses the current pathname as a key for AnimatePresence to properly
 * handle transitions between different routes
 */
export const PageTransition = ({
  children,
  className = '',
  key,
}: PageTransitionProps) => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  // This ensures the component only runs animations on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const variants = {
    hidden: { opacity: 0, y: 10 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  // If not on client yet, render without animations to prevent hydration mismatch
  if (!isClient) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key || pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
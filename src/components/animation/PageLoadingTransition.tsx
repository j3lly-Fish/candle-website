import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

interface PageLoadingTransitionProps {
  message?: string;
}

/**
 * A component that displays an animated loading state for page transitions
 * Can be used in Next.js page loading files or as a standalone component
 */
const PageLoadingTransition: React.FC<PageLoadingTransitionProps> = ({ 
  message = 'Loading...'
}) => {
  return (
    <motion.div 
      className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="bg-white p-8 rounded-lg shadow-lg text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <LoadingSpinner size="lg" color="secondary" />
        
        <motion.p 
          className="mt-4 text-neutral-dark font-medium"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {message}
        </motion.p>
        
        <motion.div 
          className="mt-4 flex justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-red-600 rounded-full"
              animate={{ y: ["0%", "-50%", "0%"] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PageLoadingTransition;
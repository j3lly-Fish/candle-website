import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TransitionElement from '../animation/TransitionElement';

interface SortOption {
  value: string;
  label: string;
}

interface ProductSortProps {
  sortOptions: SortOption[];
  currentSort: string;
  onSortChange: (value: string) => void;
  className?: string;
}

/**
 * ProductSort component provides sorting options for products
 */
const ProductSort: React.FC<ProductSortProps> = ({
  sortOptions,
  currentSort,
  onSortChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get current sort option label
  const currentSortOption = sortOptions.find(
    (option) => option.value === currentSort
  );

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Handle sort option selection
  const handleSelect = (value: string) => {
    onSortChange(value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <TransitionElement
        className="w-full"
        hoverScale={1}
        hoverElevation={false}
        shadowEffect="none"
      >
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>Sort by: {currentSortOption?.label || 'Default'}</span>
          <svg
            className={`ml-2 h-5 w-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </TransitionElement>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing dropdown when clicking outside */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-1 w-full bg-white shadow-lg rounded-md z-20 py-1 max-h-60 overflow-auto focus:outline-none"
              role="listbox"
            >
              {sortOptions.map((option) => (
                <TransitionElement
                  key={option.value}
                  className="w-full"
                  hoverScale={1}
                  hoverElevation={false}
                  shadowEffect="none"
                >
                  <button
                    className={`w-full text-left px-4 py-2 text-sm ${
                      currentSort === option.value
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelect(option.value)}
                    role="option"
                    aria-selected={currentSort === option.value}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {currentSort === option.value && (
                        <svg
                          className="h-5 w-5 text-red-600"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                </TransitionElement>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSort;
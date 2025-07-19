import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  name: string;
  options: FilterOption[];
}

interface PriceRange {
  min: number;
  max: number;
}

interface ProductFiltersProps {
  categories: FilterOption[];
  tags: FilterOption[];
  priceRange: PriceRange;
  selectedFilters: {
    categories: string[];
    tags: string[];
    price: [number, number];
    inStock: boolean;
  };
  onFilterChange: (filterType: string, value: string[] | [number, number] | boolean) => void;
  onClearFilters: () => void;
  className?: string;
  isMobile?: boolean;
}

/**
 * ProductFilters component provides filtering options for products
 */
const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  tags,
  priceRange: _priceRange,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  className = '',
  isMobile = false,
}) => {
  const [isOpen, setIsOpen] = useState(!isMobile);

  // Filter groups
  const filterGroups: FilterGroup[] = [
    {
      id: 'categories',
      name: 'Categories',
      options: categories,
    },
    {
      id: 'tags',
      name: 'Tags',
      options: tags,
    },
  ];

  // Handle checkbox change
  const handleCheckboxChange = (
    filterType: 'categories' | 'tags',
    optionId: string
  ) => {
    const currentSelected = [...selectedFilters[filterType]];
    const index = currentSelected.indexOf(optionId);

    if (index === -1) {
      currentSelected.push(optionId);
    } else {
      currentSelected.splice(index, 1);
    }

    onFilterChange(filterType, currentSelected);
  };

  // Handle price range change
  const handlePriceChange = (index: 0 | 1, value: number) => {
    const newPriceRange = [...selectedFilters.price] as [number, number];
    newPriceRange[index] = value;
    onFilterChange('price', newPriceRange);
  };

  // Handle in stock toggle
  const handleInStockToggle = () => {
    onFilterChange('inStock', !selectedFilters.inStock);
  };

  // Toggle filters visibility on mobile
  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${className}`}>
      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={toggleFilters}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg mb-4"
        >
          <span className="font-medium">Filters</span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}

      {/* Filters content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile ? { height: 0, opacity: 0 } : false}
            animate={isMobile ? { height: 'auto', opacity: 1 } : false}
            exit={isMobile ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              {/* Clear filters button */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Filters</h3>
                <button
                  onClick={onClearFilters}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear all
                </button>
              </div>

              {/* In stock filter */}
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    id="in-stock"
                    type="checkbox"
                    checked={selectedFilters.inStock}
                    onChange={handleInStockToggle}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="in-stock"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    In Stock Only
                  </label>
                </div>
              </div>

              {/* Price range filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Price Range</h4>
                <div className="flex items-center space-x-4">
                  <div className="w-full">
                    <label htmlFor="min-price" className="sr-only">
                      Minimum Price
                    </label>
                    <input
                      type="number"
                      id="min-price"
                      placeholder="Min"
                      value={selectedFilters.price[0] || ''}
                      onChange={(e) =>
                        handlePriceChange(0, Number(e.target.value))
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="w-full">
                    <label htmlFor="max-price" className="sr-only">
                      Maximum Price
                    </label>
                    <input
                      type="number"
                      id="max-price"
                      placeholder="Max"
                      value={selectedFilters.price[1] || ''}
                      onChange={(e) =>
                        handlePriceChange(1, Number(e.target.value))
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Filter groups */}
              {filterGroups.map((group) => (
                <div key={group.id} className="mb-6">
                  <h4 className="font-medium mb-2">{group.name}</h4>
                  <div className="space-y-2">
                    {group.options.map((option) => (
                      <div key={option.id} className="flex items-center">
                        <input
                          id={`${group.id}-${option.id}`}
                          type="checkbox"
                          checked={selectedFilters[group.id as 'categories' | 'tags'].includes(
                            option.id
                          )}
                          onChange={() =>
                            handleCheckboxChange(
                              group.id as 'categories' | 'tags',
                              option.id
                            )
                          }
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`${group.id}-${option.id}`}
                          className="ml-2 block text-sm text-gray-900"
                        >
                          {option.label}
                          {option.count !== undefined && (
                            <span className="text-gray-500 ml-1">
                              ({option.count})
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductFilters;
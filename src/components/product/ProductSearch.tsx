'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api, API_ENDPOINTS } from '@/lib/api';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import TransitionElement from '../animation/TransitionElement';

interface ProductSearchProps {
  className?: string;
  placeholder?: string;
  maxResults?: number;
}

interface SearchResult {
  success: boolean;
  count: number;
  data: Product[];
}

/**
 * ProductSearch component provides a search input with autocomplete results
 */
const ProductSearch: React.FC<ProductSearchProps> = ({
  className = '',
  placeholder = 'Search for candles...',
  maxResults = 5,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        fetchResults(value);
      } else {
        setResults([]);
      }
    }, 300);
  };

  // Fetch search results
  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await api.get<SearchResult>(
        `${API_ENDPOINTS.products.list}/search?q=${encodeURIComponent(
          searchQuery
        )}&limit=${maxResults}`
      );
      setResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    }
    // Arrow up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }
    // Enter
    else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      router.push(`/product/${results[selectedIndex].id}`);
      setShowResults(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
    // Escape
    else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search form */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 2 && results.length > 0) {
              setShowResults(true);
            }
          }}
          placeholder={placeholder}
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          aria-label="Search products"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {query.trim() && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <svg
              className="w-5 h-5 text-gray-400 hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </form>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-2.5">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Search results dropdown */}
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg max-h-96 overflow-y-auto"
          >
            <ul className="py-2">
              {results.map((product, index) => (
                <li key={product.id}>
                  <TransitionElement
                    className="w-full"
                    hoverScale={1}
                    hoverElevation={false}
                    shadowEffect="none"
                    colorShift={true}
                    colorShiftTo="#FF0000"
                  >
                    <Link
                      href={`/product/${product.id}`}
                      className={`flex items-center px-4 py-2 ${
                        selectedIndex === index ? 'bg-red-50' : ''
                      }`}
                      onClick={() => setShowResults(false)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {/* Product image */}
                      <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0]
                              : '/placeholder-candle.jpg'
                          }
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>

                      {/* Product info */}
                      <div className="ml-4 flex-grow">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {product.category}
                        </p>
                      </div>

                      {/* Product price */}
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.basePrice)}
                        </p>
                      </div>
                    </Link>
                  </TransitionElement>
                </li>
              ))}

              {/* View all results link */}
              <li>
                <TransitionElement
                  className="w-full"
                  hoverScale={1}
                  hoverElevation={false}
                  shadowEffect="none"
                >
                  <Link
                    href={`/products?q=${encodeURIComponent(query.trim())}`}
                    className="block px-4 py-2 text-sm text-center font-medium text-red-600 hover:text-red-800 border-t border-gray-100"
                    onClick={() => setShowResults(false)}
                  >
                    View all results
                  </Link>
                </TransitionElement>
              </li>
            </ul>
          </motion.div>
        )}

        {/* No results message */}
        {showResults && query.trim().length >= 2 && results.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg py-4 px-6 text-center"
          >
            <p className="text-gray-500">No products found for &quot;{query}&quot;</p>
            <button
              onClick={() => {
                router.push(`/products`);
                setShowResults(false);
              }}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
            >
              Browse all products
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSearch;
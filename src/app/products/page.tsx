'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductGrid, ProductFilters, ProductSort } from '@/components/product';
import { PageTransition } from '@/components/animation';
import { api, API_ENDPOINTS } from '@/lib/api';
import { Product } from '@/types';

interface ProductsResponse {
  success: boolean;
  count: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: Product[];
}

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

const sortOptions = [
  { value: 'createdAt:desc', label: 'Newest' },
  { value: 'createdAt:asc', label: 'Oldest' },
  { value: 'basePrice:asc', label: 'Price: Low to High' },
  { value: 'basePrice:desc', label: 'Price: High to Low' },
  { value: 'name:asc', label: 'Name: A to Z' },
  { value: 'name:desc', label: 'Name: Z to A' },
  { value: 'rating.average:desc', label: 'Highest Rated' },
];

const ProductsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for products and loading
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
  });
  
  // State for filter options
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [tags, setTags] = useState<FilterOption[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  
  // Get filter values from URL params
  const page = Number(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'createdAt:desc';
  const selectedCategories = useMemo(() => searchParams.get('categories')?.split(',') || [], [searchParams]);
  const selectedTags = useMemo(() => searchParams.get('tags')?.split(',') || [], [searchParams]);
  const minPrice = Number(searchParams.get('minPrice') || '0');
  const maxPrice = Number(searchParams.get('maxPrice') || '0');
  const inStock = searchParams.get('inStock') === 'true';
  const searchQuery = searchParams.get('q') || '';
  
  // Selected filters object
  const selectedFilters = {
    categories: selectedCategories,
    tags: selectedTags,
    price: [minPrice, maxPrice] as [number, number],
    inStock,
  };
  
  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', pagination.limit.toString());
        
        // Add sort parameter
        const [sortField, sortOrder] = sort.split(':');
        params.append('sort', sortField);
        params.append('order', sortOrder);
        
        // Add category filter
        if (selectedCategories.length > 0) {
          params.append('category', selectedCategories.join(','));
        }
        
        // Add tags filter
        if (selectedTags.length > 0) {
          params.append('tags', selectedTags.join(','));
        }
        
        // Add price range filter
        if (minPrice > 0) {
          params.append('minPrice', minPrice.toString());
        }
        
        if (maxPrice > 0) {
          params.append('maxPrice', maxPrice.toString());
        }
        
        // Add in stock filter
        if (inStock) {
          params.append('inStock', 'true');
        }
        
        // Add search query
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        
        // Fetch products
        const response = await api.get<ProductsResponse>(
          `${API_ENDPOINTS.products.list}?${params.toString()}`
        );
        
        setProducts(response.data);
        setPagination(response.pagination);
        
        // Extract unique categories and tags for filters
        if (response.data.length > 0) {
          const uniqueCategories = Array.from(
            new Set(response.data.map((product) => product.category))
          ).map((category) => ({
            id: category,
            label: category.charAt(0).toUpperCase() + category.slice(1),
            count: response.data.filter((p) => p.category === category).length,
          }));
          
          const allTags = response.data.flatMap((product) => product.tags);
          const uniqueTags = Array.from(new Set(allTags)).map((tag) => ({
            id: tag,
            label: tag.charAt(0).toUpperCase() + tag.slice(1),
            count: allTags.filter((t) => t === tag).length,
          }));
          
          // Find min and max price
          const prices = response.data.map((product) => product.basePrice);
          const minProductPrice = Math.min(...prices);
          const maxProductPrice = Math.max(...prices);
          
          setCategories(uniqueCategories);
          setTags(uniqueTags);
          setPriceRange({
            min: Math.floor(minProductPrice),
            max: Math.ceil(maxProductPrice),
          });
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [page, sort, selectedCategories, selectedTags, minPrice, maxPrice, inStock, searchQuery, pagination.limit]);
  
  // Handle filter change
  const handleFilterChange = (filterType: string, value: string[] | [number, number] | boolean) => {
    // Create new URLSearchParams object from current params
    const params = new URLSearchParams(searchParams.toString());
    
    // Update the specific filter
    switch (filterType) {
      case 'categories':
        if (Array.isArray(value) && value.length > 0) {
          params.set('categories', value.join(','));
        } else {
          params.delete('categories');
        }
        break;
        
      case 'tags':
        if (Array.isArray(value) && value.length > 0) {
          params.set('tags', value.join(','));
        } else {
          params.delete('tags');
        }
        break;
        
      case 'price':
        if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
          if (value[0] > 0) {
            params.set('minPrice', value[0].toString());
          } else {
            params.delete('minPrice');
          }
          
          if (value[1] > 0) {
            params.set('maxPrice', value[1].toString());
          } else {
            params.delete('maxPrice');
          }
        }
        break;
        
      case 'inStock':
        if (value) {
          params.set('inStock', 'true');
        } else {
          params.delete('inStock');
        }
        break;
    }
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    // Update URL with new params
    router.push(`/products?${params.toString()}`);
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`/products?${params.toString()}`);
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/products?${params.toString()}`);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('sort', sort);
    router.push(`/products?${params.toString()}`);
  };
  
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
          {searchQuery && (
            <p className="mt-2 text-gray-600">
              Search results for: <span className="font-medium">{searchQuery}</span>
            </p>
          )}
        </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters - Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <ProductFilters
            categories={categories}
            tags={tags}
            priceRange={priceRange}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>
        
        <div className="flex-1">
          {/* Filters - Mobile */}
          <div className="lg:hidden mb-6">
            <ProductFilters
              categories={categories}
              tags={tags}
              priceRange={priceRange}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              isMobile
            />
          </div>
          
          {/* Sort and results count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <p className="text-gray-600 mb-4 sm:mb-0">
              Showing {products.length} of {pagination.total} products
            </p>
            
            <ProductSort
              sortOptions={sortOptions}
              currentSort={sort}
              onSortChange={handleSortChange}
              className="w-full sm:w-48"
            />
          </div>
          
          {/* Product grid */}
          <ProductGrid
            products={products}
            loading={loading}
            columns={3}
          />
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-l-md border ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 border-t border-b ${
                        pageNum === page
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.pages}
                  className={`px-3 py-1 rounded-r-md border ${
                    page === pagination.pages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default ProductsPage;
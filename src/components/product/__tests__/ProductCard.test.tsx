import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductCard from '../ProductCard';

// Mock the next/navigation and next/link modules
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className }: { src: string, alt: string, className?: string }) => (
    <img src={src} alt={alt} className={className} />
  ),
}));

// Mock the animation components
jest.mock('../../animation', () => ({
  InteractiveCard: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={className}>{children}</div>
  ),
  GlassMorphism: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={className}>{children}</div>
  ),
  TransparentOverlay: ({ className }: { className?: string }) => (
    <div className={className}></div>
  ),
}));

// Mock the formatters
jest.mock('@/utils/formatters', () => ({
  formatCurrency: (price: number) => `$${price.toFixed(2)}`,
}));

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '123',
    name: 'Vanilla Candle',
    description: 'A sweet vanilla scented candle',
    basePrice: 15.99,
    images: ['vanilla1.jpg'],
    category: 'scented',
    featured: true,
    rating: {
      average: 4.5,
      count: 42
    },
    inventory: {
      isInStock: true,
      quantity: 20,
      lowStockThreshold: 5
    },
    tags: ['vanilla', 'sweet', 'relaxing']
  };

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    // Check if product name is displayed
    expect(screen.getByText('Vanilla Candle')).toBeInTheDocument();
    
    // Check if price is displayed correctly
    expect(screen.getByText('$15.99')).toBeInTheDocument();
    
    // Check if image is rendered with correct alt text
    const image = screen.getByAltText('Vanilla Candle');
    expect(image).toBeInTheDocument();
  });

  it('displays category name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('scented')).toBeInTheDocument();
  });

  it('displays "Featured" badge for featured products', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('does not display "Featured" badge for non-featured products', () => {
    const nonFeaturedProduct = { ...mockProduct, featured: false };
    render(<ProductCard product={nonFeaturedProduct} />);
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('displays "Out of Stock" when product is not in stock', () => {
    const outOfStockProduct = { 
      ...mockProduct, 
      inventory: { ...mockProduct.inventory, isInStock: false } 
    };
    render(<ProductCard product={outOfStockProduct} />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('displays "Low Stock" when product quantity is below threshold', () => {
    const lowStockProduct = { 
      ...mockProduct, 
      inventory: { ...mockProduct.inventory, quantity: 3, lowStockThreshold: 5 } 
    };
    render(<ProductCard product={lowStockProduct} />);
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('displays product tags', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('vanilla')).toBeInTheDocument();
    expect(screen.getByText('sweet')).toBeInTheDocument();
    expect(screen.getByText('relaxing')).toBeInTheDocument();
  });

  it('links to the correct product detail page', () => {
    render(<ProductCard product={mockProduct} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/123');
  });
});
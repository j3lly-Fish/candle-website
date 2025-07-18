import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductCustomization from '../ProductCustomization';
import { CustomizationApi } from '@/lib/customizationApi';

// Mock the CustomizationApi
jest.mock('@/lib/customizationApi', () => ({
  CustomizationApi: {
    validateCustomization: jest.fn(),
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, variants, ...props }: any) => (
      <div className={className} {...props}>{children}</div>
    ),
    h3: ({ children, className, variants, ...props }: any) => (
      <h3 className={className} {...props}>{children}</h3>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the TransitionElement component
jest.mock('@/components/animation', () => ({
  TransitionElement: ({ children }: any) => <>{children}</>,
}));

// Mock the ProductPreview component
jest.mock('../ProductPreview', () => {
  return function MockProductPreview({ productId, productName, baseImage, scent, color, size }: any) {
    return (
      <div data-testid="product-preview">
        <div data-testid="preview-product-name">{productName}</div>
        {scent && <div data-testid="preview-scent">{scent.name}</div>}
        {color && <div data-testid="preview-color">{color.name}</div>}
        {size && <div data-testid="preview-size">{size.name}</div>}
      </div>
    );
  };
});

describe('Product Customization Flow', () => {
  const mockProduct = {
    id: 'product1',
    name: 'Vanilla Candle',
    description: 'A sweet vanilla scented candle',
    basePrice: 15.99,
    images: ['vanilla1.jpg'],
    category: 'scented',
    featured: true,
    customizationOptions: {
      scents: [
        {
          id: 'scent1',
          name: 'Vanilla',
          description: 'Sweet vanilla scent',
          additionalPrice: 0,
          available: true,
          inStock: true,
          intensity: 'Medium',
          notes: ['Sweet', 'Warm']
        },
        {
          id: 'scent2',
          name: 'Lavender',
          description: 'Relaxing lavender scent',
          additionalPrice: 2.00,
          available: true,
          inStock: true,
          intensity: 'Light',
          notes: ['Floral', 'Relaxing']
        }
      ],
      colors: [
        {
          id: 'color1',
          name: 'White',
          description: 'Pure white color',
          hexCode: '#FFFFFF',
          additionalPrice: 0,
          available: true,
          inStock: true
        },
        {
          id: 'color2',
          name: 'Purple',
          description: 'Soft purple color',
          hexCode: '#A020F0',
          additionalPrice: 1.50,
          available: true,
          inStock: true
        }
      ],
      sizes: [
        {
          id: 'size1',
          name: 'Small',
          description: 'Small size candle',
          dimensions: '3x3 inches',
          additionalPrice: 0,
          available: true,
          inStock: true,
          weightOz: 6,
          burnTimeHours: 20
        },
        {
          id: 'size2',
          name: 'Medium',
          description: 'Medium size candle',
          dimensions: '4x4 inches',
          additionalPrice: 3.00,
          available: true,
          inStock: true,
          weightOz: 10,
          burnTimeHours: 40
        }
      ]
    }
  };

  const mockOnCustomizationChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for validation API
    (CustomizationApi.validateCustomization as jest.Mock).mockResolvedValue({
      isValid: true,
      price: 15.99,
      message: ''
    });
  });

  it('renders customization options correctly', () => {
    render(
      <ProductCustomization 
        product={mockProduct} 
        onCustomizationChange={mockOnCustomizationChange} 
      />
    );

    // Check if title is displayed
    expect(screen.getByText('Customize Your Candle')).toBeInTheDocument();

    // Check if scent options are displayed
    expect(screen.getByText('Scent')).toBeInTheDocument();
    expect(screen.getByText('Vanilla')).toBeInTheDocument();
    expect(screen.getByText('Lavender')).toBeInTheDocument();

    // Check if color options are displayed
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByLabelText('Color: White')).toBeInTheDocument();
    expect(screen.getByLabelText('Color: Purple')).toBeInTheDocument();

    // Check if size options are displayed
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Small')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();

    // Check if price is displayed
    expect(screen.getByText('Total Price:')).toBeInTheDocument();
    expect(screen.getByText('$15.99')).toBeInTheDocument();
  });

  it('updates preview and price when options are selected', async () => {
    // Mock validation API to return updated price
    (CustomizationApi.validateCustomization as jest.Mock).mockResolvedValue({
      isValid: true,
      price: 22.49, // Base + Lavender + Purple + Medium
      message: ''
    });

    render(
      <ProductCustomization 
        product={mockProduct} 
        onCustomizationChange={mockOnCustomizationChange} 
      />
    );

    // Select Lavender scent
    fireEvent.click(screen.getByText('Lavender'));
    
    // Select Purple color
    fireEvent.click(screen.getByLabelText('Color: Purple'));
    
    // Select Medium size
    fireEvent.click(screen.getByText('Medium'));

    // Wait for validation API to be called
    await waitFor(() => {
      expect(CustomizationApi.validateCustomization).toHaveBeenCalledWith(
        'product1',
        {
          scentId: 'scent2',
          colorId: 'color2',
          sizeId: 'size2'
        }
      );
    });

    // Check if preview is updated
    expect(screen.getByTestId('preview-scent')).toHaveTextContent('Lavender');
    expect(screen.getByTestId('preview-color')).toHaveTextContent('Purple');
    expect(screen.getByTestId('preview-size')).toHaveTextContent('Medium');

    // Check if price is updated
    expect(screen.getByText('$22.49')).toBeInTheDocument();

    // Check if onCustomizationChange callback is called with correct data
    expect(mockOnCustomizationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        scent: expect.objectContaining({ id: 'scent2', name: 'Lavender' }),
        color: expect.objectContaining({ id: 'color2', name: 'Purple' }),
        size: expect.objectContaining({ id: 'size2', name: 'Medium' }),
        price: 22.49,
        isValid: true
      })
    );
  });

  it('displays validation error for invalid combinations', async () => {
    // Mock validation API to return error
    (CustomizationApi.validateCustomization as jest.Mock).mockResolvedValue({
      isValid: false,
      price: 15.99,
      message: 'This combination is not available'
    });

    render(
      <ProductCustomization 
        product={mockProduct} 
        onCustomizationChange={mockOnCustomizationChange} 
      />
    );

    // Select Lavender scent
    fireEvent.click(screen.getByText('Lavender'));
    
    // Select Purple color
    fireEvent.click(screen.getByLabelText('Color: Purple'));

    // Wait for validation error to appear
    await waitFor(() => {
      expect(screen.getByText('This combination is not available')).toBeInTheDocument();
    });

    // Check if onCustomizationChange callback is called with isValid: false
    expect(mockOnCustomizationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        isValid: false
      })
    );
  });

  it('toggles selection when clicking the same option again', async () => {
    render(
      <ProductCustomization 
        product={mockProduct} 
        onCustomizationChange={mockOnCustomizationChange} 
      />
    );

    // Select Vanilla scent - use more specific selector
    const vanillaButton = screen.getByRole('button', { name: /vanilla/i });
    fireEvent.click(vanillaButton);
    
    // Wait for validation API to be called
    await waitFor(() => {
      expect(CustomizationApi.validateCustomization).toHaveBeenCalled();
    });

    // Check if scent is selected
    expect(mockOnCustomizationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        scent: expect.objectContaining({ id: 'scent1', name: 'Vanilla' })
      })
    );

    // Reset mock to check next call
    mockOnCustomizationChange.mockClear();
    
    // Click Vanilla again to deselect - use the same button reference
    fireEvent.click(vanillaButton);
    
    // Wait for validation API to be called
    await waitFor(() => {
      expect(mockOnCustomizationChange).toHaveBeenCalledWith(
        expect.objectContaining({
          scent: null
        })
      );
    });
  });

  it('calculates client-side price immediately for better UX', async () => {
    render(
      <ProductCustomization 
        product={mockProduct} 
        onCustomizationChange={mockOnCustomizationChange} 
      />
    );

    // Select Lavender scent (additional $2.00)
    fireEvent.click(screen.getByText('Lavender'));
    
    // Price should update immediately before API call completes
    expect(screen.getByText('$17.99')).toBeInTheDocument();
    
    // Select Purple color (additional $1.50)
    fireEvent.click(screen.getByLabelText('Color: Purple'));
    
    // Price should update immediately before API call completes
    expect(screen.getByText('$19.49')).toBeInTheDocument();
  });
});
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiX, FiSave, FiTrash } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface CustomizationOption {
  _id?: string;
  name: string;
  description?: string;
  hexCode?: string;
  dimensions?: string;
  additionalPrice: number;
  available: boolean;
}

interface ProductData {
  _id?: string;
  name: string;
  description: string;
  basePrice: number;
  images: string[];
  category: string;
  featured: boolean;
  customizationOptions: {
    scents: CustomizationOption[];
    colors: CustomizationOption[];
    sizes: CustomizationOption[];
  };
  inventory: {
    quantity: number;
    lowStockThreshold: number;
  };
}

interface ProductEditorProps {
  productId?: string;
  initialData?: ProductData;
}

const defaultProduct: ProductData = {
  name: '',
  description: '',
  basePrice: 0,
  images: [],
  category: 'scented',
  featured: false,
  customizationOptions: {
    scents: [],
    colors: [],
    sizes: [],
  },
  inventory: {
    quantity: 0,
    lowStockThreshold: 5,
  },
};

const ProductEditor: React.FC<ProductEditorProps> = ({ productId, initialData }) => {
  const router = useRouter();
  const [product, setProduct] = useState<ProductData>(initialData || defaultProduct);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [newImage, setNewImage] = useState('');
  const [newScent, setNewScent] = useState<CustomizationOption>({
    name: '',
    description: '',
    additionalPrice: 0,
    available: true,
  });
  const [newColor, setNewColor] = useState<CustomizationOption>({
    name: '',
    hexCode: '#FFFFFF',
    additionalPrice: 0,
    available: true,
  });
  const [newSize, setNewSize] = useState<CustomizationOption>({
    name: '',
    dimensions: '',
    additionalPrice: 0,
    available: true,
  });

  const isEditMode = !!productId;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProduct({
        ...product,
        [parent]: {
          ...(product[parent as keyof ProductData] as object),
          [child]: type === 'number' ? parseFloat(value) : value,
        },
      });
    } else {
      setProduct({
        ...product,
        [name]: type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : type === 'number' 
            ? parseFloat(value) 
            : value,
      });
    }
  };

  const handleAddImage = () => {
    if (newImage && !product.images.includes(newImage)) {
      setProduct({
        ...product,
        images: [...product.images, newImage],
      });
      setNewImage('');
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...product.images];
    updatedImages.splice(index, 1);
    setProduct({
      ...product,
      images: updatedImages,
    });
  };

  const handleAddScent = () => {
    if (newScent.name) {
      setProduct({
        ...product,
        customizationOptions: {
          ...product.customizationOptions,
          scents: [...product.customizationOptions.scents, { ...newScent }],
        },
      });
      setNewScent({
        name: '',
        description: '',
        additionalPrice: 0,
        available: true,
      });
    }
  };

  const handleRemoveScent = (index: number) => {
    const updatedScents = [...product.customizationOptions.scents];
    updatedScents.splice(index, 1);
    setProduct({
      ...product,
      customizationOptions: {
        ...product.customizationOptions,
        scents: updatedScents,
      },
    });
  };

  const handleAddColor = () => {
    if (newColor.name && newColor.hexCode) {
      setProduct({
        ...product,
        customizationOptions: {
          ...product.customizationOptions,
          colors: [...product.customizationOptions.colors, { ...newColor }],
        },
      });
      setNewColor({
        name: '',
        hexCode: '#FFFFFF',
        additionalPrice: 0,
        available: true,
      });
    }
  };

  const handleRemoveColor = (index: number) => {
    const updatedColors = [...product.customizationOptions.colors];
    updatedColors.splice(index, 1);
    setProduct({
      ...product,
      customizationOptions: {
        ...product.customizationOptions,
        colors: updatedColors,
      },
    });
  };

  const handleAddSize = () => {
    if (newSize.name) {
      setProduct({
        ...product,
        customizationOptions: {
          ...product.customizationOptions,
          sizes: [...product.customizationOptions.sizes, { ...newSize }],
        },
      });
      setNewSize({
        name: '',
        dimensions: '',
        additionalPrice: 0,
        available: true,
      });
    }
  };

  const handleRemoveSize = (index: number) => {
    const updatedSizes = [...product.customizationOptions.sizes];
    updatedSizes.splice(index, 1);
    setProduct({
      ...product,
      customizationOptions: {
        ...product.customizationOptions,
        sizes: updatedSizes,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = isEditMode
        ? `/api/admin/products/${productId}`
        : '/api/admin/products';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }

      const data = await response.json();
      setSuccess(isEditMode ? 'Product updated successfully' : 'Product created successfully');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Product save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {isEditMode ? 'Edit Product' : 'Create New Product'}
        </h3>
      </div>

      {error && (
        <div className="px-6 py-4 bg-red-50 text-red-700 border-b border-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="px-6 py-4 bg-green-50 text-green-700 border-b border-green-100">
          {success}
        </div>
      )}

      <div className="px-6 py-5">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-red-700 text-red-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Basic Information
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'images'
                  ? 'border-red-700 text-red-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab('scents')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scents'
                  ? 'border-red-700 text-red-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Scents
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'colors'
                  ? 'border-red-700 text-red-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Colors
            </button>
            <button
              onClick={() => setActiveTab('sizes')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sizes'
                  ? 'border-red-700 text-red-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sizes
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory'
                  ? 'border-red-700 text-red-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inventory
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          {activeTab === 'basic' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={product.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={product.description}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">
                  Base Price ($) *
                </label>
                <input
                  type="number"
                  id="basePrice"
                  name="basePrice"
                  value={product.basePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={product.category}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="scented">Scented</option>
                  <option value="unscented">Unscented</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="gift">Gift</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={product.featured}
                  onChange={(e) => setProduct({ ...product, featured: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                  Featured Product
                </label>
              </div>
            </motion.div>
          )}

          {/* Images */}
          {activeTab === 'images' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>
                <div className="flex flex-wrap gap-4 mb-4">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative w-32 h-32 border border-gray-200 rounded-md overflow-hidden group"
                    >
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Error';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex">
                  <input
                    type="text"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="Enter image URL"
                    className="flex-grow border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={!newImage}
                    className="bg-red-700 text-white px-4 py-2 rounded-r-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    <FiPlus className="inline-block mr-1" /> Add
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Add image URLs for your product. The first image will be used as the main product image.
                </p>
              </div>
            </motion.div>
          )}

          {/* Scents */}
          {activeTab === 'scents' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scent Options
                </label>
                <div className="mb-4 space-y-4">
                  {product.customizationOptions.scents.map((scent, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                    >
                      <div className="flex-grow">
                        <div className="font-medium">{scent.name}</div>
                        <div className="text-sm text-gray-500">{scent.description}</div>
                        <div className="text-sm">
                          Additional Price: ${scent.additionalPrice.toFixed(2)} | 
                          Status: {scent.available ? 'Available' : 'Unavailable'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveScent(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border border-gray-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Scent</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newScent.name}
                        onChange={(e) => setNewScent({ ...newScent, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newScent.description}
                        onChange={(e) => setNewScent({ ...newScent, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Additional Price ($)
                      </label>
                      <input
                        type="number"
                        value={newScent.additionalPrice}
                        onChange={(e) => setNewScent({ ...newScent, additionalPrice: parseFloat(e.target.value) })}
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="scentAvailable"
                        checked={newScent.available}
                        onChange={(e) => setNewScent({ ...newScent, available: e.target.checked })}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="scentAvailable" className="ml-2 block text-sm text-gray-900">
                        Available
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddScent}
                    disabled={!newScent.name}
                    className="w-full bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    <FiPlus className="inline-block mr-1" /> Add Scent
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Colors */}
          {activeTab === 'colors' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Options
                </label>
                <div className="mb-4 space-y-4">
                  {product.customizationOptions.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                    >
                      <div className="flex-grow flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full mr-3 border border-gray-300" 
                          style={{ backgroundColor: color.hexCode }}
                        ></div>
                        <div>
                          <div className="font-medium">{color.name}</div>
                          <div className="text-sm">
                            Additional Price: ${color.additionalPrice.toFixed(2)} | 
                            Status: {color.available ? 'Available' : 'Unavailable'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border border-gray-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Color</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newColor.name}
                        onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <input
                        type="color"
                        value={newColor.hexCode}
                        onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })}
                        className="w-full h-10 border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Additional Price ($)
                      </label>
                      <input
                        type="number"
                        value={newColor.additionalPrice}
                        onChange={(e) => setNewColor({ ...newColor, additionalPrice: parseFloat(e.target.value) })}
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="colorAvailable"
                        checked={newColor.available}
                        onChange={(e) => setNewColor({ ...newColor, available: e.target.checked })}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="colorAvailable" className="ml-2 block text-sm text-gray-900">
                        Available
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddColor}
                    disabled={!newColor.name || !newColor.hexCode}
                    className="w-full bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    <FiPlus className="inline-block mr-1" /> Add Color
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Sizes */}
          {activeTab === 'sizes' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size Options
                </label>
                <div className="mb-4 space-y-4">
                  {product.customizationOptions.sizes.map((size, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                    >
                      <div className="flex-grow">
                        <div className="font-medium">{size.name}</div>
                        <div className="text-sm text-gray-500">{size.dimensions}</div>
                        <div className="text-sm">
                          Additional Price: ${size.additionalPrice.toFixed(2)} | 
                          Status: {size.available ? 'Available' : 'Unavailable'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border border-gray-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Size</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newSize.name}
                        onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        value={newSize.dimensions}
                        onChange={(e) => setNewSize({ ...newSize, dimensions: e.target.value })}
                        placeholder="e.g. 3\" x 4\""
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Additional Price ($)
                      </label>
                      <input
                        type="number"
                        value={newSize.additionalPrice}
                        onChange={(e) => setNewSize({ ...newSize, additionalPrice: parseFloat(e.target.value) })}
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sizeAvailable"
                        checked={newSize.available}
                        onChange={(e) => setNewSize({ ...newSize, available: e.target.checked })}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sizeAvailable" className="ml-2 block text-sm text-gray-900">
                        Available
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSize}
                    disabled={!newSize.name}
                    className="w-full bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    <FiPlus className="inline-block mr-1" /> Add Size
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Inventory */}
          {activeTab === 'inventory' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="inventory.quantity" className="block text-sm font-medium text-gray-700">
                  Quantity in Stock
                </label>
                <input
                  type="number"
                  id="inventory.quantity"
                  name="inventory.quantity"
                  value={product.inventory.quantity}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label htmlFor="inventory.lowStockThreshold" className="block text-sm font-medium text-gray-700">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  id="inventory.lowStockThreshold"
                  name="inventory.lowStockThreshold"
                  value={product.inventory.lowStockThreshold}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
                <p className="mt-2 text-sm text-gray-500">
                  When stock falls below this number, the product will be marked as low stock.
                </p>
              </div>
            </motion.div>
          )}

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <FiSave className="inline-block mr-1" />
              {isLoading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditor;

export default ProductEditor;
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product, { IProduct } from '../models/Product';
import { NotFoundError, ValidationError } from '../utils/errors';
import { validateProduct } from '../utils/productValidation';

/**
 * Get all products with filtering, sorting, and pagination
 * @route GET /api/products
 * @access Public
 */
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      category,
      featured,
      minPrice,
      maxPrice,
      search,
      inStock,
      tags
    } = req.query;

    // Build filter object
    const filter: any = {};

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Featured filter
    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.basePrice = {};
      if (minPrice !== undefined) {
        filter.basePrice.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        filter.basePrice.$lte = Number(maxPrice);
      }
    }

    // In stock filter
    if (inStock !== undefined) {
      filter['inventory.isInStock'] = inStock === 'true';
    }

    // Tags filter (comma-separated list)
    if (tags) {
      const tagList = (tags as string).split(',').map(tag => tag.trim());
      filter.tags = { $in: tagList };
    }

    // Search filter (search in name, description, and tags)
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Determine sort order
    const sortOrder = (order as string).toLowerCase() === 'asc' ? 1 : -1;
    const sortField = sort as string;
    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder;

    // Execute query with pagination
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limitNum);

    // Return response
    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        total: totalProducts,
        page: pageNum,
        limit: limitNum,
        pages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by ID
 * @route GET /api/products/:id
 * @access Public
 */
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid product ID format');
    }

    // Find product
    const product = await Product.findById(id);

    // Check if product exists
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Return product
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product
 * @route POST /api/products
 * @access Private/Admin
 */
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productData = req.body;

    // Validate product data
    const validationResult = validateProduct(productData);
    if (!validationResult.isValid) {
      throw new ValidationError('Product validation failed', 
        validationResult.errors.reduce((acc, error, index) => {
          acc[`error_${index}`] = error;
          return acc;
        }, {} as Record<string, string>)
      );
    }

    // Create product
    const product = await Product.create(productData);

    // Return created product
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors: Record<string, string> = {};
      
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return next(new ValidationError('Validation failed', validationErrors));
    }
    
    next(error);
  }
};

/**
 * Update a product
 * @route PUT /api/products/:id
 * @access Private/Admin
 */
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid product ID format');
    }

    // Find product and update
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Check if product exists
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Validate updated product
    const validationResult = validateProduct(product);
    if (!validationResult.isValid) {
      throw new ValidationError('Product validation failed', 
        validationResult.errors.reduce((acc, error, index) => {
          acc[`error_${index}`] = error;
          return acc;
        }, {} as Record<string, string>)
      );
    }

    // Return updated product
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors: Record<string, string> = {};
      
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return next(new ValidationError('Validation failed', validationErrors));
    }
    
    next(error);
  }
};

/**
 * Delete a product
 * @route DELETE /api/products/:id
 * @access Private/Admin
 */
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid product ID format');
    }

    // Find product and delete
    const product = await Product.findByIdAndDelete(id);

    // Check if product exists
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Return success message
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all customization options
 * @route GET /api/products/options
 * @access Public
 */
export const getCustomizationOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Aggregate all available customization options across products
    const scents = await Product.aggregate([
      { $unwind: '$customizationOptions.scents' },
      { $match: { 'customizationOptions.scents.available': true } },
      { $group: {
          _id: null,
          options: { $addToSet: '$customizationOptions.scents' }
        }
      }
    ]);

    const colors = await Product.aggregate([
      { $unwind: '$customizationOptions.colors' },
      { $match: { 'customizationOptions.colors.available': true } },
      { $group: {
          _id: null,
          options: { $addToSet: '$customizationOptions.colors' }
        }
      }
    ]);

    const sizes = await Product.aggregate([
      { $unwind: '$customizationOptions.sizes' },
      { $match: { 'customizationOptions.sizes.available': true } },
      { $group: {
          _id: null,
          options: { $addToSet: '$customizationOptions.sizes' }
        }
      }
    ]);

    // Return options
    res.status(200).json({
      success: true,
      data: {
        scents: scents.length > 0 ? scents[0].options : [],
        colors: colors.length > 0 ? colors[0].options : [],
        sizes: sizes.length > 0 ? sizes[0].options : []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search products
 * @route GET /api/products/search
 * @access Public
 */
export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      throw new ValidationError('Search query is required');
    }

    // Create text index if it doesn't exist
    try {
      await Product.collection.createIndex({ 
        name: 'text', 
        description: 'text',
        tags: 'text',
        'customizationOptions.scents.name': 'text',
        'customizationOptions.colors.name': 'text',
        'customizationOptions.sizes.name': 'text'
      });
    } catch (error) {
      // Index might already exist, continue
    }

    // Search products using text search
    const products = await Product.find(
      { $text: { $search: q as string } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit as string, 10));

    // Return search results
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
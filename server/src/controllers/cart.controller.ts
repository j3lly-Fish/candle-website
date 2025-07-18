import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { NotFoundError, ValidationError, AppError } from '../utils/errors';
import { CustomizationValidator } from '../utils/customizationValidator';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique guest ID
 */
const generateGuestId = (): string => {
  return uuidv4();
};

/**
 * Get the current cart for a user or guest
 * @route GET /api/cart
 */
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let cart;
    
    // Check if user is authenticated
    if (req.user) {
      // Find cart by user ID
      cart = await Cart.findByUser(req.user._id);
    } else if (req.cookies.guestId) {
      // Find cart by guest ID from cookie
      cart = await Cart.findByGuestId(req.cookies.guestId);
    } else {
      // No existing cart, create a new guest ID
      const guestId = generateGuestId();
      
      // Set cookie with guest ID (expires in 30 days)
      res.cookie('guestId', guestId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Create a new empty cart
      cart = await Cart.create({
        guestId,
        items: [],
        totalPrice: 0
      });
    }
    
    // If no cart exists, create a new one
    if (!cart) {
      if (req.user) {
        cart = await Cart.create({
          user: req.user._id,
          items: [],
          totalPrice: 0
        });
      } else if (req.cookies.guestId) {
        cart = await Cart.create({
          guestId: req.cookies.guestId,
          items: [],
          totalPrice: 0
        });
      }
    }
    
    // Populate product details if cart exists
    if (cart) {
      await cart.populate({
        path: 'items.product',
        select: 'name images basePrice'
      });
    }
    
    res.status(200).json({
      success: true,
      data: cart || { items: [], totalPrice: 0 }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 * @route POST /api/cart/items
 */
export const addItemToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity, customizations } = req.body;
    
    // Validate required fields
    if (!productId) {
      throw new ValidationError('Product ID is required', { productId: 'Product ID is required' });
    }
    
    if (!quantity || quantity < 1) {
      throw new ValidationError('Quantity must be at least 1', { quantity: 'Quantity must be at least 1' });
    }
    
    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ValidationError('Invalid product ID format', { productId: 'Invalid product ID format' });
    }
    
    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    
    // Check if product is in stock
    if (product.inventory <= 0) {
      throw new ValidationError('Product is out of stock', { productId: 'Product is out of stock' });
    }
    
    // Check if requested quantity is available
    if (product.inventory < quantity) {
      throw new ValidationError(`Only ${product.inventory} items available`, { 
        quantity: `Only ${product.inventory} items available` 
      });
    }
    
    // Extract customization options
    const scentId = customizations?.scentId || null;
    const colorId = customizations?.colorId || null;
    const sizeId = customizations?.sizeId || null;
    
    // Validate customization combination
    const validationResult = await CustomizationValidator.validateProductCustomizationCombination(
      productId,
      { scentId, colorId, sizeId }
    );
    
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.message || 'Invalid customization options', {
        customizations: validationResult.message || 'Invalid customization options'
      });
    }
    
    // Calculate price with customizations
    const priceResult = await CustomizationValidator.calculateCustomizedPrice(
      productId,
      { scentId, colorId, sizeId }
    );
    
    if (priceResult.error) {
      throw new AppError(priceResult.error, 500);
    }
    
    // Get or create cart
    let cart;
    
    if (req.user) {
      cart = await Cart.findOrCreateCart(req.user._id);
    } else {
      // Check for guest ID in cookies
      let guestId = req.cookies.guestId;
      
      // If no guest ID, generate one
      if (!guestId) {
        guestId = generateGuestId();
        
        // Set cookie with guest ID (expires in 30 days)
        res.cookie('guestId', guestId, {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }
      
      cart = await Cart.findOrCreateCart(null, guestId);
    }
    
    // Add item to cart
    cart.items.push({
      product: new mongoose.Types.ObjectId(productId),
      quantity,
      price: priceResult.price,
      customizations: {
        scent: scentId ? new mongoose.Types.ObjectId(scentId) : null,
        color: colorId ? new mongoose.Types.ObjectId(colorId) : null,
        size: sizeId ? new mongoose.Types.ObjectId(sizeId) : null
      }
    });
    
    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Save the cart
    await cart.save();
    
    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name images basePrice'
    });
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update cart item quantity
 * @route PUT /api/cart/items/:id
 */
export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    // Validate quantity
    if (!quantity || quantity < 1) {
      throw new ValidationError('Quantity must be at least 1', { quantity: 'Quantity must be at least 1' });
    }
    
    // Get cart
    let cart;
    
    if (req.user) {
      cart = await Cart.findByUser(req.user._id);
    } else if (req.cookies.guestId) {
      cart = await Cart.findByGuestId(req.cookies.guestId);
    }
    
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }
    
    // Find the cart item
    const cartItem = cart.items.find(item => item._id && item._id.toString() === id);
    
    if (!cartItem) {
      throw new NotFoundError('Cart item not found');
    }
    
    // Get the product to check inventory
    const product = await Product.findById(cartItem.product);
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    
    // Check if requested quantity is available
    if (product.inventory < quantity) {
      throw new ValidationError(`Only ${product.inventory} items available`, { 
        quantity: `Only ${product.inventory} items available` 
      });
    }
    
    // Update item quantity
    cartItem.quantity = quantity;
    
    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Save the cart
    await cart.save();
    
    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name images basePrice'
    });
    
    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 * @route DELETE /api/cart/items/:id
 */
export const removeCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Get cart
    let cart;
    
    if (req.user) {
      cart = await Cart.findByUser(req.user._id);
    } else if (req.cookies.guestId) {
      cart = await Cart.findByGuestId(req.cookies.guestId);
    }
    
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }
    
    // Find the cart item
    const cartItem = cart.items.find(item => item._id && item._id.toString() === id);
    
    if (!cartItem) {
      throw new NotFoundError('Cart item not found');
    }
    
    // Remove item from cart
    cart.items = cart.items.filter(item => item._id && item._id.toString() !== id);
    
    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Save the cart
    await cart.save();
    
    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name images basePrice'
    });
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Merge guest cart with user cart
 * @route POST /api/cart/merge
 */
export const mergeCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This endpoint requires authentication
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const { guestId } = req.body;
    
    if (!guestId) {
      throw new ValidationError('Guest ID is required', { guestId: 'Guest ID is required' });
    }
    
    // Find guest cart
    const guestCart = await Cart.findByGuestId(guestId);
    
    if (!guestCart || guestCart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No guest cart to merge',
        data: await Cart.findOrCreateCart(req.user._id)
      });
    }
    
    // Find or create user cart
    const userCart = await Cart.findOrCreateCart(req.user._id);
    
    // Merge items from guest cart to user cart
    for (const item of guestCart.items) {
      // Check if product still exists and is in stock
      const product = await Product.findById(item.product);
      
      if (!product || product.inventory <= 0) {
        continue; // Skip unavailable products
      }
      
      // Check if requested quantity is available
      if (product.inventory < item.quantity) {
        // Adjust quantity to available inventory
        item.quantity = product.inventory;
      }
      
      // Extract customization options
      const scentId = item.customizations.scent ? item.customizations.scent.toString() : undefined;
      const colorId = item.customizations.color ? item.customizations.color.toString() : undefined;
      const sizeId = item.customizations.size ? item.customizations.size.toString() : undefined;
      
      // Validate customization combination
      const validationResult = await CustomizationValidator.validateProductCustomizationCombination(
        item.product.toString(),
        { scentId, colorId, sizeId }
      );
      
      if (!validationResult.isValid) {
        continue; // Skip invalid customizations
      }
      
      // Add item to user cart
      userCart.items.push({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        customizations: item.customizations
      });
    }
    
    // Delete guest cart
    await Cart.findByIdAndDelete(guestCart._id);
    
    // Clear guest ID cookie
    res.clearCookie('guestId');
    
    // Populate product details
    await userCart.populate({
      path: 'items.product',
      select: 'name images basePrice'
    });
    
    res.status(200).json({
      success: true,
      message: 'Carts merged successfully',
      data: userCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 * @route DELETE /api/cart
 */
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get cart
    let cart;
    
    if (req.user) {
      cart = await Cart.findByUser(req.user._id);
    } else if (req.cookies.guestId) {
      cart = await Cart.findByGuestId(req.cookies.guestId);
    }
    
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }
    
    // Clear cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  mergeCart,
  clearCart
};
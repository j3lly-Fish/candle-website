import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart';
import Order from '../models/Order';
import { validateOrderAddresses } from '../utils/addressValidator';

/**
 * Validate checkout data
 * @route POST /api/checkout/validate
 */
export const validateCheckout = async (req: Request, res: Response) => {
  try {
    const { cartId, shippingAddress, billingAddress } = req.body;

    // Validate required fields
    if (!cartId) {
      return res.status(400).json({
        success: false,
        message: 'Cart ID is required'
      });
    }

    // Find the cart
    const cart = await Cart.findById(cartId).populate('items.product');
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Check if cart is empty
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot checkout with empty cart'
      });
    }

    // Validate inventory
    const inventoryValidation = await Order.validateInventory(
      cart.items.map(item => ({
        product: item.product._id.toString(),
        quantity: item.quantity
      }))
    );

    // Validate addresses if provided
    let addressValidation = { valid: true };
    if (shippingAddress && billingAddress) {
      addressValidation = validateOrderAddresses(shippingAddress, billingAddress);
    }

    // Calculate order totals
    const subtotal = cart.totalPrice;
    const tax = parseFloat((subtotal * 0.08).toFixed(2)); // 8% tax rate
    const shippingCost = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const totalPrice = parseFloat((subtotal + tax + shippingCost).toFixed(2));

    res.status(200).json({
      success: true,
      valid: inventoryValidation.valid && addressValidation.valid,
      cart: {
        id: cart._id,
        items: cart.items.map(item => {
          const product = item.product as any; // Type assertion for populated product
          return {
            id: item._id,
            product: {
              id: product._id,
              name: product.name,
              price: item.price / item.quantity
            },
            quantity: item.quantity,
            customizations: item.customizations,
            price: item.price
          };
        }),
        totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
      },
      pricing: {
        subtotal,
        tax,
        shippingCost,
        totalPrice
      },
      inventoryValidation: !inventoryValidation.valid ? {
        valid: false,
        errors: inventoryValidation.errors
      } : undefined,
      addressValidation: !addressValidation.valid ? {
        valid: false
      } : undefined
    });
  } catch (error) {
    console.error('Error validating checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate checkout',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Calculate shipping costs
 * @route POST /api/checkout/shipping
 */
export const calculateShipping = async (req: Request, res: Response) => {
  try {
    const { cartId, shippingAddress } = req.body;

    // Validate required fields
    if (!cartId) {
      return res.status(400).json({
        success: false,
        message: 'Cart ID is required'
      });
    }

    // Find the cart
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Calculate shipping cost based on cart total and address
    // This is a simplified implementation - in a real app, you might use a shipping API
    const subtotal = cart.totalPrice;
    
    // Free shipping over $50, otherwise base rate + location adjustment
    let shippingCost = 0;
    if (subtotal <= 50) {
      const baseRate = 5.99;
      
      // Add location-based adjustment if shipping address is provided
      let locationAdjustment = 0;
      if (shippingAddress && shippingAddress.country) {
        // Example: higher shipping cost for international orders
        if (shippingAddress.country.toLowerCase() !== 'usa' && 
            shippingAddress.country.toLowerCase() !== 'united states') {
          locationAdjustment = 10.00;
        }
      }
      
      shippingCost = baseRate + locationAdjustment;
    }

    res.status(200).json({
      success: true,
      shippingCost,
      freeShippingThreshold: 50,
      amountToFreeShipping: subtotal < 50 ? parseFloat((50 - subtotal).toFixed(2)) : 0
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate shipping cost',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Process checkout and create order
 * @route POST /api/checkout/process
 */
export const processCheckout = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      cartId,
      email,
      shippingAddress,
      billingAddress,
      paymentDetails
    } = req.body;

    // Validate required fields
    if (!cartId || !email || !shippingAddress || !billingAddress || !paymentDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required checkout fields'
      });
    }

    // Validate addresses
    const addressValidation = validateOrderAddresses(shippingAddress, billingAddress);
    if (!addressValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address information',
        errors: addressValidation.errors
      });
    }

    // Find the cart
    const cart = await Cart.findById(cartId).populate('items.product').session(session);
    if (!cart) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Check if cart is empty
    if (!cart.items || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Cannot checkout with empty cart'
      });
    }

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      productSnapshot: item.product,
      quantity: item.quantity,
      customizations: item.customizations,
      price: item.price
    }));

    // Validate inventory before creating order
    const inventoryValidation = await Order.validateInventory(
      cart.items.map(item => ({
        product: item.product._id.toString(),
        quantity: item.quantity
      }))
    );

    if (!inventoryValidation.valid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Some items are out of stock',
        errors: inventoryValidation.errors
      });
    }

    // Calculate order totals
    const subtotal = cart.totalPrice;
    const tax = parseFloat((subtotal * 0.08).toFixed(2)); // 8% tax rate
    const shippingCost = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const totalPrice = parseFloat((subtotal + tax + shippingCost).toFixed(2));

    // Create the order
    const order = new Order({
      user: req.user ? req.user._id : null,
      email,
      items: orderItems,
      shippingAddress,
      billingAddress,
      paymentDetails,
      subtotal,
      tax,
      shippingCost,
      totalPrice,
      status: 'pending'
    });

    await order.save({ session });

    // Clear the cart after successful order creation
    await Cart.findByIdAndUpdate(
      cartId,
      { $set: { items: [], totalPrice: 0 } },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        email: order.email,
        totalPrice: order.totalPrice,
        status: order.status
      }
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error('Error processing checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process checkout',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/server/src/config/database';
import Order from '@/server/src/models/Order';
import Cart from '@/server/src/models/Cart';
import { validateOrderAddresses } from '@/server/src/utils/addressValidator';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use the latest API version
});

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const {
      cartId,
      email,
      shippingAddress,
      billingAddress,
      paymentDetails,
      shippingMethod
    } = await req.json();

    // Validate required fields
    if (!cartId || !email || !shippingAddress || !billingAddress || !paymentDetails) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate addresses
    const addressValidation = validateOrderAddresses(shippingAddress, billingAddress);
    if (!addressValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid address information',
          errors: addressValidation.errors
        },
        { status: 400 }
      );
    }

    // Find the cart
    const cart = await Cart.findById(cartId).populate('items.product');
    if (!cart) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    // Check if cart is empty
    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot create order with empty cart' },
        { status: 400 }
      );
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
      return NextResponse.json(
        {
          success: false,
          message: 'Some items are out of stock',
          invalidItems: inventoryValidation.invalidItems
        },
        { status: 400 }
      );
    }

    // Calculate order totals
    const subtotal = cart.totalPrice;
    const tax = parseFloat((subtotal * 0.08).toFixed(2)); // 8% tax rate
    
    // Calculate shipping cost based on method and subtotal
    let shippingCost = 0;
    if (subtotal <= 50) {
      shippingCost = shippingMethod === 'express' ? 12.99 : 5.99;
    }
    
    const totalPrice = parseFloat((subtotal + tax + shippingCost).toFixed(2));

    // Verify Stripe payment if a payment intent ID is provided
    if (paymentDetails.stripePaymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentDetails.stripePaymentIntentId
        );

        // Verify payment status
        if (paymentIntent.status !== 'succeeded') {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Payment has not been completed',
              paymentStatus: paymentIntent.status
            },
            { status: 400 }
          );
        }

        // Verify payment amount (convert to cents)
        const expectedAmount = Math.round(totalPrice * 100);
        if (paymentIntent.amount !== expectedAmount) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Payment amount does not match order total',
              expected: expectedAmount,
              received: paymentIntent.amount
            },
            { status: 400 }
          );
        }

        // Update payment details with Stripe information
        paymentDetails.method = 'stripe';
        paymentDetails.transactionId = paymentIntent.id;
        paymentDetails.status = 'completed';
      } catch (error) {
        console.error('Error verifying Stripe payment:', error);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Failed to verify payment',
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 400 }
        );
      }
    } else {
      // For non-Stripe payments (should not happen in production)
      paymentDetails.method = paymentDetails.method || 'credit_card';
      paymentDetails.transactionId = `manual-${Date.now()}`;
      paymentDetails.status = 'pending';
    }

    // Create the order
    const order = new Order({
      user: null, // In a real app, you'd get this from the authenticated user
      email,
      items: orderItems,
      shippingAddress,
      billingAddress,
      paymentDetails: {
        method: paymentDetails.method,
        transactionId: paymentDetails.transactionId,
        status: paymentDetails.status
      },
      subtotal,
      tax,
      shippingCost,
      totalPrice,
      status: paymentDetails.status === 'completed' ? 'processing' : 'pending'
    });

    await order.save();

    // Clear the cart after successful order creation
    await Cart.findByIdAndUpdate(cartId, { 
      $set: { items: [], totalPrice: 0 } 
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
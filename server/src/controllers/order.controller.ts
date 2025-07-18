import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Cart from '../models/Cart';
import { validateOrderAddresses } from '../utils/addressValidator';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../utils/emailService';

/**
 * Create a new order
 * @route POST /api/orders
 */
export const createOrder = async (req: Request, res: Response) => {
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
        message: 'Missing required fields' 
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
        message: 'Cannot create order with empty cart' 
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
      return res.status(400).json({
        success: false,
        message: 'Some items are out of stock',
        invalidItems: inventoryValidation.invalidItems
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

    await order.save();

    // Clear the cart after successful order creation
    await Cart.findByIdAndUpdate(cartId, { 
      $set: { items: [], totalPrice: 0 } 
    });
    
    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(order);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the request if email sending fails
    }

    res.status(201).json({
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
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get user orders with filtering and sorting
 * @route GET /api/orders
 */
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Extract query parameters
    const { 
      status, 
      startDate, 
      endDate, 
      minPrice, 
      maxPrice, 
      sort = 'createdAt', 
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter: any = { user: req.user._id };
    
    // Filter by status if provided
    if (status) {
      filter.status = status;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate as string);
      }
    }
    
    // Filter by price range if provided
    if (minPrice || maxPrice) {
      filter.totalPrice = {};
      if (minPrice) {
        filter.totalPrice.$gte = parseFloat(minPrice as string);
      }
      if (maxPrice) {
        filter.totalPrice.$lte = parseFloat(maxPrice as string);
      }
    }

    // Validate sort field
    const validSortFields = ['createdAt', 'totalPrice', 'status', 'orderNumber'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'createdAt';
    
    // Validate sort order
    const sortOrder = (order as string).toLowerCase() === 'asc' ? 1 : -1;
    
    // Create sort object
    const sortOptions: any = {};
    sortOptions[sortField as string] = sortOrder;

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const orders = await Order.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('orderNumber items.quantity totalPrice status createdAt');

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      totalPages: Math.ceil(totalOrders / limitNum),
      currentPage: pageNum,
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get order by ID
 * @route GET /api/orders/:id
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid order ID format' 
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if the user is authorized to view this order
    if (req.user && order.user && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this order' 
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update order status
 * @route PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrier, sendNotification = true, notificationMessage } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid order ID format' 
      });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }

    // Check if user is admin (assuming middleware sets isAdmin flag)
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update order status' 
      });
    }

    // Find the order first to check if status is actually changing
    const existingOrder = await Order.findById(id);
    
    if (!existingOrder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Check if status is actually changing
    const statusChanged = existingOrder.status !== status;
    
    // Prepare update object
    const updateData: any = { status };
    
    // Add tracking number if provided and status is shipped
    if (status === 'shipped' && trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    // Add carrier if provided
    if (carrier) {
      updateData.carrier = carrier;
    }
    
    // Update the order
    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Send order status update email if requested and status changed
    if (sendNotification && statusChanged) {
      try {
        // If a custom notification message was provided, we could add it to the order object
        // before sending the email, but our current email template doesn't support this
        // If we wanted to support custom messages, we would need to modify the email template
        await sendOrderStatusUpdateEmail(order);
      } catch (emailError) {
        console.error('Failed to send order status update email:', emailError);
        // Don't fail the request if email sending fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        carrier: (order as any).carrier
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get order by order number (for guest users)
 * @route GET /api/orders/track/:orderNumber
 */
export const getOrderByOrderNumber = async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    const { email } = req.query;

    if (!orderNumber || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order number and email are required' 
      });
    }

    const order = await Order.findOne({ 
      orderNumber, 
      email: email.toString().toLowerCase() 
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or email does not match' 
      });
    }

    res.status(200).json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        items: order.items,
        totalPrice: order.totalPrice,
        status: order.status,
        shippingAddress: {
          firstName: order.shippingAddress.firstName,
          lastName: order.shippingAddress.lastName,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          country: order.shippingAddress.country
        },
        createdAt: order.createdAt,
        trackingNumber: order.trackingNumber
      }
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to track order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all orders (admin only) with advanced filtering and sorting
 * @route GET /api/admin/orders
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this resource' 
      });
    }

    // Extract query parameters
    const { 
      status, 
      startDate, 
      endDate, 
      minPrice, 
      maxPrice,
      email,
      orderNumber,
      userId,
      sort = 'createdAt', 
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    // Filter by status if provided
    if (status) {
      filter.status = status;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate as string);
      }
    }
    
    // Filter by price range if provided
    if (minPrice || maxPrice) {
      filter.totalPrice = {};
      if (minPrice) {
        filter.totalPrice.$gte = parseFloat(minPrice as string);
      }
      if (maxPrice) {
        filter.totalPrice.$lte = parseFloat(maxPrice as string);
      }
    }

    // Filter by email if provided
    if (email) {
      filter.email = { $regex: new RegExp(email as string, 'i') };
    }

    // Filter by order number if provided
    if (orderNumber) {
      filter.orderNumber = { $regex: new RegExp(orderNumber as string, 'i') };
    }

    // Filter by user ID if provided
    if (userId && mongoose.Types.ObjectId.isValid(userId as string)) {
      filter.user = userId;
    }

    // Validate sort field
    const validSortFields = ['createdAt', 'totalPrice', 'status', 'orderNumber', 'email'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'createdAt';
    
    // Validate sort order
    const sortOrder = (order as string).toLowerCase() === 'asc' ? 1 : -1;
    
    // Create sort object
    const sortOptions: any = {};
    sortOptions[sortField as string] = sortOrder;

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const orders = await Order.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'email firstName lastName')
      .select('-__v');

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limitNum),
      currentPage: pageNum,
      orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update order tracking information
 * @route PUT /api/orders/:id/tracking
 */
export const updateOrderTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { trackingNumber, carrier, sendNotification = true } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid order ID format' 
      });
    }

    // Validate required fields
    if (!trackingNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tracking number is required' 
      });
    }

    // Check if user is admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update order tracking' 
      });
    }

    // Find the order and update tracking info
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Track if status changed for notification purposes
    const statusChanged = order.status !== 'shipped';

    // Update tracking information
    order.trackingNumber = trackingNumber;
    if (carrier) {
      // Add carrier field if it doesn't exist in the schema
      (order as any).carrier = carrier;
    }

    // If order is in pending or processing state, update to shipped
    if (order.status === 'pending' || order.status === 'processing') {
      order.status = 'shipped';
    }

    await order.save();
    
    // Send order status update email if requested and status changed
    if (sendNotification && statusChanged) {
      try {
        await sendOrderStatusUpdateEmail(order);
      } catch (emailError) {
        console.error('Failed to send order status update email:', emailError);
        // Don't fail the request if email sending fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order tracking information updated successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        carrier: (order as any).carrier
      }
    });
  } catch (error) {
    console.error('Error updating order tracking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order tracking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
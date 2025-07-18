import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';

/**
 * Admin Controller
 * Handles admin-specific functionality
 */
export class AdminController {
  /**
   * Get dashboard metrics
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      // Get counts for dashboard metrics
      const userCount = await User.countDocuments();
      const productCount = await Product.countDocuments();
      const orderCount = await Order.countDocuments();
      
      // Get recent orders
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'email firstName lastName');
      
      // Get revenue metrics
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));
      
      const todayOrders = await Order.find({
        createdAt: { $gte: startOfToday, $lte: endOfToday }
      });
      
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      
      // Get monthly revenue
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const monthlyOrders = await Order.find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      
      // Get low stock products
      const lowStockProducts = await Product.find({
        'inventory.quantity': { $lte: '$inventory.lowStockThreshold' }
      }).limit(5);

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            userCount,
            productCount,
            orderCount,
            todayRevenue,
            monthlyRevenue
          },
          recentOrders,
          lowStockProducts
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users with filtering
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '',
        role,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      // Build query
      const query: any = {};
      
      // Add search filter
      if (search) {
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Add role filter
      if (role) {
        query.role = role;
      }
      
      // Calculate pagination
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;
      
      // Determine sort order
      const sortDirection = (sortOrder as string).toLowerCase() === 'asc' ? 1 : -1;
      
      // Execute query
      const users = await User.find(query)
        .select('-password')
        .sort({ [sortBy as string]: sortDirection })
        .skip(skip)
        .limit(limitNum);
      
      // Get total count for pagination
      const totalUsers = await User.countDocuments(query);
      
      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            total: totalUsers,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(totalUsers / limitNum)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user details by ID
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Get user's orders
      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10);
      
      res.status(200).json({
        success: true,
        data: {
          user,
          orders
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user details
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { firstName, lastName, email, role, active } = req.body;
      
      // Find user
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Update fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (email) user.email = email;
      if (role && ['customer', 'admin'].includes(role)) user.role = role;
      if (active !== undefined) user.active = active;
      
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders with filtering
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status,
        search = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        startDate,
        endDate
      } = req.query;
      
      // Build query
      const query: any = {};
      
      // Add status filter
      if (status) {
        query.status = status;
      }
      
      // Add date range filter
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate as string);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate as string);
        }
      }
      
      // Add search filter
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Calculate pagination
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;
      
      // Determine sort order
      const sortDirection = (sortOrder as string).toLowerCase() === 'asc' ? 1 : -1;
      
      // Execute query
      const orders = await Order.find(query)
        .populate('user', 'email firstName lastName')
        .sort({ [sortBy as string]: sortDirection })
        .skip(skip)
        .limit(limitNum);
      
      // Get total count for pagination
      const totalOrders = await Order.countDocuments(query);
      
      res.status(200).json({
        success: true,
        data: {
          orders,
          pagination: {
            total: totalOrders,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(totalOrders / limitNum)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order details by ID
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      
      const order = await Order.findById(orderId)
        .populate('user', 'email firstName lastName');
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const { status, trackingNumber } = req.body;
      
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      // Update status
      if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        order.status = status;
      }
      
      // Update tracking number if provided
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }
      
      await order.save();
      
      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all products with filtering
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '',
        category,
        featured,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      // Build query
      const query: any = {};
      
      // Add search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Add category filter
      if (category) {
        query.category = category;
      }
      
      // Add featured filter
      if (featured !== undefined) {
        query.featured = featured === 'true';
      }
      
      // Calculate pagination
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;
      
      // Determine sort order
      const sortDirection = (sortOrder as string).toLowerCase() === 'asc' ? 1 : -1;
      
      // Execute query
      const products = await Product.find(query)
        .sort({ [sortBy as string]: sortDirection })
        .skip(skip)
        .limit(limitNum);
      
      // Get total count for pagination
      const totalProducts = await Product.countDocuments(query);
      
      res.status(200).json({
        success: true,
        data: {
          products,
          pagination: {
            total: totalProducts,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(totalProducts / limitNum)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new product
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        description,
        basePrice,
        images,
        category,
        featured,
        customizationOptions,
        inventory
      } = req.body;
      
      // Create new product
      const product = new Product({
        name,
        description,
        basePrice,
        images,
        category,
        featured,
        customizationOptions,
        inventory
      });
      
      await product.save();
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product details by ID
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product details
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const {
        name,
        description,
        basePrice,
        images,
        category,
        featured,
        customizationOptions,
        inventory
      } = req.body;
      
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Update fields
      if (name) product.name = name;
      if (description) product.description = description;
      if (basePrice) product.basePrice = basePrice;
      if (images) product.images = images;
      if (category) product.category = category;
      if (featured !== undefined) product.featured = featured;
      if (customizationOptions) product.customizationOptions = customizationOptions;
      if (inventory) product.inventory = inventory;
      
      await product.save();
      
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a product
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      
      const product = await Product.findByIdAndDelete(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export default new AdminController();
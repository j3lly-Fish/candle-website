import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AuthError, ForbiddenError } from '../utils/errors';
import User from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

/**
 * Middleware to protect routes - verifies JWT token
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from request
    const token = authService.extractTokenFromRequest(req);
    
    if (!token) {
      throw new AuthError('Authentication required. Please log in.', 401);
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Check if token is an access token
    if (decoded.tokenType !== 'access') {
      throw new AuthError('Invalid token type. Please use an access token.', 401);
    }

    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new AuthError('User not found', 401);
    }

    // Check if user account is active
    if (!user.active) {
      throw new AuthError('This account has been deactivated', 401);
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param roles Array of allowed roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthError('User not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
};

/**
 * Middleware to check if user is accessing their own resource
 * @param paramIdField Request parameter field containing the resource owner ID
 */
export const isResourceOwner = (paramIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthError('User not authenticated', 401));
    }

    const resourceOwnerId = req.params[paramIdField];
    
    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user is the owner of the resource
    if (req.user._id.toString() !== resourceOwnerId) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    next();
  };
};

/**
 * Middleware to validate request body against a schema
 * @param schema Validation schema object with field names as keys
 */
export const validateRequest = (schema: Record<string, (value: any) => boolean | string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, string> = {};
    
    // Validate each field against its validator function
    Object.keys(schema).forEach(field => {
      const validator = schema[field];
      const value = req.body[field];
      
      // Run validator and collect error message if validation fails
      const result = validator(value);
      if (typeof result === 'string') {
        errors[field] = result;
      }
    });
    
    if (Object.keys(errors).length > 0) {
      return next(new AuthError('Validation failed', 400));
    }
    
    next();
  };
};
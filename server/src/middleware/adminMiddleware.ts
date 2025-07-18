import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

/**
 * Middleware to ensure user is an admin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ForbiddenError('Authentication required'));
  }

  if (req.user.role !== 'admin') {
    return next(new ForbiddenError('Admin access required'));
  }

  next();
};

/**
 * Middleware to validate admin dashboard requests
 */
export const validateAdminRequest = (schema: Record<string, (value: any) => boolean | string>) => {
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
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};
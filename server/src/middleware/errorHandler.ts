/**
 * Error Handler Middleware
 * 
 * This middleware handles errors and sends appropriate responses to clients.
 */

import { Request, Response, NextFunction } from 'express';
import logger, { errorLogger } from './loggingMiddleware';
import { sendErrorNotification } from '../utils/emailService';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: number;
}

// Error handler middleware
export default function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Default status code is 500 (Internal Server Error)
  const statusCode = err.statusCode || err.code || 500;
  
  // Log the error using our logger
  errorLogger(err, req, res, next);
  
  // For critical errors, send email notification
  if (statusCode >= 500) {
    sendErrorNotification(err, {
      method: req.method,
      url: req.url,
      query: req.query,
      user: req.user,
      ip: req.ip,
    }).catch(emailError => {
      logger.error('Failed to send error notification email:', emailError);
    });
  }
  
  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
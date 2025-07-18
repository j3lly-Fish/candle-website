/**
 * Base custom error class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication specific error
 */
export class AuthError extends AppError {
  constructor(message: string, statusCode: number = 401) {
    super(message, statusCode);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  errors: Record<string, string>;

  constructor(message: string, errors: Record<string, string> = {}, statusCode: number = 400) {
    super(message, statusCode);
    this.errors = errors;
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
  }
}

/**
 * Conflict error
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
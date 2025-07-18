import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request } from 'express';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import { AuthError, ValidationError } from '../utils/errors';

// JWT Secret from environment variables
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Authentication Service
 * Handles user authentication, token generation, and validation
 */
export class AuthService {
  /**
   * Register a new user
   * @param userData User registration data
   * @returns Newly created user (without password) and JWT token
   */
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: Partial<IUser>; token: string; refreshToken: string }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new AuthError('User with this email already exists', 400);
      }

      // Validate password strength
      this.validatePassword(userData.password);

      // Create new user
      const user = new User({
        email: userData.email,
        password: userData.password, // Will be hashed by pre-save hook
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      // Save user to database
      await user.save();

      // Generate JWT tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Return user data (without password) and tokens
      const userResponse = user.toObject();
      const { password: _, ...userWithoutPassword } = userResponse;

      return { user: userWithoutPassword, token, refreshToken };
    } catch (error) {
      if (error instanceof AuthError || error instanceof ValidationError) {
        throw error;
      }
      throw new AuthError(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Login a user
   * @param email User email
   * @param password User password
   * @returns User data (without password) and JWT token
   */
  async login(email: string, password: string): Promise<{ user: Partial<IUser>; token: string; refreshToken: string }> {
    try {
      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new AuthError('Invalid email or password', 401);
      }

      // Check if user account is active
      if (!user.active) {
        throw new AuthError('This account has been deactivated', 401);
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new AuthError('Invalid email or password', 401);
      }

      // Generate JWT tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Update last login timestamp
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      // Return user data (without password) and tokens
      const userResponse = user.toObject();
      const { password: _, ...userWithoutPassword } = userResponse;

      return { user: userWithoutPassword, token, refreshToken };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken Refresh token
   * @returns New access token and user data
   */
  async refreshToken(refreshToken: string): Promise<{ user: Partial<IUser>; token: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { 
        userId: string; 
        email: string; 
        tokenType: string;
      };
      
      // Check if token is a refresh token
      if (decoded.tokenType !== 'refresh') {
        throw new AuthError('Invalid token type', 400);
      }

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new AuthError('User not found', 404);
      }

      // Check if user account is active
      if (!user.active) {
        throw new AuthError('This account has been deactivated', 401);
      }

      // Generate new access token
      const token = this.generateToken(user);

      // Return user data and new token
      const userResponse = user.toObject();
      const { password: _, ...userWithoutPassword } = userResponse;

      return { user: userWithoutPassword, token };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError('Invalid or expired token', 401);
      }
      throw new AuthError(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Request password reset
   * @param email User email
   * @returns Success message and reset token (in development)
   */
  async requestPasswordReset(email: string): Promise<{ message: string; resetToken?: string }> {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal that the user doesn't exist for security reasons
        return { message: 'If your email is registered, you will receive a password reset link' };
      }

      // Generate reset token
      const resetToken = await user.generatePasswordResetToken();

      // In a real application, send an email with the reset link
      // For this implementation, we'll just return the token in development
      const isDevelopment = process.env.NODE_ENV === 'development';

      return { 
        message: 'If your email is registered, you will receive a password reset link',
        ...(isDevelopment && { resetToken })
      };
    } catch (error) {
      throw new AuthError(`Password reset request failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Reset password using token
   * @param token Reset token
   * @param newPassword New password
   * @returns Success message
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      // Hash the token to compare with stored token
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with valid reset token
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new AuthError('Invalid or expired token', 400);
      }

      // Validate password strength
      this.validatePassword(newPassword);

      // Update password and clear reset token fields
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new AuthError(`Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Delete user account
   * @param userId User ID
   * @param password Current password for verification
   * @returns Success message
   */
  async deleteAccount(userId: string, password: string): Promise<{ message: string }> {
    try {
      // Find user by ID with password
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new AuthError('User not found', 404);
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new AuthError('Incorrect password', 401);
      }

      // Soft delete - mark as inactive instead of removing from database
      user.active = false;
      await user.save({ validateBeforeSave: false });

      return { message: 'Account has been successfully deactivated' };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(`Account deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Reactivate user account
   * @param email User email
   * @param password User password
   * @returns Success message and user data
   */
  async reactivateAccount(email: string, password: string): Promise<{ message: string; user: Partial<IUser>; token: string }> {
    try {
      // Find user by email including inactive accounts
      const user = await User.findOne({ email }).select('+password +active');
      if (!user) {
        throw new AuthError('Invalid email or password', 401);
      }

      // Check if account is already active
      if (user.active) {
        throw new AuthError('Account is already active', 400);
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new AuthError('Invalid email or password', 401);
      }

      // Reactivate account
      user.active = true;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      // Generate token
      const token = this.generateToken(user);

      // Return user data
      const userResponse = user.toObject();
      const { password: _, ...userWithoutPassword } = userResponse;

      return { 
        message: 'Account has been successfully reactivated',
        user: userResponse,
        token
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(`Account reactivation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Validate password strength
   * @param password Password to validate
   * @throws ValidationError if password doesn't meet requirements
   */
  validatePassword(password: string): void {
    const errors: Record<string, string> = {};

    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    }

    if (!/[a-z]/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    }

    if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.password = 'Password must contain at least one special character';
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Password validation failed', errors);
    }
  }

  /**
   * Generate JWT access token for a user
   * @param user User document
   * @returns JWT token
   */
  generateToken(user: IUser): string {
    return (jwt.sign as any)(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        tokenType: 'access'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Generate JWT refresh token for a user
   * @param user User document
   * @returns JWT refresh token
   */
  generateRefreshToken(user: IUser): string {
    return (jwt.sign as any)(
      {
        userId: user._id,
        email: user.email,
        tokenType: 'refresh'
      },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
  }

  /**
   * Verify JWT token
   * @param token JWT token
   * @returns Decoded token payload
   */
  verifyToken(token: string): { userId: string; email: string; role: string; tokenType: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string; tokenType: string };
    } catch (error) {
      throw new AuthError('Invalid or expired token', 401);
    }
  }

  /**
   * Extract token from request
   * @param req Express request
   * @returns JWT token or null
   */
  extractTokenFromRequest(req: Request): string | null {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return req.headers.authorization.split(' ')[1];
    }
    return null;
  }
}

// Export singleton instance
export default new AuthService();
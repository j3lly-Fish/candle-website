import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { protect } from '../middleware/authMiddleware';
import { ValidationError } from '../utils/errors';
import User from '../models/User';

const router = Router();

/**
 * Validate registration input
 */
const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName } = req.body;
  const errors: Record<string, string> = {};

  if (!email) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';
  if (!firstName) errors.firstName = 'First name is required';
  if (!lastName) errors.lastName = 'Last name is required';

  if (Object.keys(errors).length > 0) {
    return next(new ValidationError('Validation failed', errors));
  }

  next();
};

/**
 * Validate login input
 */
const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const errors: Record<string, string> = {};

  if (!email) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';

  if (Object.keys(errors).length > 0) {
    return next(new ValidationError('Validation failed', errors));
  }

  next();
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegistration, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', validateLogin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh-token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return next(new ValidationError('Refresh token is required', { refreshToken: 'Refresh token is required' }));
    }

    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user / clear cookie
 * @access  Private
 */
router.post('/logout', protect, (req: Request, res: Response) => {
  // In a stateless JWT authentication system, the client is responsible for
  // removing the token. The server can't invalidate the token directly.
  // For a more secure approach, we could implement a token blacklist.
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next(new ValidationError('Email is required', { email: 'Email is required' }));
    }

    const result = await authService.requestPasswordReset(email);

    // In development, return the reset token for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(200).json({
      success: true,
      message: result.message,
      ...(isDevelopment && result.resetToken && { resetToken: result.resetToken })
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset user password with token
 * @access  Public
 */
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token) {
      return next(new ValidationError('Token is required', { token: 'Token is required' }));
    }

    if (!newPassword) {
      return next(new ValidationError('New password is required', { newPassword: 'New password is required' }));
    }

    const result = await authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/update-profile', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user._id;

    // Only allow updating specific fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return next(new ValidationError('Current password and new password are required', {
        ...((!currentPassword) && { currentPassword: 'Current password is required' }),
        ...((!newPassword) && { newPassword: 'New password is required' })
      }));
    }

    // Get user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return next(new ValidationError('User not found'));
    }

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return next(new ValidationError('Current password is incorrect', {
        currentPassword: 'Current password is incorrect'
      }));
    }

    try {
      // Validate password strength
      authService.validatePassword(newPassword);
      
      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/auth/delete-account
 * @desc    Delete (deactivate) user account
 * @access  Private
 */
router.delete('/delete-account', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;

    if (!password) {
      return next(new ValidationError('Password is required', { password: 'Password is required' }));
    }

    const result = await authService.deleteAccount(userId, password);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/reactivate-account
 * @desc    Reactivate a deactivated user account
 * @access  Public
 */
router.post('/reactivate-account', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(new ValidationError('Email and password are required', {
        ...((!email) && { email: 'Email is required' }),
        ...((!password) && { password: 'Password is required' })
      }));
    }

    const result = await authService.reactivateAccount(email, password);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/auth/update-address
 * @desc    Add or update user address
 * @access  Private
 */
router.put('/update-address', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.body;
    const userId = req.user._id;

    if (!address) {
      return next(new ValidationError('Address is required', { address: 'Address is required' }));
    }

    // Required address fields
    const requiredFields = ['type', 'street', 'city', 'state', 'zipCode', 'country'];
    const missingFields = requiredFields.filter(field => !address[field]);
    
    if (missingFields.length > 0) {
      const errors = missingFields.reduce((acc, field) => {
        acc[field] = `${field} is required`;
        return acc;
      }, {} as Record<string, string>);
      
      return next(new ValidationError('Address validation failed', errors));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ValidationError('User not found'));
    }

    // Initialize addresses array if it doesn't exist
    if (!user.addresses) {
      user.addresses = [];
    }
    
    // For now, just add the new address (in a real app, you might want to implement proper address management)
    const existingAddressIndex = -1;

    if (existingAddressIndex >= 0) {
      // Update existing address
      user.addresses[existingAddressIndex] = {
        ...user.addresses[existingAddressIndex],
        ...address
      };
    } else {
      // Add new address
      user.addresses.push(address);
    }

    // If this address is set as default, update other addresses
    if (address.isDefault) {
      user.addresses.forEach((addr, index) => {
        if (existingAddressIndex !== index) {
          addr.isDefault = false;
        }
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: existingAddressIndex >= 0 ? 'Address updated successfully' : 'Address added successfully',
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/auth/delete-address/:addressId
 * @desc    Delete user address
 * @access  Private
 */
router.delete('/delete-address/:addressId', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return next(new ValidationError('User not found'));
    }

    // Find address index (addresses don't have _id in this implementation)
    const addressIndex = -1; // For now, return not found since addresses don't have IDs
    
    if (addressIndex === -1) {
      return next(new ValidationError('Address not found'));
    }

    // Remove address (check if addresses exist and index is valid)
    if (user.addresses && addressIndex >= 0) {
      user.addresses.splice(addressIndex, 1);
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
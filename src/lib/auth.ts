import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface AuthResult {
  success: boolean;
  user?: {
    userId: string;
    email: string;
    role: string;
  };
  token?: string;
  error?: string;
  status: number;
}

/**
 * Verify authentication from request headers
 * @param req Next.js request object
 * @returns Authentication result with user data if successful
 */
export async function verifyAuth(req: NextRequest): Promise<AuthResult> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Authentication required',
        status: 401
      };
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication required',
        status: 401
      };
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        userId: string;
        email: string;
        role: string;
        tokenType: string;
      };
      
      // Check if token is an access token
      if (decoded.tokenType !== 'access') {
        return {
          success: false,
          error: 'Invalid token type',
          status: 401
        };
      }
      
      return {
        success: true,
        user: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        },
        token,
        status: 200
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid or expired token',
        status: 401
      };
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      success: false,
      error: 'Authentication failed',
      status: 500
    };
  }
}
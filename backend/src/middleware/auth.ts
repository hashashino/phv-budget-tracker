import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { UnauthorizedError } from './errorHandler';
import { logger } from '@/utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization token required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedError('Authorization token required');
    }

    // Verify token
    const decoded = await authService.verifyToken(token);

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      logger.warn('Authentication failed', {
        ip: req.ip,
        url: req.url,
        userAgent: req.get('User-Agent'),
        error: error.message,
      });
    }
    next(error);
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        const decoded = await authService.verifyToken(token);
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    logger.debug('Optional authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next();
  }
};

// Middleware to check if user is verified
export const requireVerified = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  // This would require additional user lookup if verification status is needed
  // For now, we'll assume all authenticated users are verified
  next();
};

// Middleware to check specific permissions (future implementation)
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Future implementation: check user permissions
    // For now, all authenticated users have all permissions
    next();
  };
};
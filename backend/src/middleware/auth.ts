import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { UnauthorizedError } from './errorHandler';
import { logger } from '../utils/logger';

// Extend Express Request interface to include user with role
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        financialAccessLevel: number;
        isActive: boolean;
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

    // Get user with role information
    const user = await authService.getUserWithRole(decoded.userId);
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Attach user to request with role info
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      financialAccessLevel: user.financialAccessLevel,
      isActive: user.isActive,
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
        
        // Get user with role information
        const user = await authService.getUserWithRole(decoded.userId);
        
        if (user && user.isActive) {
          req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            financialAccessLevel: user.financialAccessLevel,
            isActive: user.isActive,
          };
        }
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

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new UnauthorizedError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
    }

    next();
  };
};

// Financial data access control
export const requireFinancialAccess = (requiredLevel: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (req.user.financialAccessLevel < requiredLevel) {
      throw new UnauthorizedError('Insufficient financial data access permissions');
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = requireRole(['SUPER_ADMIN', 'FINANCE_MANAGER', 'OPERATIONS_ADMIN']);

// Super admin only
export const requireSuperAdmin = requireRole(['SUPER_ADMIN']);

// Financial access (can view financial data)
export const requireFinancialRole = requireRole(['SUPER_ADMIN', 'FINANCE_MANAGER']);

// No financial access (for operations and support)
export const requireNonFinancialRole = requireRole(['OPERATIONS_ADMIN', 'CUSTOMER_SUPPORT', 'TECHNICAL_ADMIN']);

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
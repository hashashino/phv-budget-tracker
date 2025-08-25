import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { cacheService } from '../utils/redis';
import { TooManyRequestsError } from './errorHandler';
import { logger } from '../utils/logger';

// Standard rate limit middleware using express-rate-limit
export const createRateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      error: {
        message: options.message || 'Too many requests, please try again later',
        type: 'rate_limit_exceeded',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        url: req.url,
        userAgent: req.get('User-Agent'),
      });
      
      throw new TooManyRequestsError(
        options.message || 'Too many requests, please try again later'
      );
    },
  });
};

// Redis-based rate limiting for more advanced scenarios
export const redisRateLimit = (options: {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
}) => {
  const keyGenerator = options.keyGenerator || ((req: Request) => req.ip);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = `rate_limit:${keyGenerator(req)}`;
      const result = await cacheService.checkRateLimit(key, options.windowMs, options.max);

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': options.max.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
      });

      if (!result.allowed) {
        logger.warn('Redis rate limit exceeded', {
          ip: req.ip,
          url: req.url,
          key,
          remaining: result.remaining,
        });

        throw new TooManyRequestsError(
          options.message || 'Too many requests, please try again later'
        );
      }

      next();
    } catch (error) {
      if (error instanceof TooManyRequestsError) {
        throw error;
      }
      
      // If Redis fails, log error but don't block request
      logger.error('Redis rate limit check failed:', error);
      next();
    }
  };
};

// Predefined rate limit configurations
export const authRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 attempts per window (for development)
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true,
});

export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many API requests, please try again later',
});

export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: 'Too many file uploads, please try again later',
});

export const expensiveOperationRateLimit = redisRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many resource-intensive requests, please try again later',
});
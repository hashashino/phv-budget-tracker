import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ValidationError } from './errorHandler';
import crypto from 'crypto';

// CSRF Protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.headers['x-session-token'] as string;

  if (!csrfToken || !sessionToken) {
    throw new ForbiddenError('CSRF token required');
  }

  // Verify CSRF token (simplified implementation)
  const expectedToken = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret')
    .update(sessionToken)
    .digest('hex');

  if (csrfToken !== expectedToken) {
    logger.warn('CSRF token mismatch', {
      ip: req.ip,
      url: req.url,
      userAgent: req.get('User-Agent'),
    });
    throw new ForbiddenError('Invalid CSRF token');
  }

  next();
};

// IP Whitelist middleware
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip;
    
    if (!allowedIPs.includes(clientIP)) {
      logger.warn('IP not whitelisted', {
        ip: clientIP,
        url: req.url,
        allowedIPs,
      });
      throw new ForbiddenError('Access denied from this IP address');
    }

    next();
  };
};

// Request size limit middleware
export const requestSizeLimit = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    
    if (contentLength > maxSize) {
      throw new ValidationError(`Request too large. Maximum size: ${maxSize} bytes`);
    }

    next();
  };
};

// Sanitize user input middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove potentially dangerous characters
      return obj.replace(/[<>]/g, '').trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Security headers middleware (additional to helmet)
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // HSTS (HTTPS only)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

// Request ID middleware for tracing
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string || crypto.randomUUID();
  
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  // Add to logger context
  logger.defaultMeta = { ...logger.defaultMeta, requestId };

  next();
};

// User activity logging middleware
export const auditLog = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('API Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId,
      contentLength: res.get('Content-Length'),
    });
  });

  next();
};

// Prevent parameter pollution
export const preventParameterPollution = (whitelist: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (Array.isArray(value) && !whitelist.includes(key)) {
          // Keep only the last value if not whitelisted
          req.query[key] = value[value.length - 1];
        }
      }
    }

    next();
  };
};

// Timeout middleware
export const timeout = (ms: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout', {
          method: req.method,
          url: req.url,
          timeout: ms,
          ip: req.ip,
          userId: req.user?.userId,
        });
        
        res.status(408).json({
          success: false,
          error: {
            message: 'Request timeout',
            type: 'timeout_error',
          },
          timestamp: new Date().toISOString(),
        });
      }
    }, ms);

    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    next();
  };
};
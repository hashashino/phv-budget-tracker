import Redis from 'ioredis';
import { config } from '../config/environment';
import { logger } from './logger';

const redis = new Redis(config.redis.url, {
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  family: 6, // Enable IPv6 if needed
});

redis.on('connect', () => {
  logger.info('Redis connection established');
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

export const redisClient = redis;

// Cache utilities
export class CacheService {
  private readonly defaultTTL = 3600; // 1 hour

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttl = this.defaultTTL): Promise<boolean> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await redis.del(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    try {
      await redis.flushall();
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  // Rate limiting utilities
  async checkRateLimit(
    key: string,
    windowMs: number,
    maxRequests: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const multi = redis.multi();
      const currentTime = Date.now();
      const windowStart = currentTime - windowMs;

      // Remove old entries
      multi.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests
      multi.zcard(key);
      
      // Add current request
      multi.zadd(key, currentTime, `${currentTime}-${Math.random()}`);
      
      // Set expiry
      multi.expire(key, Math.ceil(windowMs / 1000));

      const results = await multi.exec();
      
      if (!results) {
        throw new Error('Redis multi exec failed');
      }

      const count = results[1]?.[1] as number || 0;
      const allowed = count < maxRequests;
      const remaining = Math.max(0, maxRequests - count - 1);
      const resetTime = currentTime + windowMs;

      return { allowed, remaining, resetTime };
    } catch (error) {
      logger.error('Rate limit check error:', error);
      // Fail open - allow request if Redis is down
      return { allowed: true, remaining: maxRequests - 1, resetTime: Date.now() + windowMs };
    }
  }
}

export const cacheService = new CacheService();
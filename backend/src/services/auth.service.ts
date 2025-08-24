import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { config } from '@/config/environment';
import { prisma } from '@/config/database';
import { UnauthorizedError, ConflictError, NotFoundError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { cacheService } from '@/utils/redis';

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  licenseNumber?: string;
  vehicleNumber?: string;
  phvCompany?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  private readonly saltRounds = 12;
  private readonly refreshTokenTTL = 7 * 24 * 60 * 60; // 7 days in seconds
  private readonly accessTokenTTL = 60 * 60; // 1 hour in seconds

  async register(data: RegisterData): Promise<AuthResponse> {
    const { email, password, ...userData } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        ...userData,
      },
    });

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    // Generate tokens
    const { token, refreshToken } = await this.generateTokens(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    // Generate tokens
    const { token, refreshToken } = await this.generateTokens(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as TokenPayload;

      // Check if refresh token is blacklisted (Redis first, then database)
      let isBlacklisted = await cacheService.exists(`refresh_token_blacklist:${refreshToken}`);
      
      if (!isBlacklisted) {
        // Check database as fallback
        const blacklistedToken = await prisma.tokenBlacklist.findUnique({
          where: { token: refreshToken },
        });
        isBlacklisted = !!blacklistedToken && blacklistedToken.expiresAt > new Date();
      }
      
      if (isBlacklisted) {
        throw new UnauthorizedError('Refresh token is invalid');
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Blacklist old refresh token
      const redisSuccess = await cacheService.set(
        `refresh_token_blacklist:${refreshToken}`,
        true,
        this.refreshTokenTTL
      );

      // Fallback to database if Redis fails
      if (!redisSuccess) {
        try {
          await prisma.tokenBlacklist.create({
            data: {
              token: refreshToken,
              userId: decoded.userId,
              type: 'REFRESH_TOKEN',
              expiresAt: new Date(Date.now() + this.refreshTokenTTL * 1000),
            },
          });
        } catch (error) {
          logger.warn('Failed to blacklist old refresh token in database', { error });
        }
      }

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Try Redis first
      const redisSuccess = await cacheService.set(
        `refresh_token_blacklist:${refreshToken}`,
        true,
        this.refreshTokenTTL
      );

      // Fallback to database if Redis fails
      if (!redisSuccess) {
        try {
          await prisma.tokenBlacklist.create({
            data: {
              token: refreshToken,
              userId,
              type: 'REFRESH_TOKEN',
              expiresAt: new Date(Date.now() + this.refreshTokenTTL * 1000),
            },
          });
        } catch (error) {
          logger.warn('Failed to blacklist token in database', { error });
        }
      }
    }

    // Invalidate all user sessions (optional)
    await cacheService.delete(`user_sessions:${userId}`);

    logger.info('User logged out successfully', { userId });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    logger.info('Password changed successfully', { userId });
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;

      // Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw error;
    }
  }

  async generateTokens(user: User): Promise<{ token: string; refreshToken: string }> {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expire,
    });

    const refreshToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: '7d',
    });

    // Store token in cache for session management
    await cacheService.set(`user_token:${user.id}`, token, this.accessTokenTTL);

    return { token, refreshToken };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserWithRole(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async updateProfile(
    userId: string,
    data: Partial<Omit<User, 'id' | 'password' | 'createdAt' | 'updatedAt'>>
  ): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
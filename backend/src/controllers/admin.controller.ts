import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { UserRole } from '../types';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    financialAccessLevel: number;
    isActive: boolean;
  };
}

class AdminController {
  // Admin authentication
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find admin user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isVerified: true
        }
      });

      if (!user || user.role === 'USER') {
        res.status(401).json({
          success: false,
          error: 'Invalid admin credentials'
        });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({
          success: false,
          error: 'Account is deactivated'
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid admin credentials'
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role, 
          email: user.email,
          type: 'admin' 
        },
        process.env.JWT_SECRET!,
        { expiresIn: '8h' }
      );

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Log admin login
      logger.info('Admin login successful', { 
        adminId: user.id, 
        email: user.email, 
        role: user.role 
      });

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        }
      });
    } catch (error) {
      logger.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async logout(req: AuthenticatedRequest, res: Response) {
    try {
      // Add token to blacklist if needed
      // Implementation depends on your token blacklisting strategy
      
      logger.info('Admin logout', { adminId: req.user?.userId });
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Admin logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Dashboard stats
  async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userRole = req.user?.role;

      const baseStats = {
        totalUsers: await prisma.user.count({ where: { role: 'USER' } }),
        activeUsers: await prisma.user.count({ 
          where: { 
            role: 'USER', 
            isActive: true,
            lastLoginAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          } 
        }),
        recentRegistrations: await prisma.user.count({
          where: {
            role: 'USER',
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        })
      };

      // Add role-specific stats
      let additionalStats = {};

      if (userRole === 'FINANCE_MANAGER' || userRole === 'SUPER_ADMIN') {
        const financialStats = await Promise.all([
          prisma.expense.aggregate({
            _sum: { amount: true },
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          }),
          prisma.earning.aggregate({
            _sum: { netAmount: true },
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          })
        ]);

        additionalStats = {
          totalExpenses: financialStats[0]._sum.amount || 0,
          totalEarnings: financialStats[1]._sum.netAmount || 0
        };
      }

      res.json({
        success: true,
        data: { ...baseStats, ...additionalStats }
      });
    } catch (error) {
      logger.error('Error getting admin stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // User management
  async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const role = req.query.role as UserRole;
      const search = req.query.search as string;
      const offset = (page - 1) * limit;

      const where: any = {};

      if (role) {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isVerified: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            licenseNumber: true,
            vehicleNumber: true,
            phvCompany: true,
            countryCode: true,
            preferredLanguage: true,
            timezone: true
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isVerified: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          licenseNumber: true,
          vehicleNumber: true,
          phvCompany: true,
          countryCode: true,
          preferredLanguage: true,
          timezone: true,
          // Remove _count for now to avoid Prisma type issues
        }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role = 'USER', phone, licenseNumber, vehicleNumber, phvCompany } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: role as any,
          isVerified: true, // Admin-created users are pre-verified
          isActive: true,
          countryCode: 'SG',
          preferredLanguage: 'en',
          timezone: 'Asia/Singapore',
          financialAccessLevel: role === 'USER' ? 0 : 1,
          // PHV specific fields for USER role
          licenseNumber: role === 'USER' ? licenseNumber : null,
          vehicleNumber: role === 'USER' ? vehicleNumber : null,
          phvCompany: role === 'USER' ? phvCompany : null
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          licenseNumber: true,
          vehicleNumber: true,
          phvCompany: true
        }
      });

      logger.info('User created by admin', { 
        adminId: req.user?.userId, 
        newUserId: newUser.id,
        newUserEmail: email,
        role 
      });

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      logger.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updateUserRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true
        }
      });

      logger.info('User role updated', { 
        adminId: req.user?.userId, 
        userId: id, 
        newRole: role 
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Error updating user role:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updateUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { isActive },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true
        }
      });

      logger.info('User status updated', { 
        adminId: req.user?.userId, 
        userId: id, 
        isActive 
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Error updating user status:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Don't allow deleting yourself
      if (id === req.user?.userId) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete your own account'
        });
        return;
      }

      // Delete the user (this will cascade delete related data)
      await prisma.user.delete({
        where: { id }
      });

      logger.info('User deleted', { 
        adminId: req.user?.userId, 
        deletedUserId: id 
      });

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Financial reports
  async getFinancialReports(req: AuthenticatedRequest, res: Response) {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const [expenseStats, earningStats] = await Promise.all([
        prisma.expense.aggregate({
          _sum: { amount: true },
          _count: true,
          where: {
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        prisma.earning.aggregate({
          _sum: { netAmount: true },
          _count: true,
          where: {
            createdAt: { gte: startDate, lte: endDate }
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          expenses: {
            total: expenseStats._sum.amount || 0,
            count: expenseStats._count
          },
          earnings: {
            total: earningStats._sum.netAmount || 0,
            count: earningStats._count
          },
          period: { startDate, endDate }
        }
      });
    } catch (error) {
      logger.error('Error getting financial reports:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // System health
  async getSystemHealth(req: AuthenticatedRequest, res: Response) {
    try {
      // Mock system health data - replace with actual monitoring
      const healthData = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: {
          status: 'healthy',
          connections: 10 // Replace with actual connection pool status
        },
        api: {
          responseTime: '150ms',
          errorRate: 0.12
        },
        services: {
          redis: 'healthy',
          storage: 'healthy',
          email: 'healthy'
        }
      };

      res.json({
        success: true,
        data: healthData
      });
    } catch (error) {
      logger.error('Error getting system health:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Placeholder methods for future implementation
  async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    res.json({
      success: true,
      data: {
        logs: [],
        message: 'Audit logging not implemented yet'
      }
    });
  }

  async getSupportTickets(req: AuthenticatedRequest, res: Response) {
    res.json({
      success: true,
      data: {
        tickets: [],
        message: 'Support ticketing not implemented yet'
      }
    });
  }

  async updateTicketStatus(req: AuthenticatedRequest, res: Response) {
    res.json({
      success: true,
      message: 'Support ticketing not implemented yet'
    });
  }
}

export const adminController = new AdminController();
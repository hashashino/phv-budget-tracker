import { prisma } from '../config/database';
import { User } from '@prisma/client';

class UserService {
  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
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
        lastFinancialAccess: true,
        financialAccessLevel: true,
        requiresApproval: true,
        approvedBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return users;
  }
}

export const userService = new UserService();

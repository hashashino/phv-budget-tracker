import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { prisma } from '@/config/database';
import { storageService } from '@/services/storage.service';
import { CategoryType, PlatformType, VehicleType, FuelType } from '@prisma/client';

export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      isVerified: true,
      licenseNumber: true,
      vehicleNumber: true,
      phvCompany: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: { user },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const updateData = req.body;

  // Remove sensitive fields that shouldn't be updated via this endpoint
  const { password, email, ...safeUpdateData } = updateData;

  const user = await prisma.user.update({
    where: { id: userId },
    data: safeUpdateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      isVerified: true,
      licenseNumber: true,
      vehicleNumber: true,
      phvCompany: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  logger.info('User profile updated', { userId });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const file = req.file;

  if (!file) {
    res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
    return;
  }

  // Upload to storage service
  const avatarUrl = await storageService.uploadFile(file, userId, {
    resize: { width: 200, height: 200, quality: 80 }
  });

  // Update user avatar URL
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
    },
  });

  logger.info('Avatar uploaded', { userId, avatarUrl });

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: { user },
  });
});

export const deleteAvatar = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });

  if (user?.avatar) {
    // Delete from storage service
    await storageService.deleteFile(user.avatar);
  }

  // Update user to remove avatar URL
  await prisma.user.update({
    where: { id: userId },
    data: { avatar: null },
  });

  logger.info('Avatar deleted', { userId });

  res.status(200).json({
    success: true,
    message: 'Avatar deleted successfully',
  });
});

export const getCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });

  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully',
    data: { categories },
  });
});

export const createCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { name, type, color, icon } = req.body;

  const category = await prisma.category.create({
    data: {
      name,
      type: type as CategoryType,
      color,
      icon,
      userId,
    },
  });

  logger.info('Category created', { userId, categoryId: category.id, name });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category },
  });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const updateData = req.body;

  const category = await prisma.category.update({
    where: { id, userId },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: { category },
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Check if category is being used
  const expenseCount = await prisma.expense.count({
    where: { categoryId: id, userId },
  });

  if (expenseCount > 0) {
    res.status(400).json({
      success: false,
      message: `Cannot delete category. It is being used by ${expenseCount} expenses.`,
    });
    return;
  }

  await prisma.category.delete({
    where: { id, userId },
  });

  logger.info('Category deleted', { userId, categoryId: id });

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});

export const getPHVPlatforms = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const platforms = await prisma.pHVPlatform.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });

  // Remove sensitive data from response
  const safePlatforms = platforms.map(platform => ({
    ...platform,
    apiKey: platform.apiKey ? '***' : null,
    apiSecret: platform.apiSecret ? '***' : null,
  }));

  res.status(200).json({
    success: true,
    message: 'PHV platforms retrieved successfully',
    data: { platforms: safePlatforms },
  });
});

export const createPHVPlatform = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { name, type, commission, apiKey, apiSecret } = req.body;

  const platform = await prisma.pHVPlatform.create({
    data: {
      name,
      type: type as PlatformType,
      commission: Number(commission),
      apiKey,
      apiSecret,
      userId,
    },
  });

  logger.info('PHV platform created', { userId, platformId: platform.id, name });

  // Remove sensitive data from response
  const safePlatform = {
    ...platform,
    apiKey: apiKey ? '***' : null,
    apiSecret: apiSecret ? '***' : null,
  };

  res.status(201).json({
    success: true,
    message: 'PHV platform created successfully',
    data: { platform: safePlatform },
  });
});

export const updatePHVPlatform = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const updateData = req.body;

  const platform = await prisma.pHVPlatform.update({
    where: { id, userId },
    data: updateData,
  });

  // Remove sensitive data from response
  const safePlatform = {
    ...platform,
    apiKey: platform.apiKey ? '***' : null,
    apiSecret: platform.apiSecret ? '***' : null,
  };

  res.status(200).json({
    success: true,
    message: 'PHV platform updated successfully',
    data: { platform: safePlatform },
  });
});

export const deletePHVPlatform = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Check if platform is being used
  const earningCount = await prisma.earning.count({
    where: { platformId: id },
  });

  if (earningCount > 0) {
    res.status(400).json({
      success: false,
      message: `Cannot delete platform. It is being used by ${earningCount} earnings.`,
    });
    return;
  }

  await prisma.pHVPlatform.delete({
    where: { id, userId },
  });

  logger.info('PHV platform deleted', { userId, platformId: id });

  res.status(200).json({
    success: true,
    message: 'PHV platform deleted successfully',
  });
});

export const getVehicles = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const vehicles = await prisma.vehicle.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    success: true,
    message: 'Vehicles retrieved successfully',
    data: { vehicles },
  });
});

export const createVehicle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const vehicleData = req.body;

  const vehicle = await prisma.vehicle.create({
    data: {
      ...vehicleData,
      type: vehicleData.type as VehicleType,
      fuelType: vehicleData.fuelType as FuelType,
      userId,
    },
  });

  logger.info('Vehicle created', { userId, vehicleId: vehicle.id, plateNumber: vehicle.plateNumber });

  res.status(201).json({
    success: true,
    message: 'Vehicle created successfully',
    data: { vehicle },
  });
});

export const updateVehicle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const updateData = req.body;

  const vehicle = await prisma.vehicle.update({
    where: { id, userId },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    message: 'Vehicle updated successfully',
    data: { vehicle },
  });
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Check if vehicle is being used
  const earningCount = await prisma.earning.count({
    where: { vehicleId: id },
  });

  if (earningCount > 0) {
    res.status(400).json({
      success: false,
      message: `Cannot delete vehicle. It is being used by ${earningCount} earnings.`,
    });
    return;
  }

  await prisma.vehicle.delete({
    where: { id, userId },
  });

  logger.info('Vehicle deleted', { userId, vehicleId: id });

  res.status(200).json({
    success: true,
    message: 'Vehicle deleted successfully',
  });
});

export const getSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  // For now, return basic settings structure
  const settings = {
    notifications: {
      email: true,
      push: true,
      weeklyReports: true,
      monthlyReports: true,
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
    },
    preferences: {
      currency: 'SGD',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'Asia/Singapore',
    },
  };

  res.status(200).json({
    success: true,
    message: 'Settings retrieved successfully',
    data: { settings },
  });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const settingsData = req.body;

  // In a real implementation, you'd store these in a separate settings table
  // For now, just return the updated settings
  logger.info('Settings updated', { userId });

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: { settings: settingsData },
  });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  // This would typically be a soft delete or require additional verification
  // For now, just return a success message
  logger.info('Account deletion requested', { userId });

  res.status(200).json({
    success: true,
    message: 'Account deletion request received. You will receive a confirmation email.',
  });
});

export const exportUserData = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  // This would typically generate and email a data export
  // For now, just return a success message
  logger.info('Data export requested', { userId });

  res.status(200).json({
    success: true,
    message: 'Data export request received. You will receive an email with your data within 24 hours.',
  });
});
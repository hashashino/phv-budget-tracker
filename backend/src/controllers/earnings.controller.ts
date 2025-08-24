import { Request, Response } from 'express';
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from '@/config/database';
import { asyncHandler, NotFoundError, ValidationError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
// import { phvAnalyticsService } from '@/services/phv-analytics.service';

export const getEarnings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const {
    page = 1,
    limit = 20,
    platformId,
    vehicleId,
    startDate,
    endDate,
    sortBy = 'date',
    sortOrder = 'desc',
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = { userId };

  if (platformId) {
    where.platformId = platformId as string;
  }

  if (vehicleId) {
    where.vehicleId = vehicleId as string;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  // Get earnings with pagination
  const [earnings, total] = await Promise.all([
    prisma.earning.findMany({
      where,
      include: {
        platform: true,
        vehicle: true,
      },
      orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.earning.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Earnings retrieved successfully',
    data: {
      earnings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

export const getEarning = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const earning = await prisma.earning.findFirst({
    where: { id, userId },
    include: {
      platform: true,
      vehicle: true,
    },
  });

  if (!earning) {
    throw new NotFoundError('Earning record not found');
  }

  res.status(200).json({
    success: true,
    message: 'Earning retrieved successfully',
    data: { earning },
  });
});

export const createEarning = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const {
    grossAmount,
    commission,
    incentive,
    tips,
    date,
    startTime,
    endTime,
    distance,
    trips,
    fuelCost,
    notes,
    platformId,
    vehicleId,
  } = req.body;

  // Validate platform belongs to user
  const platform = await prisma.pHVPlatform.findFirst({
    where: { id: platformId, userId },
  });

  if (!platform) {
    throw new ValidationError('Invalid platform');
  }

  // Validate vehicle belongs to user (if provided)
  if (vehicleId) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });

    if (!vehicle) {
      throw new ValidationError('Invalid vehicle');
    }
  }

  // Calculate working hours if start and end times are provided
  let workingHours = null;
  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    workingHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convert to hours
  }

  // Calculate net amount
  const netAmount = Number(grossAmount) - Number(commission || 0);
  const totalAmount = netAmount + Number(incentive || 0) + Number(tips || 0);

  const earning = await prisma.earning.create({
    data: {
      amount: totalAmount,
      grossAmount: Number(grossAmount),
      netAmount,
      commission: Number(commission || 0),
      incentive: Number(incentive || 0),
      tips: Number(tips || 0),
      date: new Date(date),
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      distance: distance ? Number(distance) : null,
      trips: trips ? Number(trips) : null,
      workingHours,
      fuelCost: fuelCost ? Number(fuelCost) : null,
      notes,
      userId,
      platformId,
      vehicleId: vehicleId || null,
    },
    include: {
      platform: true,
      vehicle: true,
    },
  });

  logger.info('Earning created', { userId, earningId: earning.id, amount: totalAmount });

  res.status(201).json({
    success: true,
    message: 'Earning created successfully',
    data: { earning },
  });
});

export const updateEarning = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const updateData = req.body;

  // Check if earning exists and belongs to user
  const existingEarning = await prisma.earning.findFirst({
    where: { id, userId },
  });

  if (!existingEarning) {
    throw new NotFoundError('Earning record not found');
  }

  // Validate platform if provided
  if (updateData.platformId) {
    const platform = await prisma.pHVPlatform.findFirst({
      where: { id: updateData.platformId, userId },
    });

    if (!platform) {
      throw new ValidationError('Invalid platform');
    }
  }

  // Validate vehicle if provided
  if (updateData.vehicleId) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: updateData.vehicleId, userId },
    });

    if (!vehicle) {
      throw new ValidationError('Invalid vehicle');
    }
  }

  // Recalculate values if necessary
  const grossAmount = updateData.grossAmount ? Number(updateData.grossAmount) : Number(existingEarning.grossAmount);
  const commission = updateData.commission !== undefined ? Number(updateData.commission) : Number(existingEarning.commission || 0);
  const incentive = updateData.incentive !== undefined ? Number(updateData.incentive) : Number(existingEarning.incentive || 0);
  const tips = updateData.tips !== undefined ? Number(updateData.tips) : Number(existingEarning.tips || 0);

  const netAmount = grossAmount - commission;
  const totalAmount = netAmount + incentive + tips;

  // Calculate working hours if times are updated
  let workingHours = existingEarning.workingHours;
  if (updateData.startTime || updateData.endTime) {
    const startTime = updateData.startTime ? new Date(updateData.startTime) : existingEarning.startTime;
    const endTime = updateData.endTime ? new Date(updateData.endTime) : existingEarning.endTime;
    
    if (startTime && endTime) {
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      workingHours = new Decimal(hours);
    }
  }

  const earning = await prisma.earning.update({
    where: { id },
    data: {
      amount: totalAmount,
      grossAmount,
      netAmount,
      commission,
      incentive,
      tips,
      workingHours,
      ...(updateData.date && { date: new Date(updateData.date) }),
      ...(updateData.startTime !== undefined && { startTime: updateData.startTime ? new Date(updateData.startTime) : null }),
      ...(updateData.endTime !== undefined && { endTime: updateData.endTime ? new Date(updateData.endTime) : null }),
      ...(updateData.distance !== undefined && { distance: updateData.distance ? Number(updateData.distance) : null }),
      ...(updateData.trips !== undefined && { trips: updateData.trips ? Number(updateData.trips) : null }),
      ...(updateData.fuelCost !== undefined && { fuelCost: updateData.fuelCost ? Number(updateData.fuelCost) : null }),
      ...(updateData.notes !== undefined && { notes: updateData.notes }),
      ...(updateData.platformId && { platformId: updateData.platformId }),
      ...(updateData.vehicleId !== undefined && { vehicleId: updateData.vehicleId }),
    },
    include: {
      platform: true,
      vehicle: true,
    },
  });

  logger.info('Earning updated', { userId, earningId: earning.id });

  res.status(200).json({
    success: true,
    message: 'Earning updated successfully',
    data: { earning },
  });
});

export const deleteEarning = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Check if earning exists and belongs to user
  const earning = await prisma.earning.findFirst({
    where: { id, userId },
  });

  if (!earning) {
    throw new NotFoundError('Earning record not found');
  }

  await prisma.earning.delete({
    where: { id },
  });

  logger.info('Earning deleted', { userId, earningId: id });

  res.status(200).json({
    success: true,
    message: 'Earning deleted successfully',
  });
});

export const getEarningStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId } = req.query;

  const where: any = { userId };

  if (platformId) {
    where.platformId = platformId as string;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  // const stats = await phvAnalyticsService.calculateEarningStats(userId, where);
  const stats = { total: 0, count: 0, average: 0 }; // Placeholder

  res.status(200).json({
    success: true,
    message: 'Earning statistics retrieved successfully',
    data: stats,
  });
});

export const bulkCreateEarnings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { earnings } = req.body;

  if (!Array.isArray(earnings) || earnings.length === 0) {
    throw new ValidationError('Earnings array is required');
  }

  // Validate all platforms belong to user
  const platformIds = [...new Set(earnings.map(e => e.platformId))];
  const platforms = await prisma.pHVPlatform.findMany({
    where: { id: { in: platformIds }, userId },
  });

  if (platforms.length !== platformIds.length) {
    throw new ValidationError('One or more invalid platforms');
  }

  // Process earnings
  const processedEarnings = earnings.map(earning => {
    const grossAmount = Number(earning.grossAmount);
    const commission = Number(earning.commission || 0);
    const incentive = Number(earning.incentive || 0);
    const tips = Number(earning.tips || 0);
    
    const netAmount = grossAmount - commission;
    const totalAmount = netAmount + incentive + tips;

    // Calculate working hours if provided
    let workingHours = null;
    if (earning.startTime && earning.endTime) {
      const start = new Date(earning.startTime);
      const end = new Date(earning.endTime);
      workingHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }

    return {
      amount: totalAmount,
      grossAmount,
      netAmount,
      commission,
      incentive,
      tips,
      date: new Date(earning.date),
      startTime: earning.startTime ? new Date(earning.startTime) : null,
      endTime: earning.endTime ? new Date(earning.endTime) : null,
      distance: earning.distance ? Number(earning.distance) : null,
      trips: earning.trips ? Number(earning.trips) : null,
      workingHours,
      fuelCost: earning.fuelCost ? Number(earning.fuelCost) : null,
      notes: earning.notes || null,
      userId,
      platformId: earning.platformId,
      vehicleId: earning.vehicleId || null,
    };
  });

  const createdEarnings = await prisma.earning.createMany({
    data: processedEarnings,
  });

  logger.info('Bulk earnings created', { userId, count: createdEarnings.count });

  res.status(201).json({
    success: true,
    message: `${createdEarnings.count} earnings created successfully`,
    data: { count: createdEarnings.count },
  });
});

// Alias for routes compatibility
export const bulkUploadEarnings = bulkCreateEarnings;

// Alias for routes compatibility
export const getEarningById = getEarning;

// Alias for routes compatibility
export const getEarningsSummary = getEarningStats;

export const getEarningsAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId } = req.query;

  const where: any = { userId };

  if (platformId) {
    where.platformId = platformId as string;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  // Get comprehensive analytics using existing service methods
  // const [basicStats, platformComparison, seasonalTrends] = await Promise.all([
  //   phvAnalyticsService.calculateEarningStats(userId, where),
  //   startDate && endDate ? phvAnalyticsService.getPlatformComparison(userId, new Date(startDate as string), new Date(endDate as string)) : [],
  //   phvAnalyticsService.getSeasonalTrends(userId),
  // ]);
  const basicStats = { total: 0, count: 0, average: 0 };
  const platformComparison: any[] = [];
  const seasonalTrends: any[] = [];

  res.status(200).json({
    success: true,
    message: 'Earnings analytics retrieved successfully',
    data: {
      stats: basicStats,
      platformComparison,
      seasonalTrends,
    },
  });
});

export const uploadEarningsScreenshot = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  
  // This would typically handle file upload and OCR processing
  // For now, return a placeholder response
  
  res.status(501).json({
    success: false,
    message: 'Screenshot upload feature not yet implemented',
    data: null,
  });
});
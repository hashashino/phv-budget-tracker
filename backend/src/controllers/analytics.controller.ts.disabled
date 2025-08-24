import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { prisma } from '@/config/database';
import { phvAnalyticsService } from '@/services/phv-analytics.service';

export const getDashboardAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, period = 'month' } = req.query;

  const dateRange = {
    start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: endDate ? new Date(endDate as string) : new Date(),
  };

  const [expenses, earnings, debts, bankBalance] = await Promise.all([
    prisma.expense.aggregate({
      where: {
        userId,
        date: { gte: dateRange.start, lte: dateRange.end },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.earning.aggregate({
      where: {
        userId,
        date: { gte: dateRange.start, lte: dateRange.end },
      },
      _sum: { netAmount: true },
      _count: true,
    }),
    prisma.debt.aggregate({
      where: { userId, isPaidOff: false },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        bankConnection: { userId },
        date: { gte: dateRange.start, lte: dateRange.end },
      },
      _sum: { amount: true },
    }),
  ]);

  const dashboard = {
    period: period as string,
    dateRange,
    summary: {
      totalExpenses: expenses._sum.amount || 0,
      totalEarnings: earnings._sum.netAmount || 0,
      netIncome: Number(earnings._sum.netAmount || 0) - Number(expenses._sum.amount || 0),
      totalDebt: debts._sum.amount || 0,
      expenseTransactions: expenses._count,
      earningTransactions: earnings._count,
    },
  };

  res.status(200).json({
    success: true,
    message: 'Dashboard analytics retrieved successfully',
    data: dashboard,
  });
});

export const getOverviewAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  const dateRange = {
    start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: endDate ? new Date(endDate as string) : new Date(),
  };

  const analytics = await phvAnalyticsService.getOverallMetrics(userId, dateRange.start, dateRange.end);

  res.status(200).json({
    success: true,
    message: 'Overview analytics retrieved successfully',
    data: analytics,
  });
});

export const getExpenseAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, categoryId, groupBy = 'category' } = req.query;

  const dateRange = {
    start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: endDate ? new Date(endDate as string) : new Date(),
  };

  const analytics = await phvAnalyticsService.getExpenseBreakdown(userId, dateRange.start, dateRange.end);

  res.status(200).json({
    success: true,
    message: 'Expense analytics retrieved successfully',
    data: analytics,
  });
});

export const getExpenseTrends = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  const trends = await phvAnalyticsService.getExpenseTrends(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.status(200).json({
    success: true,
    message: 'Expense trends retrieved successfully',
    data: trends,
  });
});

export const getExpenseByCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  const dateRange = {
    start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: endDate ? new Date(endDate as string) : new Date(),
  };

  const categoryBreakdown = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      date: { gte: dateRange.start, lte: dateRange.end },
    },
    _sum: { amount: true },
    _count: true,
    _avg: { amount: true },
  });

  const categories = await prisma.category.findMany({
    where: {
      id: { in: categoryBreakdown.map(item => item.categoryId) },
    },
  });

  const result = categoryBreakdown.map(item => {
    const category = categories.find(cat => cat.id === item.categoryId);
    return {
      categoryId: item.categoryId,
      categoryName: category?.name || 'Unknown',
      categoryColor: category?.color,
      categoryIcon: category?.icon,
      totalAmount: item._sum.amount || 0,
      transactionCount: item._count,
      averageAmount: item._avg.amount || 0,
    };
  });

  res.status(200).json({
    success: true,
    message: 'Expense by category retrieved successfully',
    data: { categories: result, dateRange },
  });
});

export const getMonthlyExpenseBreakdown = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const monthlyData = await phvAnalyticsService.getMonthlyExpenseBreakdown(userId);

  res.status(200).json({
    success: true,
    message: 'Monthly expense breakdown retrieved successfully',
    data: monthlyData,
  });
});

export const getEarningsAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId, vehicleId } = req.query;

  const analytics = await phvAnalyticsService.getEarningsAnalytics(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    platformId: platformId as string,
    vehicleId: vehicleId as string,
  });

  res.status(200).json({
    success: true,
    message: 'Earnings analytics retrieved successfully',
    data: analytics,
  });
});

export const getEarningsTrends = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId, vehicleId } = req.query;

  const trends = await phvAnalyticsService.getEarningsTrends(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    platformId: platformId as string,
    vehicleId: vehicleId as string,
  });

  res.status(200).json({
    success: true,
    message: 'Earnings trends retrieved successfully',
    data: trends,
  });
});

export const getEarningsByPlatform = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  const platformData = await phvAnalyticsService.getEarningsByPlatform(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.status(200).json({
    success: true,
    message: 'Earnings by platform retrieved successfully',
    data: platformData,
  });
});

export const getHourlyEarnings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId, vehicleId } = req.query;

  const hourlyData = await phvAnalyticsService.getHourlyEarnings(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    platformId: platformId as string,
    vehicleId: vehicleId as string,
  });

  res.status(200).json({
    success: true,
    message: 'Hourly earnings retrieved successfully',
    data: hourlyData,
  });
});

export const getDailyEarnings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId, vehicleId } = req.query;

  const dailyData = await phvAnalyticsService.getDailyEarnings(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    platformId: platformId as string,
    vehicleId: vehicleId as string,
  });

  res.status(200).json({
    success: true,
    message: 'Daily earnings retrieved successfully',
    data: dailyData,
  });
});

export const getPHVPerformance = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId, vehicleId } = req.query;

  const performance = await phvAnalyticsService.getPHVPerformance(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    platformId: platformId as string,
    vehicleId: vehicleId as string,
  });

  res.status(200).json({
    success: true,
    message: 'PHV performance metrics retrieved successfully',
    data: performance,
  });
});

export const getPHVEfficiency = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId, vehicleId } = req.query;

  const efficiency = await phvAnalyticsService.getPHVEfficiency(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    platformId: platformId as string,
    vehicleId: vehicleId as string,
  });

  res.status(200).json({
    success: true,
    message: 'PHV efficiency metrics retrieved successfully',
    data: efficiency,
  });
});

export const getPHVProfitability = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId, includeFixedCosts = true } = req.query;

  const profitability = await phvAnalyticsService.getPHVProfitability(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    platformId: platformId as string,
    includeFixedCosts: includeFixedCosts === 'true',
  });

  res.status(200).json({
    success: true,
    message: 'PHV profitability analysis retrieved successfully',
    data: profitability,
  });
});

export const getFuelAnalysis = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId, vehicleId } = req.query;

  const fuelAnalysis = await phvAnalyticsService.getFuelAnalysis(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    platformId: platformId as string,
    vehicleId: vehicleId as string,
  });

  res.status(200).json({
    success: true,
    message: 'Fuel analysis retrieved successfully',
    data: fuelAnalysis,
  });
});

export const getPeakHours = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId, vehicleId } = req.query;

  const peakHours = await phvAnalyticsService.getPeakHours(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    platformId: platformId as string,
    vehicleId: vehicleId as string,
  });

  res.status(200).json({
    success: true,
    message: 'Peak hours analysis retrieved successfully',
    data: peakHours,
  });
});

export const getRouteAnalysis = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId, vehicleId } = req.query;

  // This would typically integrate with mapping services
  // For now, return a basic structure
  const routeAnalysis = {
    message: 'Route analysis feature coming soon',
    parameters: {
      startDate,
      endDate,
      platformId,
      vehicleId,
    },
  };

  res.status(200).json({
    success: true,
    message: 'Route analysis retrieved successfully',
    data: routeAnalysis,
  });
});

export const getCashFlowAnalysis = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  const cashFlow = await phvAnalyticsService.getCashFlowAnalysis(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.status(200).json({
    success: true,
    message: 'Cash flow analysis retrieved successfully',
    data: cashFlow,
  });
});

export const getNetProfitAnalysis = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId, includeFixedCosts = true } = req.query;

  const netProfit = await phvAnalyticsService.getNetProfitAnalysis(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    platformId: platformId as string,
    includeFixedCosts: includeFixedCosts === 'true',
  });

  res.status(200).json({
    success: true,
    message: 'Net profit analysis retrieved successfully',
    data: netProfit,
  });
});

export const getTaxSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  const taxSummary = await phvAnalyticsService.getTaxSummary(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.status(200).json({
    success: true,
    message: 'Tax summary retrieved successfully',
    data: taxSummary,
  });
});

export const getBudgetVsActual = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  // Placeholder for budget vs actual analysis
  const budgetAnalysis = {
    message: 'Budget vs Actual feature coming soon',
    parameters: {
      startDate,
      endDate,
    },
  };

  res.status(200).json({
    success: true,
    message: 'Budget vs actual analysis retrieved successfully',
    data: budgetAnalysis,
  });
});

export const getEarningsProjections = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, platformId, vehicleId } = req.query;

  const projections = await phvAnalyticsService.getEarningsProjections(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    platformId: platformId as string,
    vehicleId: vehicleId as string,
  });

  res.status(200).json({
    success: true,
    message: 'Earnings projections retrieved successfully',
    data: projections,
  });
});

export const getExpenseProjections = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate, categoryId } = req.query;

  const projections = await phvAnalyticsService.getExpenseProjections(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    categoryId: categoryId as string,
  });

  res.status(200).json({
    success: true,
    message: 'Expense projections retrieved successfully',
    data: projections,
  });
});

export const getRecommendations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const recommendations = await phvAnalyticsService.getRecommendations(userId);

  res.status(200).json({
    success: true,
    message: 'Recommendations retrieved successfully',
    data: recommendations,
  });
});
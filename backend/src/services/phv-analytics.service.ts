import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import Decimal from 'decimal.js';

export interface PHVMetrics {
  totalEarnings: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  averageEarningsPerDay: number;
  averageEarningsPerTrip: number;
  averageWorkingHours: number;
  totalTrips: number;
  totalDistance: number;
  fuelEfficiency: number;
  topPlatform: string;
  bestDay: string;
  worstDay: string;
}

export interface PlatformComparison {
  platformName: string;
  totalEarnings: number;
  totalTrips: number;
  averageEarningsPerTrip: number;
  commission: number;
  netEarnings: number;
  marketShare: number;
}

export interface ExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface EarningsProjection {
  dailyAverage: number;
  weeklyProjection: number;
  monthlyProjection: number;
  yearlyProjection: number;
  confidenceLevel: number;
}

class PHVAnalyticsService {
  async getOverallMetrics(userId: string, startDate: Date, endDate: Date): Promise<PHVMetrics> {
    const [earnings, expenses, platforms] = await Promise.all([
      this.getEarningsData(userId, startDate, endDate),
      this.getExpensesData(userId, startDate, endDate),
      this.getPlatformsData(userId),
    ]);

    const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalEarnings - totalExpenses;
    const profitMargin = totalEarnings > 0 ? (netProfit / totalEarnings) * 100 : 0;

    const totalTrips = earnings.reduce((sum, e) => sum + (e.trips || 0), 0);
    const totalDistance = earnings.reduce((sum, e) => sum + Number(e.distance || 0), 0);
    const totalWorkingHours = earnings.reduce((sum, e) => sum + Number(e.workingHours || 0), 0);

    const workingDays = this.getWorkingDays(earnings);
    const averageEarningsPerDay = workingDays > 0 ? totalEarnings / workingDays : 0;
    const averageEarningsPerTrip = totalTrips > 0 ? totalEarnings / totalTrips : 0;
    const averageWorkingHours = workingDays > 0 ? totalWorkingHours / workingDays : 0;

    const fuelExpenses = expenses.filter(e => e.category?.name.toLowerCase().includes('fuel'));
    const totalFuelCost = fuelExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const fuelEfficiency = totalFuelCost > 0 && totalDistance > 0 ? totalDistance / totalFuelCost : 0;

    const topPlatform = await this.getTopPlatform(userId, startDate, endDate);
    const { bestDay, worstDay } = await this.getBestWorstDays(userId, startDate, endDate);

    return {
      totalEarnings,
      totalExpenses,
      netProfit,
      profitMargin,
      averageEarningsPerDay,
      averageEarningsPerTrip,
      averageWorkingHours,
      totalTrips,
      totalDistance,
      fuelEfficiency,
      topPlatform,
      bestDay,
      worstDay,
    };
  }

  async getPlatformComparison(userId: string, startDate: Date, endDate: Date): Promise<PlatformComparison[]> {
    const earnings = await prisma.earning.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        platform: true,
      },
    });

    const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
    const platformStats = new Map<string, any>();

    earnings.forEach(earning => {
      const platformName = earning.platform.name;
      if (!platformStats.has(platformName)) {
        platformStats.set(platformName, {
          platformName,
          totalEarnings: 0,
          totalTrips: 0,
          totalCommission: 0,
          grossEarnings: 0,
        });
      }

      const stats = platformStats.get(platformName);
      stats.totalEarnings += Number(earning.amount);
      stats.totalTrips += earning.trips || 0;
      stats.totalCommission += Number(earning.commission || 0);
      stats.grossEarnings += Number(earning.grossAmount);
    });

    return Array.from(platformStats.values()).map(stats => ({
      platformName: stats.platformName,
      totalEarnings: stats.totalEarnings,
      totalTrips: stats.totalTrips,
      averageEarningsPerTrip: stats.totalTrips > 0 ? stats.totalEarnings / stats.totalTrips : 0,
      commission: stats.totalCommission,
      netEarnings: stats.totalEarnings - stats.totalCommission,
      marketShare: totalEarnings > 0 ? (stats.totalEarnings / totalEarnings) * 100 : 0,
    })).sort((a, b) => b.totalEarnings - a.totalEarnings);
  }

  async getExpenseBreakdown(userId: string, startDate: Date, endDate: Date): Promise<ExpenseBreakdown[]> {
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        category: true,
      },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const categoryStats = new Map<string, number>();

    expenses.forEach(expense => {
      const categoryName = expense.category.name;
      categoryStats.set(categoryName, (categoryStats.get(categoryName) || 0) + Number(expense.amount));
    });

    const breakdown = Array.from(categoryStats.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      trend: 'stable' as const, // TODO: Implement trend calculation
    })).sort((a, b) => b.amount - a.amount);

    return breakdown;
  }

  async getEarningsProjection(userId: string): Promise<EarningsProjection> {
    // Get last 30 days of data for projection
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const earnings = await this.getEarningsData(userId, thirtyDaysAgo, new Date());

    if (earnings.length === 0) {
      return {
        dailyAverage: 0,
        weeklyProjection: 0,
        monthlyProjection: 0,
        yearlyProjection: 0,
        confidenceLevel: 0,
      };
    }

    const workingDays = this.getWorkingDays(earnings);
    const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
    const dailyAverage = workingDays > 0 ? totalEarnings / workingDays : 0;

    // Calculate standard deviation for confidence level
    const dailyEarnings = this.groupEarningsByDay(earnings);
    const variance = this.calculateVariance(dailyEarnings, dailyAverage);
    const standardDeviation = Math.sqrt(variance);
    const confidenceLevel = standardDeviation < dailyAverage * 0.3 ? 85 : 
                           standardDeviation < dailyAverage * 0.5 ? 70 : 50;

    return {
      dailyAverage,
      weeklyProjection: dailyAverage * 6, // Assuming 6 working days per week
      monthlyProjection: dailyAverage * 26, // Assuming 26 working days per month
      yearlyProjection: dailyAverage * 312, // Assuming 312 working days per year
      confidenceLevel,
    };
  }

  async calculateEarningStats(userId: string, whereClause: any): Promise<any> {
    const [
      aggregateStats,
      earningsByPlatform,
      earningsByDay,
      earningsByHour,
    ] = await Promise.all([
      prisma.earning.aggregate({
        where: whereClause,
        _sum: {
          amount: true,
          grossAmount: true,
          commission: true,
          tips: true,
          distance: true,
          workingHours: true,
        },
        _avg: {
          amount: true,
          workingHours: true,
        },
        _count: {
          trips: true,
        },
      }),
      this.getEarningsByPlatform(userId, whereClause),
      this.getEarningsByDay(userId, whereClause),
      this.getEarningsByHour(userId, whereClause),
    ]);

    return {
      summary: {
        totalEarnings: aggregateStats._sum.amount || 0,
        totalGrossEarnings: aggregateStats._sum.grossAmount || 0,
        totalCommission: aggregateStats._sum.commission || 0,
        totalTips: aggregateStats._sum.tips || 0,
        totalDistance: aggregateStats._sum.distance || 0,
        totalWorkingHours: aggregateStats._sum.workingHours || 0,
        averageEarnings: aggregateStats._avg.amount || 0,
        averageWorkingHours: aggregateStats._avg.workingHours || 0,
        totalTrips: aggregateStats._count.trips || 0,
      },
      breakdowns: {
        byPlatform: earningsByPlatform,
        byDay: earningsByDay,
        byHour: earningsByHour,
      },
    };
  }

  private async getEarningsData(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return prisma.earning.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        platform: true,
        vehicle: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  private async getExpensesData(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  private async getPlatformsData(userId: string): Promise<any[]> {
    return prisma.pHVPlatform.findMany({
      where: { userId },
    });
  }

  private getWorkingDays(earnings: any[]): number {
    const uniqueDays = new Set(earnings.map(e => e.date.toDateString()));
    return uniqueDays.size;
  }

  private async getTopPlatform(userId: string, startDate: Date, endDate: Date): Promise<string> {
    const platformEarnings = await prisma.earning.groupBy({
      by: ['platformId'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 1,
    });

    if (platformEarnings.length === 0) return 'N/A';

    const platform = await prisma.pHVPlatform.findUnique({
      where: { id: (platformEarnings[0] as any).platformId },
    });

    return platform?.name || 'Unknown';
  }

  private async getBestWorstDays(userId: string, startDate: Date, endDate: Date): Promise<{
    bestDay: string;
    worstDay: string;
  }> {
    const dailyEarnings = await prisma.earning.groupBy({
      by: ['date'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    if (dailyEarnings.length === 0) {
      return { bestDay: 'N/A', worstDay: 'N/A' };
    }

    const bestDay = dailyEarnings[0];
    const worstDay = dailyEarnings[dailyEarnings.length - 1];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      bestDay: bestDay ? dayNames[(bestDay as any).date.getDay()] : 'N/A',
      worstDay: worstDay ? dayNames[(worstDay as any).date.getDay()] : 'N/A',
    };
  }

  private groupEarningsByDay(earnings: any[]): number[] {
    const dailyTotals = new Map<string, number>();

    earnings.forEach(earning => {
      const day = earning.date.toDateString();
      dailyTotals.set(day, (dailyTotals.get(day) || 0) + Number(earning.amount));
    });

    return Array.from(dailyTotals.values());
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;

    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    return squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private async getEarningsByPlatform(userId: string, whereClause: any): Promise<any[]> {
    return prisma.earning.findMany({
      where: whereClause,
      include: {
        platform: true,
      },
    });
  }

  private async getEarningsByDay(userId: string, whereClause: any): Promise<any[]> {
    const earnings = await prisma.earning.findMany({
      where: whereClause,
      select: {
        date: true,
        amount: true,
      },
    });

    const dayOfWeekEarnings = Array(7).fill(0).map((_, index) => ({
      dayOfWeek: index,
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index],
      totalEarnings: 0,
      count: 0,
    }));

    earnings.forEach(earning => {
      const dayOfWeek = (earning as any).date.getDay();
      (dayOfWeekEarnings[dayOfWeek] as any).totalEarnings += Number((earning as any).amount);
      (dayOfWeekEarnings[dayOfWeek] as any).count += 1;
    });

    return dayOfWeekEarnings.map(day => ({
      ...day,
      averageEarnings: day.count > 0 ? day.totalEarnings / day.count : 0,
    }));
  }

  private async getEarningsByHour(userId: string, whereClause: any): Promise<any[]> {
    const earnings = await prisma.earning.findMany({
      where: whereClause,
      select: {
        startTime: true,
        amount: true,
      },
    });

    const hourlyEarnings = Array(24).fill(0).map((_, hour) => ({
      hour,
      totalEarnings: 0,
      count: 0,
    }));

    earnings.forEach(earning => {
      if (earning.startTime) {
        const hour = earning.startTime.getHours();
        if (hourlyEarnings[hour]) {
          hourlyEarnings[hour].totalEarnings += Number(earning.amount);
          hourlyEarnings[hour].count += 1;
        }
      }
    });

    return hourlyEarnings.map(hour => ({
      ...hour,
      averageEarnings: hour.count > 0 ? hour.totalEarnings / hour.count : 0,
    }));
  }

  // Advanced analytics methods
  async getSeasonalTrends(userId: string): Promise<any> {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const earnings = await this.getEarningsData(userId, oneYearAgo, new Date());

    const monthlyData = Array(12).fill(0).map((_, month) => ({
      month: month + 1,
      monthName: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ][month],
      totalEarnings: 0,
      totalTrips: 0,
      workingDays: 0,
    }));

    const monthlyWorkingDays = new Map<number, Set<string>>();

    earnings.forEach(earning => {
      const month = (earning as any).date.getMonth();
      if (monthlyData[month]) {
        monthlyData[month].totalEarnings += Number((earning as any).amount);
        monthlyData[month].totalTrips += (earning as any).trips || 0;
      }

      if (!monthlyWorkingDays.has(month)) {
        monthlyWorkingDays.set(month, new Set());
      }
      monthlyWorkingDays.get(month)?.add((earning as any).date.toDateString());
    });

    monthlyWorkingDays.forEach((days, month) => {
      if (monthlyData[month]) {
        monthlyData[month].workingDays = days.size;
      }
    });

    return monthlyData.map(data => ({
      ...data,
      averageEarningsPerDay: data.workingDays > 0 ? data.totalEarnings / data.workingDays : 0,
      averageTripsPerDay: data.workingDays > 0 ? data.totalTrips / data.workingDays : 0,
    }));
  }

  async getEfficiencyMetrics(userId: string, startDate: Date, endDate: Date): Promise<any> {
    const [earnings, expenses, vehicle] = await Promise.all([
      this.getEarningsData(userId, startDate, endDate),
      this.getExpensesData(userId, startDate, endDate),
      prisma.vehicle.findFirst({ where: { userId } }),
    ]);

    const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalWorkingHours = earnings.reduce((sum, e) => sum + Number(e.workingHours || 0), 0);
    const totalDistance = earnings.reduce((sum, e) => sum + Number(e.distance || 0), 0);
    const totalTrips = earnings.reduce((sum, e) => sum + (e.trips || 0), 0);

    const fuelExpenses = expenses.filter(e => 
      e.category?.name.toLowerCase().includes('fuel') || 
      e.category?.name.toLowerCase().includes('petrol')
    );
    const totalFuelCost = fuelExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      earningsPerHour: totalWorkingHours > 0 ? totalEarnings / totalWorkingHours : 0,
      earningsPerKm: totalDistance > 0 ? totalEarnings / totalDistance : 0,
      earningsPerTrip: totalTrips > 0 ? totalEarnings / totalTrips : 0,
      fuelCostPerKm: totalDistance > 0 ? totalFuelCost / totalDistance : 0,
      fuelEfficiency: vehicle?.fuelEfficiency || 0,
      costEfficiency: totalEarnings > 0 ? (totalFuelCost / totalEarnings) * 100 : 0,
      utilizationRate: totalWorkingHours > 0 && totalTrips > 0 ? 
        (totalTrips / totalWorkingHours) * 60 : 0, // Trips per hour
    };
  }
}

export const phvAnalyticsService = new PHVAnalyticsService();
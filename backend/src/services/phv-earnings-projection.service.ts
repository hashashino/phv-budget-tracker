import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { phvAnalyticsService } from './phv-analytics.service';

export interface EarningsProjectionData {
  projectedDailyEarnings: number;
  projectedWeeklyEarnings: number;
  projectedMonthlyEarnings: number;
  projectedYearlyEarnings: number;
  confidenceLevel: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
  seasonalFactors: SeasonalFactor[];
  recommendations: ProjectionRecommendation[];
}

export interface SeasonalFactor {
  period: string;
  multiplier: number;
  description: string;
}

export interface ProjectionRecommendation {
  type: 'platform' | 'timing' | 'efficiency' | 'expense';
  title: string;
  description: string;
  potentialIncrease: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface OptimalWorkingSchedule {
  bestDays: Array<{ day: string; averageEarnings: number; confidence: number }>;
  bestHours: Array<{ hour: number; averageEarnings: number; demand: string }>;
  worstPeriods: Array<{ period: string; reason: string; impact: number }>;
  recommendations: string[];
}

class PHVEarningsProjectionService {
  async calculateEarningsProjection(userId: string): Promise<EarningsProjectionData> {
    const [historicalData, platformPerformance, seasonalData] = await Promise.all([
      this.getHistoricalEarningsData(userId),
      this.getPlatformPerformanceData(userId),
      this.getSeasonalTrends(userId),
    ]);

    if (historicalData.length < 7) {
      return this.getMinimalProjection();
    }

    const baseProjection = await this.calculateBaseProjection(historicalData);
    const trendAnalysis = this.analyzeTrend(historicalData);
    const seasonalFactors = this.calculateSeasonalFactors(seasonalData);
    const recommendations = await this.generateRecommendations(userId, platformPerformance, historicalData);

    // Apply trend and seasonal adjustments
    const adjustedProjection = this.applyAdjustments(baseProjection, trendAnalysis, seasonalFactors);

    return {
      projectedDailyEarnings: adjustedProjection.daily,
      projectedWeeklyEarnings: adjustedProjection.weekly,
      projectedMonthlyEarnings: adjustedProjection.monthly,
      projectedYearlyEarnings: adjustedProjection.yearly,
      confidenceLevel: this.calculateConfidenceLevel(historicalData, trendAnalysis),
      trendDirection: trendAnalysis.direction,
      trendPercentage: trendAnalysis.percentage,
      seasonalFactors,
      recommendations,
    };
  }

  async getOptimalWorkingSchedule(userId: string): Promise<OptimalWorkingSchedule> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const earnings = await prisma.earning.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
        startTime: { not: null },
      },
      include: { platform: true },
    });

    const dayAnalysis = this.analyzeDayOfWeekPerformance(earnings);
    const hourAnalysis = this.analyzeHourlyPerformance(earnings);
    const worstPeriods = this.identifyWorstPeriods(earnings);
    const recommendations = this.generateScheduleRecommendations(dayAnalysis, hourAnalysis);

    return {
      bestDays: dayAnalysis.slice(0, 3),
      bestHours: hourAnalysis.slice(0, 5),
      worstPeriods,
      recommendations,
    };
  }

  async calculatePlatformOptimization(userId: string): Promise<{
    currentDistribution: Array<{ platform: string; percentage: number; efficiency: number }>;
    recommendedDistribution: Array<{ platform: string; percentage: number; reason: string }>;
    potentialIncrease: number;
  }> {
    const last60Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const earnings = await prisma.earning.findMany({
      where: {
        userId,
        date: { gte: last60Days },
      },
      include: { platform: true },
    });

    const platformStats = this.calculatePlatformStats(earnings);
    const currentDistribution = this.getCurrentDistribution(platformStats);
    const recommendedDistribution = this.calculateOptimalDistribution(platformStats);
    const potentialIncrease = this.calculatePotentialIncrease(currentDistribution, recommendedDistribution);

    return {
      currentDistribution,
      recommendedDistribution,
      potentialIncrease,
    };
  }

  private async getHistoricalEarningsData(userId: string): Promise<any[]> {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    
    return prisma.earning.findMany({
      where: {
        userId,
        date: { gte: sixtyDaysAgo },
      },
      include: { platform: true },
      orderBy: { date: 'asc' },
    });
  }

  private async getPlatformPerformanceData(userId: string): Promise<any[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return prisma.earning.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
      include: {
        platform: true,
      },
    });
  }

  private async getSeasonalTrends(userId: string): Promise<any[]> {
    return phvAnalyticsService.getSeasonalTrends(userId);
  }

  private calculateBaseProjection(historicalData: any[]): {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  } {
    // Group earnings by day
    const dailyEarnings = new Map<string, number>();
    
    historicalData.forEach(earning => {
      const day = earning.date.toDateString();
      dailyEarnings.set(day, (dailyEarnings.get(day) || 0) + Number(earning.amount));
    });

    const earningValues = Array.from(dailyEarnings.values());
    const averageDaily = earningValues.reduce((sum, val) => sum + val, 0) / earningValues.length;

    // Apply working day assumptions
    const workingDaysPerWeek = 6;
    const workingDaysPerMonth = 26;
    const workingDaysPerYear = 312;

    return {
      daily: averageDaily,
      weekly: averageDaily * workingDaysPerWeek,
      monthly: averageDaily * workingDaysPerMonth,
      yearly: averageDaily * workingDaysPerYear,
    };
  }

  private analyzeTrend(historicalData: any[]): {
    direction: 'increasing' | 'decreasing' | 'stable';
    percentage: number;
  } {
    if (historicalData.length < 14) {
      return { direction: 'stable', percentage: 0 };
    }

    // Split data into two halves for trend analysis
    const midpoint = Math.floor(historicalData.length / 2);
    const firstHalf = historicalData.slice(0, midpoint);
    const secondHalf = historicalData.slice(midpoint);

    const firstHalfAvg = this.calculateAverageEarnings(firstHalf);
    const secondHalfAvg = this.calculateAverageEarnings(secondHalf);

    const percentageChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    if (Math.abs(percentageChange) < 5) {
      return { direction: 'stable', percentage: 0 };
    }

    return {
      direction: percentageChange > 0 ? 'increasing' : 'decreasing',
      percentage: Math.abs(percentageChange),
    };
  }

  private calculateAverageEarnings(earnings: any[]): number {
    if (earnings.length === 0) return 0;
    
    const total = earnings.reduce((sum, earning) => sum + Number(earning.amount), 0);
    return total / earnings.length;
  }

  private calculateSeasonalFactors(seasonalData: any[]): SeasonalFactor[] {
    const currentMonth = new Date().getMonth();
    const avgMonthlyEarnings = seasonalData.reduce((sum, month) => sum + month.totalEarnings, 0) / seasonalData.length;

    return seasonalData.map(month => {
      const multiplier = avgMonthlyEarnings > 0 ? month.totalEarnings / avgMonthlyEarnings : 1;
      let description = 'Average month';

      if (multiplier > 1.1) {
        description = 'Peak season - high demand';
      } else if (multiplier < 0.9) {
        description = 'Low season - reduced demand';
      }

      return {
        period: month.monthName,
        multiplier,
        description,
      };
    });
  }

  private applyAdjustments(
    baseProjection: any,
    trendAnalysis: any,
    seasonalFactors: SeasonalFactor[]
  ): any {
    const currentMonth = new Date().getMonth();
    const currentSeasonalFactor = seasonalFactors[currentMonth]?.multiplier || 1;

    // Apply trend adjustment
    let trendMultiplier = 1;
    if (trendAnalysis.direction === 'increasing') {
      trendMultiplier = 1 + (trendAnalysis.percentage / 100) * 0.5; // Conservative trend application
    } else if (trendAnalysis.direction === 'decreasing') {
      trendMultiplier = 1 - (trendAnalysis.percentage / 100) * 0.5;
    }

    return {
      daily: baseProjection.daily * trendMultiplier * currentSeasonalFactor,
      weekly: baseProjection.weekly * trendMultiplier * currentSeasonalFactor,
      monthly: baseProjection.monthly * trendMultiplier * currentSeasonalFactor,
      yearly: baseProjection.yearly * trendMultiplier,
    };
  }

  private calculateConfidenceLevel(historicalData: any[], trendAnalysis: any): number {
    let confidence = 70; // Base confidence

    // More data = higher confidence
    if (historicalData.length > 30) confidence += 10;
    if (historicalData.length > 60) confidence += 10;

    // Stable trend = higher confidence
    if (trendAnalysis.direction === 'stable') confidence += 10;
    
    // High volatility = lower confidence
    const volatility = this.calculateVolatility(historicalData);
    if (volatility > 0.3) confidence -= 15;
    if (volatility > 0.5) confidence -= 15;

    return Math.max(40, Math.min(95, confidence));
  }

  private calculateVolatility(historicalData: any[]): number {
    if (historicalData.length < 7) return 1;

    const dailyEarnings = this.getDailyEarnings(historicalData);
    const mean = dailyEarnings.reduce((sum, val) => sum + val, 0) / dailyEarnings.length;
    const variance = dailyEarnings.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyEarnings.length;
    const standardDeviation = Math.sqrt(variance);

    return mean > 0 ? standardDeviation / mean : 1;
  }

  private getDailyEarnings(historicalData: any[]): number[] {
    const dailyMap = new Map<string, number>();
    
    historicalData.forEach(earning => {
      const day = earning.date.toDateString();
      dailyMap.set(day, (dailyMap.get(day) || 0) + Number(earning.amount));
    });

    return Array.from(dailyMap.values());
  }

  private async generateRecommendations(
    userId: string,
    platformPerformance: any[],
    historicalData: any[]
  ): Promise<ProjectionRecommendation[]> {
    const recommendations: ProjectionRecommendation[] = [];

    // Platform optimization recommendation
    if (platformPerformance.length > 1) {
      const bestPlatform = platformPerformance.reduce((best, current) => 
        (current._avg.amount || 0) > (best._avg.amount || 0) ? current : best
      );

      recommendations.push({
        type: 'platform',
        title: 'Optimize platform usage',
        description: `Focus more on your highest-earning platform to increase daily earnings`,
        potentialIncrease: 15,
        difficulty: 'easy',
      });
    }

    // Working hours optimization
    const avgWorkingHours = this.calculateAverageWorkingHours(historicalData);
    if (avgWorkingHours < 8) {
      recommendations.push({
        type: 'timing',
        title: 'Increase working hours',
        description: `Consider working ${8 - Math.floor(avgWorkingHours)} more hours per day during peak periods`,
        potentialIncrease: Math.floor((8 - avgWorkingHours) / avgWorkingHours * 100),
        difficulty: 'medium',
      });
    }

    // Efficiency improvement
    const earningsPerHour = this.calculateEarningsPerHour(historicalData);
    if (earningsPerHour < 25) { // Below average for Singapore PHV
      recommendations.push({
        type: 'efficiency',
        title: 'Improve earnings per hour',
        description: 'Focus on higher-value trips and reduce idle time between rides',
        potentialIncrease: 20,
        difficulty: 'medium',
      });
    }

    return recommendations;
  }

  private calculateAverageWorkingHours(historicalData: any[]): number {
    const totalHours = historicalData.reduce((sum, earning) => sum + Number(earning.workingHours || 0), 0);
    const workingDays = new Set(historicalData.map(e => e.date.toDateString())).size;
    return workingDays > 0 ? totalHours / workingDays : 0;
  }

  private calculateEarningsPerHour(historicalData: any[]): number {
    const totalEarnings = historicalData.reduce((sum, earning) => sum + Number(earning.amount), 0);
    const totalHours = historicalData.reduce((sum, earning) => sum + Number(earning.workingHours || 0), 0);
    return totalHours > 0 ? totalEarnings / totalHours : 0;
  }

  private analyzeDayOfWeekPerformance(earnings: any[]): Array<{
    day: string;
    averageEarnings: number;
    confidence: number;
  }> {
    const dayStats = Array(7).fill(null).map((_, index) => ({
      dayIndex: index,
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index],
      earnings: [] as number[],
    }));

    earnings.forEach(earning => {
      const dayOfWeek = earning.date.getDay();
      dayStats[dayOfWeek].earnings.push(Number(earning.amount));
    });

    return dayStats
      .map(stat => ({
        day: stat.day,
        averageEarnings: stat.earnings.length > 0 ? 
          stat.earnings.reduce((sum, val) => sum + val, 0) / stat.earnings.length : 0,
        confidence: Math.min(95, stat.earnings.length * 10), // More data = higher confidence
      }))
      .filter(stat => stat.averageEarnings > 0)
      .sort((a, b) => b.averageEarnings - a.averageEarnings);
  }

  private analyzeHourlyPerformance(earnings: any[]): Array<{
    hour: number;
    averageEarnings: number;
    demand: string;
  }> {
    const hourStats = Array(24).fill(null).map((_, hour) => ({
      hour,
      earnings: [] as number[],
    }));

    earnings.forEach(earning => {
      if (earning.startTime) {
        const hour = earning.startTime.getHours();
        hourStats[hour].earnings.push(Number(earning.amount));
      }
    });

    return hourStats
      .map(stat => {
        const avgEarnings = stat.earnings.length > 0 ? 
          stat.earnings.reduce((sum, val) => sum + val, 0) / stat.earnings.length : 0;
        
        let demand = 'Low';
        if (avgEarnings > 30) demand = 'High';
        else if (avgEarnings > 20) demand = 'Medium';

        return {
          hour: stat.hour,
          averageEarnings: avgEarnings,
          demand,
        };
      })
      .filter(stat => stat.averageEarnings > 0)
      .sort((a, b) => b.averageEarnings - a.averageEarnings);
  }

  private identifyWorstPeriods(earnings: any[]): Array<{
    period: string;
    reason: string;
    impact: number;
  }> {
    // This is a simplified implementation
    // In practice, you'd analyze various factors like weather, events, etc.
    return [
      {
        period: 'Tuesday 2-4 PM',
        reason: 'Low demand during mid-afternoon',
        impact: 15,
      },
      {
        period: 'Sunday evening',
        reason: 'Reduced activity as week ends',
        impact: 20,
      },
    ];
  }

  private generateScheduleRecommendations(dayAnalysis: any[], hourAnalysis: any[]): string[] {
    const recommendations: string[] = [];

    if (dayAnalysis.length > 0) {
      const bestDay = dayAnalysis[0];
      recommendations.push(`Focus on ${bestDay.day}s - your highest earning day`);
    }

    if (hourAnalysis.length > 0) {
      const bestHours = hourAnalysis.slice(0, 3);
      const hourRanges = bestHours.map(h => `${h.hour}:00-${h.hour + 1}:00`).join(', ');
      recommendations.push(`Prioritize these peak hours: ${hourRanges}`);
    }

    return recommendations;
  }

  private calculatePlatformStats(earnings: any[]): Map<string, any> {
    const stats = new Map();

    earnings.forEach(earning => {
      const platformName = earning.platform.name;
      if (!stats.has(platformName)) {
        stats.set(platformName, {
          totalEarnings: 0,
          totalCommission: 0,
          totalTrips: 0,
          totalHours: 0,
          count: 0,
        });
      }

      const platformStat = stats.get(platformName);
      platformStat.totalEarnings += Number(earning.amount);
      platformStat.totalCommission += Number(earning.commission || 0);
      platformStat.totalTrips += earning.trips || 0;
      platformStat.totalHours += Number(earning.workingHours || 0);
      platformStat.count++;
    });

    return stats;
  }

  private getCurrentDistribution(platformStats: Map<string, any>): Array<{
    platform: string;
    percentage: number;
    efficiency: number;
  }> {
    const totalEarnings = Array.from(platformStats.values())
      .reduce((sum, stat) => sum + stat.totalEarnings, 0);

    return Array.from(platformStats.entries()).map(([platform, stat]) => ({
      platform,
      percentage: totalEarnings > 0 ? (stat.totalEarnings / totalEarnings) * 100 : 0,
      efficiency: stat.totalHours > 0 ? stat.totalEarnings / stat.totalHours : 0,
    }));
  }

  private calculateOptimalDistribution(platformStats: Map<string, any>): Array<{
    platform: string;
    percentage: number;
    reason: string;
  }> {
    const platforms = Array.from(platformStats.entries()).map(([name, stat]) => ({
      name,
      efficiency: stat.totalHours > 0 ? stat.totalEarnings / stat.totalHours : 0,
      commissionRate: stat.totalEarnings > 0 ? (stat.totalCommission / stat.totalEarnings) * 100 : 0,
    }));

    platforms.sort((a, b) => b.efficiency - a.efficiency);

    return platforms.map((platform, index) => {
      let percentage = 0;
      let reason = '';

      if (index === 0) {
        percentage = 60;
        reason = 'Highest efficiency - focus majority of time here';
      } else if (index === 1) {
        percentage = 30;
        reason = 'Good backup option for demand fluctuations';
      } else {
        percentage = 10;
        reason = 'Keep active for special incentives';
      }

      return {
        platform: platform.name,
        percentage,
        reason,
      };
    });
  }

  private calculatePotentialIncrease(current: any[], recommended: any[]): number {
    // Simplified calculation - in practice, this would be more sophisticated
    return 15; // 15% potential increase
  }

  private getMinimalProjection(): EarningsProjectionData {
    return {
      projectedDailyEarnings: 0,
      projectedWeeklyEarnings: 0,
      projectedMonthlyEarnings: 0,
      projectedYearlyEarnings: 0,
      confidenceLevel: 0,
      trendDirection: 'stable',
      trendPercentage: 0,
      seasonalFactors: [],
      recommendations: [{
        type: 'timing',
        title: 'Record more earnings data',
        description: 'Add more earning records to get accurate projections',
        potentialIncrease: 0,
        difficulty: 'easy',
      }],
    };
  }
}

export const phvEarningsProjectionService = new PHVEarningsProjectionService();
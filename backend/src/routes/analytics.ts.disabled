import { Router } from 'express';
import { query } from 'express-validator';
import * as analyticsController from '@/controllers/analytics.controller';
import { validate } from '@/middleware/validation';

const router = Router();

// Validation rules
const timeRangeValidation = [
  query('startDate').optional().isISO8601().toDate().withMessage('Valid start date required'),
  query('endDate').optional().isISO8601().toDate().withMessage('Valid end date required'),
  query('period').optional().isIn(['day', 'week', 'month', 'quarter', 'year']).withMessage('Valid period required'),
];

const phvAnalyticsValidation = [
  ...timeRangeValidation,
  query('platformId').optional().isString().withMessage('Platform ID must be a string'),
  query('vehicleId').optional().isString().withMessage('Vehicle ID must be a string'),
];

const expenseAnalyticsValidation = [
  ...timeRangeValidation,
  query('categoryId').optional().isString().withMessage('Category ID must be a string'),
  query('groupBy').optional().isIn(['category', 'day', 'week', 'month']).withMessage('Valid groupBy required'),
];

const profitabilityValidation = [
  ...timeRangeValidation,
  query('platformId').optional().isString().withMessage('Platform ID must be a string'),
  query('includeFixedCosts').optional().isBoolean().withMessage('includeFixedCosts must be boolean'),
];

// Routes
router.get('/dashboard', timeRangeValidation, validate(timeRangeValidation), analyticsController.getDashboardAnalytics);
router.get('/overview', timeRangeValidation, validate(timeRangeValidation), analyticsController.getOverviewAnalytics);

// Expense Analytics
router.get('/expenses', expenseAnalyticsValidation, validate(expenseAnalyticsValidation), analyticsController.getExpenseAnalytics);
router.get('/expenses/trends', timeRangeValidation, validate(timeRangeValidation), analyticsController.getExpenseTrends);
router.get('/expenses/categories', timeRangeValidation, validate(timeRangeValidation), analyticsController.getExpenseByCategory);
router.get('/expenses/monthly', analyticsController.getMonthlyExpenseBreakdown);

// Earnings Analytics
router.get('/earnings', phvAnalyticsValidation, validate(phvAnalyticsValidation), analyticsController.getEarningsAnalytics);
router.get('/earnings/trends', phvAnalyticsValidation, validate(phvAnalyticsValidation), analyticsController.getEarningsTrends);
router.get('/earnings/platforms', timeRangeValidation, validate(timeRangeValidation), analyticsController.getEarningsByPlatform);
router.get('/earnings/hourly', phvAnalyticsValidation, validate(phvAnalyticsValidation), analyticsController.getHourlyEarnings);
router.get('/earnings/daily', phvAnalyticsValidation, validate(phvAnalyticsValidation), analyticsController.getDailyEarnings);

// PHV Specific Analytics
router.get('/phv/performance', phvAnalyticsValidation, validate(phvAnalyticsValidation), analyticsController.getPHVPerformance);
router.get('/phv/efficiency', phvAnalyticsValidation, validate(phvAnalyticsValidation), analyticsController.getPHVEfficiency);
router.get('/phv/profitability', profitabilityValidation, validate(profitabilityValidation), analyticsController.getPHVProfitability);
router.get('/phv/fuel-analysis', phvAnalyticsValidation, validate(phvAnalyticsValidation), analyticsController.getFuelAnalysis);
router.get('/phv/peak-hours', phvAnalyticsValidation, validate(phvAnalyticsValidation), analyticsController.getPeakHours);
router.get('/phv/route-analysis', phvAnalyticsValidation, validate(phvAnalyticsValidation), analyticsController.getRouteAnalysis);

// Financial Analytics
router.get('/cash-flow', timeRangeValidation, validate(timeRangeValidation), analyticsController.getCashFlowAnalysis);
router.get('/net-profit', profitabilityValidation, validate(profitabilityValidation), analyticsController.getNetProfitAnalysis);
router.get('/tax-summary', timeRangeValidation, validate(timeRangeValidation), analyticsController.getTaxSummary);
router.get('/budget-vs-actual', timeRangeValidation, validate(timeRangeValidation), analyticsController.getBudgetVsActual);

// Predictive Analytics
router.get('/projections/earnings', phvAnalyticsValidation, validate(phvAnalyticsValidation), analyticsController.getEarningsProjections);
router.get('/projections/expenses', expenseAnalyticsValidation, validate(expenseAnalyticsValidation), analyticsController.getExpenseProjections);
router.get('/recommendations', analyticsController.getRecommendations);

export default router;
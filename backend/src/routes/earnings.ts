import { Router } from 'express';
import { body, query, param } from 'express-validator';
import * as earningsController from '@/controllers/earnings.controller';
import { validate } from '@/middleware/validation';

const router = Router();

// Validation rules
const createEarningValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('grossAmount').isNumeric().withMessage('Gross amount must be a number'),
  body('netAmount').isNumeric().withMessage('Net amount must be a number'),
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('platformId').isString().notEmpty().withMessage('Platform ID is required'),
  body('commission').optional().isNumeric().withMessage('Commission must be a number'),
  body('incentive').optional().isNumeric().withMessage('Incentive must be a number'),
  body('tips').optional().isNumeric().withMessage('Tips must be a number'),
  body('startTime').optional().isISO8601().toDate().withMessage('Valid start time required'),
  body('endTime').optional().isISO8601().toDate().withMessage('Valid end time required'),
  body('distance').optional().isNumeric().withMessage('Distance must be a number'),
  body('trips').optional().isInt().withMessage('Trips must be an integer'),
  body('workingHours').optional().isNumeric().withMessage('Working hours must be a number'),
  body('fuelCost').optional().isNumeric().withMessage('Fuel cost must be a number'),
  body('vehicleId').optional().isString().withMessage('Vehicle ID must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
];

const updateEarningValidation = [
  param('id').isString().notEmpty().withMessage('Earning ID is required'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('grossAmount').optional().isNumeric().withMessage('Gross amount must be a number'),
  body('netAmount').optional().isNumeric().withMessage('Net amount must be a number'),
  body('date').optional().isISO8601().toDate().withMessage('Valid date is required'),
  body('platformId').optional().isString().withMessage('Platform ID must be a string'),
  body('commission').optional().isNumeric().withMessage('Commission must be a number'),
  body('incentive').optional().isNumeric().withMessage('Incentive must be a number'),
  body('tips').optional().isNumeric().withMessage('Tips must be a number'),
  body('startTime').optional().isISO8601().toDate().withMessage('Valid start time required'),
  body('endTime').optional().isISO8601().toDate().withMessage('Valid end time required'),
  body('distance').optional().isNumeric().withMessage('Distance must be a number'),
  body('trips').optional().isInt().withMessage('Trips must be an integer'),
  body('workingHours').optional().isNumeric().withMessage('Working hours must be a number'),
  body('fuelCost').optional().isNumeric().withMessage('Fuel cost must be a number'),
  body('vehicleId').optional().isString().withMessage('Vehicle ID must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
];

const bulkUploadValidation = [
  body('platform').isString().notEmpty().withMessage('Platform is required'),
  body('data').isArray().notEmpty().withMessage('Data array is required'),
];

const getEarningsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('startDate').optional().isISO8601().toDate().withMessage('Valid start date required'),
  query('endDate').optional().isISO8601().toDate().withMessage('Valid end date required'),
  query('platformId').optional().isString().withMessage('Platform ID must be a string'),
  query('vehicleId').optional().isString().withMessage('Vehicle ID must be a string'),
];

// Routes
router.get('/', getEarningsValidation, validate(getEarningsValidation), earningsController.getEarnings);
router.get('/summary', earningsController.getEarningsSummary);
router.get('/analytics', earningsController.getEarningsAnalytics);
router.post('/', createEarningValidation, validate(createEarningValidation), earningsController.createEarning);
router.post('/bulk-upload', bulkUploadValidation, validate(bulkUploadValidation), earningsController.bulkUploadEarnings);
router.post('/screenshot-upload', earningsController.uploadEarningsScreenshot);
router.get('/:id', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), earningsController.getEarningById);
router.put('/:id', updateEarningValidation, validate(updateEarningValidation), earningsController.updateEarning);
router.delete('/:id', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), earningsController.deleteEarning);

export default router;
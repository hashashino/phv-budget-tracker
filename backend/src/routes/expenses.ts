import { Router } from 'express';
import { body, query } from 'express-validator';
import * as expensesController from '../controllers/expenses.controller';
import { validate } from '../middleware/validation';
import { apiRateLimit } from '../middleware/rateLimit';

const router = Router();

// Validation rules for creating expenses
const createExpenseValidation = [
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('description').trim().isLength({ min: 1, max: 255 }).withMessage('Description is required and must be less than 255 characters'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('categoryId').isUUID().withMessage('Valid category ID is required'),
  body('location').optional().trim().isLength({ max: 255 }).withMessage('Location must be less than 255 characters'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isString().withMessage('Each tag must be a string'),
  body('receiptId').optional().isUUID().withMessage('Valid receipt ID required'),
  body('includeGst').optional().isBoolean().withMessage('Include GST must be a boolean'),
];

// Validation rules for updating expenses
const updateExpenseValidation = [
  body('amount').optional().isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('description').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Description must be less than 255 characters'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('categoryId').optional().isUUID().withMessage('Valid category ID is required'),
  body('location').optional().trim().isLength({ max: 255 }).withMessage('Location must be less than 255 characters'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isString().withMessage('Each tag must be a string'),
  body('receiptId').optional().isUUID().withMessage('Valid receipt ID required'),
  body('includeGst').optional().isBoolean().withMessage('Include GST must be a boolean'),
];

// Validation rules for getting expenses
const getExpensesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('categoryId').optional().isUUID().withMessage('Valid category ID required'),
  query('startDate').optional().isISO8601().withMessage('Valid start date required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date required'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term cannot be empty'),
  query('sortBy').optional().isIn(['date', 'amount', 'description', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
];

// Validation rules for bulk creating expenses
const bulkCreateExpensesValidation = [
  body('expenses').isArray({ min: 1 }).withMessage('Expenses array is required and must not be empty'),
  body('expenses.*.amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('expenses.*.description').trim().isLength({ min: 1, max: 255 }).withMessage('Description is required and must be less than 255 characters'),
  body('expenses.*.date').isISO8601().withMessage('Valid date is required'),
  body('expenses.*.categoryId').isUUID().withMessage('Valid category ID is required'),
  body('expenses.*.location').optional().trim().isLength({ max: 255 }).withMessage('Location must be less than 255 characters'),
  body('expenses.*.notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
  body('expenses.*.tags').optional().isArray().withMessage('Tags must be an array'),
  body('expenses.*.receiptId').optional().isUUID().withMessage('Valid receipt ID required'),
  body('expenses.*.includeGst').optional().isBoolean().withMessage('Include GST must be a boolean'),
];

// Validation rules for expense stats
const getExpenseStatsValidation = [
  query('startDate').optional().isISO8601().withMessage('Valid start date required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date required'),
];

// Routes
router.get('/', apiRateLimit, getExpensesValidation, validate(getExpensesValidation), expensesController.getExpenses);
router.get('/stats', getExpenseStatsValidation, validate(getExpenseStatsValidation), expensesController.getExpenseStats);
router.get('/:id', expensesController.getExpense);
router.post('/', createExpenseValidation, validate(createExpenseValidation), expensesController.createExpense);
router.post('/bulk', bulkCreateExpensesValidation, validate(bulkCreateExpensesValidation), expensesController.bulkCreateExpenses);
router.put('/:id', updateExpenseValidation, validate(updateExpenseValidation), expensesController.updateExpense);
router.delete('/:id', expensesController.deleteExpense);

export default router;
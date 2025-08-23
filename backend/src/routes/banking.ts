import { Router } from 'express';
import { body, query, param } from 'express-validator';
import * as bankingController from '@/controllers/banking.controller';
import { validate } from '@/middleware/validation';

const router = Router();

// Validation rules
const connectBankValidation = [
  body('bankName').isIn(['DBS', 'OCBC', 'UOB', 'MAYBANK', 'POSB', 'CITIBANK', 'HSBC', 'STANDARD_CHARTERED']).withMessage('Valid bank name is required'),
  body('accountNumber').isString().notEmpty().withMessage('Account number is required'),
  body('accountType').isString().notEmpty().withMessage('Account type is required'),
  body('credentials').optional().isObject().withMessage('Credentials must be an object'),
];

const updateConnectionValidation = [
  param('id').isString().notEmpty().withMessage('Connection ID is required'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('credentials').optional().isObject().withMessage('Credentials must be an object'),
];

const getTransactionsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('startDate').optional().isISO8601().toDate().withMessage('Valid start date required'),
  query('endDate').optional().isISO8601().toDate().withMessage('Valid end date required'),
  query('type').optional().isIn(['DEBIT', 'CREDIT']).withMessage('Type must be DEBIT or CREDIT'),
  query('minAmount').optional().isNumeric().withMessage('Min amount must be a number'),
  query('maxAmount').optional().isNumeric().withMessage('Max amount must be a number'),
  query('merchant').optional().isString().withMessage('Merchant must be a string'),
  query('category').optional().isString().withMessage('Category must be a string'),
];

const categorizeTransactionValidation = [
  param('id').isString().notEmpty().withMessage('Transaction ID is required'),
  body('category').isString().notEmpty().withMessage('Category is required'),
  body('subcategory').optional().isString().withMessage('Subcategory must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
];

const syncTransactionsValidation = [
  param('id').isString().notEmpty().withMessage('Connection ID is required'),
  body('startDate').optional().isISO8601().toDate().withMessage('Valid start date required'),
  body('endDate').optional().isISO8601().toDate().withMessage('Valid end date required'),
];

// Routes
router.get('/connections', bankingController.getBankConnections);
router.post('/connections', connectBankValidation, validate(connectBankValidation), bankingController.connectBank);
router.get('/connections/:id', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), bankingController.getBankConnectionById);
router.put('/connections/:id', updateConnectionValidation, validate(updateConnectionValidation), bankingController.updateBankConnection);
router.delete('/connections/:id', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), bankingController.deleteBankConnection);
router.post('/connections/:id/sync', syncTransactionsValidation, validate(syncTransactionsValidation), bankingController.syncTransactions);
router.get('/connections/:id/balance', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), bankingController.getAccountBalance);

router.get('/transactions', getTransactionsValidation, validate(getTransactionsValidation), bankingController.getTransactions);
router.get('/transactions/:id', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), bankingController.getTransactionById);
router.put('/transactions/:id/categorize', categorizeTransactionValidation, validate(categorizeTransactionValidation), bankingController.categorizeTransaction);
router.post('/transactions/bulk-categorize', bankingController.bulkCategorizeTransactions);

router.get('/analytics', bankingController.getBankingAnalytics);
router.get('/cash-flow', bankingController.getCashFlowAnalysis);

export default router;
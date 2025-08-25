import { Router } from 'express';
import { body, query, param } from 'express-validator';
import * as debtsController from '../controllers/debts.controller';
import { validate } from '../middleware/validation';

const router = Router();

// Validation rules
const createDebtValidation = [
  body('creditor').isString().notEmpty().withMessage('Creditor is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('originalAmount').isNumeric().withMessage('Original amount must be a number'),
  body('type').isIn(['CREDIT_CARD', 'PERSONAL_LOAN', 'CAR_LOAN', 'MORTGAGE', 'OTHER']).withMessage('Valid debt type is required'),
  body('interestRate').optional().isNumeric().withMessage('Interest rate must be a number'),
  body('dueDate').optional().isISO8601().toDate().withMessage('Valid due date required'),
  body('minimumPayment').optional().isNumeric().withMessage('Minimum payment must be a number'),
  body('description').optional().isString().withMessage('Description must be a string'),
];

const updateDebtValidation = [
  param('id').isString().notEmpty().withMessage('Debt ID is required'),
  body('creditor').optional().isString().withMessage('Creditor must be a string'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('interestRate').optional().isNumeric().withMessage('Interest rate must be a number'),
  body('dueDate').optional().isISO8601().toDate().withMessage('Valid due date required'),
  body('minimumPayment').optional().isNumeric().withMessage('Minimum payment must be a number'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('isPaidOff').optional().isBoolean().withMessage('isPaidOff must be boolean'),
];

const addPaymentValidation = [
  param('id').isString().notEmpty().withMessage('Debt ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('paymentDate').isISO8601().toDate().withMessage('Valid payment date required'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
];

const getDebtsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['CREDIT_CARD', 'PERSONAL_LOAN', 'CAR_LOAN', 'MORTGAGE', 'OTHER']).withMessage('Valid debt type required'),
  query('isPaidOff').optional().isBoolean().withMessage('isPaidOff must be boolean'),
];

const payoffProjectionValidation = [
  param('id').isString().notEmpty().withMessage('Debt ID is required'),
  body('monthlyPayment').isNumeric().withMessage('Monthly payment must be a number'),
  body('additionalPayment').optional().isNumeric().withMessage('Additional payment must be a number'),
  body('paymentFrequency').optional().isIn(['MONTHLY', 'BIWEEKLY', 'WEEKLY']).withMessage('Valid payment frequency required'),
];

// Routes
router.get('/', getDebtsValidation, validate(getDebtsValidation), debtsController.getDebts);
router.get('/summary', debtsController.getDebtSummary);
router.post('/', createDebtValidation, validate(createDebtValidation), debtsController.createDebt);
router.get('/:id', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), debtsController.getDebtById);
router.put('/:id', updateDebtValidation, validate(updateDebtValidation), debtsController.updateDebt);
router.delete('/:id', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), debtsController.deleteDebt);

router.get('/:id/payments', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), debtsController.getDebtPayments);
router.post('/:id/payments', addPaymentValidation, validate(addPaymentValidation), debtsController.addDebtPayment);
router.delete('/payments/:paymentId', param('paymentId').isString().notEmpty(), validate([param('paymentId').isString().notEmpty()]), debtsController.deleteDebtPayment);

router.post('/:id/payoff-projection', payoffProjectionValidation, validate(payoffProjectionValidation), debtsController.calculatePayoffProjection);
router.get('/payoff-strategies', debtsController.getPayoffStrategies);

export default router;
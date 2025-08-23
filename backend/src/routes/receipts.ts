import { Router } from 'express';
import { body, query, param } from 'express-validator';
import multer from 'multer';
import * as receiptsController from '@/controllers/receipts.controller';
import { validate } from '@/middleware/validation';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Validation rules
const getReceiptsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('startDate').optional().isISO8601().toDate().withMessage('Valid start date required'),
  query('endDate').optional().isISO8601().toDate().withMessage('Valid end date required'),
  query('processed').optional().isBoolean().withMessage('Processed must be boolean'),
  query('merchant').optional().isString().withMessage('Merchant must be a string'),
];

const updateReceiptValidation = [
  param('id').isString().notEmpty().withMessage('Receipt ID is required'),
  body('merchant').optional().isString().withMessage('Merchant must be a string'),
  body('totalAmount').optional().isNumeric().withMessage('Total amount must be a number'),
  body('gstAmount').optional().isNumeric().withMessage('GST amount must be a number'),
  body('receiptDate').optional().isISO8601().toDate().withMessage('Valid receipt date required'),
  body('receiptNumber').optional().isString().withMessage('Receipt number must be a string'),
];

const uploadValidation = [
  body('description').optional().isString().withMessage('Description must be a string'),
  body('autoProcess').optional().isBoolean().withMessage('Auto process must be boolean'),
];

// Routes - Only using implemented methods
router.get('/', getReceiptsValidation, validate(getReceiptsValidation), receiptsController.getReceipts);
router.post('/upload', upload.single('receipt'), uploadValidation, validate(uploadValidation), receiptsController.uploadReceipt);
router.get('/:id', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), receiptsController.getReceipt);
router.delete('/:id', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), receiptsController.deleteReceipt);
router.post('/:id/process', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), receiptsController.processReceipt);

export default router;
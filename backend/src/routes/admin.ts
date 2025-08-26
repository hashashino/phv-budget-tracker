import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { adminController } from '../controllers/admin.controller';
import { validate } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Admin login route (no auth required)
router.post('/login', 
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ]),
  adminController.login
);

// All other admin routes require authentication
router.use(requireAuth);

// Admin logout
router.post('/logout', adminController.logout);

// Admin dashboard stats - accessible by all admin roles
router.get('/stats', 
  requireRole(['CUSTOMER_SUPPORT', 'OPERATIONS_ADMIN', 'TECHNICAL_ADMIN', 'FINANCE_MANAGER', 'SUPER_ADMIN']),
  adminController.getStats
);

// User management routes
router.get('/users', 
  requireRole(['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'CUSTOMER_SUPPORT']),
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['USER', 'CUSTOMER_SUPPORT', 'OPERATIONS_ADMIN', 'TECHNICAL_ADMIN', 'FINANCE_MANAGER', 'SUPER_ADMIN']),
    query('search').optional().isString()
  ]),
  adminController.getUsers
);

router.get('/users/:id', 
  requireRole(['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'CUSTOMER_SUPPORT']),
  validate([
    param('id').isUUID().withMessage('Valid user ID is required')
  ]),
  adminController.getUserById
);

router.post('/users', 
  requireRole(['SUPER_ADMIN', 'OPERATIONS_ADMIN']),
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role').isIn(['USER', 'CUSTOMER_SUPPORT', 'OPERATIONS_ADMIN', 'TECHNICAL_ADMIN', 'FINANCE_MANAGER', 'SUPER_ADMIN']).optional()
  ]),
  adminController.createUser
);

router.put('/users/:id/role', 
  requireRole(['SUPER_ADMIN']),
  validate([
    param('id').isUUID().withMessage('Valid user ID is required'),
    body('role').isIn(['USER', 'CUSTOMER_SUPPORT', 'OPERATIONS_ADMIN', 'TECHNICAL_ADMIN', 'FINANCE_MANAGER', 'SUPER_ADMIN'])
  ]),
  adminController.updateUserRole
);

router.put('/users/:id/status', 
  requireRole(['SUPER_ADMIN', 'OPERATIONS_ADMIN']),
  validate([
    param('id').isUUID().withMessage('Valid user ID is required'),
    body('isActive').isBoolean().withMessage('Status must be true or false')
  ]),
  adminController.updateUserStatus
);

router.delete('/users/:id', 
  requireRole(['SUPER_ADMIN']),
  validate([
    param('id').isUUID().withMessage('Valid user ID is required')
  ]),
  adminController.deleteUser
);

// Financial reports - restricted to finance roles
router.get('/reports/financial', 
  requireRole(['SUPER_ADMIN', 'FINANCE_MANAGER']),
  validate([
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('userId').optional().isUUID()
  ]),
  adminController.getFinancialReports
);

// System health - restricted to technical roles
router.get('/system/health', 
  requireRole(['SUPER_ADMIN', 'TECHNICAL_ADMIN']),
  adminController.getSystemHealth
);

// Audit logs - super admin only
router.get('/audit-logs', 
  requireRole(['SUPER_ADMIN']),
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('action').optional().isString(),
    query('userId').optional().isUUID()
  ]),
  adminController.getAuditLogs
);

// Support ticket management
router.get('/support/tickets', 
  requireRole(['SUPER_ADMIN', 'CUSTOMER_SUPPORT']),
  adminController.getSupportTickets
);

router.put('/support/tickets/:id/status', 
  requireRole(['SUPER_ADMIN', 'CUSTOMER_SUPPORT']),
  validate([
    param('id').isUUID().withMessage('Valid ticket ID is required'),
    body('status').isIn(['open', 'in_progress', 'resolved', 'closed'])
  ]),
  adminController.updateTicketStatus
);

export default router;
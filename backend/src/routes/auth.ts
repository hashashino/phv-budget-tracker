import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '@/controllers/auth.controller';
import { validate } from '@/middleware/validation';
import { authMiddleware } from '@/middleware/auth';
import { authRateLimit } from '@/middleware/rateLimit';

const router = Router();

// Registration validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone').optional().isMobilePhone('en-SG').withMessage('Valid Singapore phone number required'),
  body('licenseNumber').optional().isString().withMessage('License number must be a string'),
  body('vehicleNumber').optional().isString().withMessage('Vehicle number must be a string'),
  body('phvCompany').optional().isString().withMessage('PHV company must be a string'),
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Change password validation rules
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

// Update profile validation rules
const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone').optional().isMobilePhone('en-SG').withMessage('Valid Singapore phone number required'),
  body('licenseNumber').optional().isString().withMessage('License number must be a string'),
  body('vehicleNumber').optional().isString().withMessage('Vehicle number must be a string'),
  body('phvCompany').optional().isString().withMessage('PHV company must be a string'),
];

// Refresh token validation
const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

// Public routes (no authentication required)
router.post('/register', authRateLimit, registerValidation, validate(registerValidation), authController.register);
router.post('/login', authRateLimit, loginValidation, validate(loginValidation), authController.login);
router.post('/refresh-token', refreshTokenValidation, validate(refreshTokenValidation), authController.refreshToken);

// Protected routes (authentication required)
router.post('/logout', authMiddleware, authController.logout);
router.post('/change-password', authMiddleware, changePasswordValidation, validate(changePasswordValidation), authController.changePassword);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, updateProfileValidation, validate(updateProfileValidation), authController.updateProfile);

export default router;
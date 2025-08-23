import { Router } from 'express';
import { body, query, param } from 'express-validator';
import multer from 'multer';
import * as usersController from '@/controllers/users.controller';
import { validate } from '@/middleware/validation';

const router = Router();

// Configure multer for avatar uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Validation rules
const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone').optional().isMobilePhone('en-SG').withMessage('Valid Singapore phone number required'),
  body('licenseNumber').optional().isString().withMessage('License number must be a string'),
  body('vehicleNumber').optional().isString().withMessage('Vehicle number must be a string'),
  body('phvCompany').optional().isString().withMessage('PHV company must be a string'),
];

const createCategoryValidation = [
  body('name').isString().notEmpty().withMessage('Category name is required'),
  body('type').isIn(['EXPENSE', 'INCOME']).withMessage('Valid category type is required'),
  body('color').optional().isString().withMessage('Color must be a string'),
  body('icon').optional().isString().withMessage('Icon must be a string'),
];

const updateCategoryValidation = [
  param('id').isString().notEmpty().withMessage('Category ID is required'),
  body('name').optional().isString().withMessage('Category name must be a string'),
  body('color').optional().isString().withMessage('Color must be a string'),
  body('icon').optional().isString().withMessage('Icon must be a string'),
];

const createPlatformValidation = [
  body('name').isString().notEmpty().withMessage('Platform name is required'),
  body('type').isIn(['GRAB', 'GOJEK', 'RYDE', 'TADA', 'OTHER']).withMessage('Valid platform type is required'),
  body('commission').isNumeric().withMessage('Commission must be a number'),
  body('apiKey').optional().isString().withMessage('API key must be a string'),
  body('apiSecret').optional().isString().withMessage('API secret must be a string'),
];

const updatePlatformValidation = [
  param('id').isString().notEmpty().withMessage('Platform ID is required'),
  body('name').optional().isString().withMessage('Platform name must be a string'),
  body('commission').optional().isNumeric().withMessage('Commission must be a number'),
  body('apiKey').optional().isString().withMessage('API key must be a string'),
  body('apiSecret').optional().isString().withMessage('API secret must be a string'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

const createVehicleValidation = [
  body('make').isString().notEmpty().withMessage('Vehicle make is required'),
  body('model').isString().notEmpty().withMessage('Vehicle model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
  body('plateNumber').isString().notEmpty().withMessage('Plate number is required'),
  body('type').isIn(['SEDAN', 'HATCHBACK', 'SUV', 'MPV', 'OTHER']).withMessage('Valid vehicle type is required'),
  body('fuelType').isIn(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']).withMessage('Valid fuel type is required'),
  body('fuelCapacity').optional().isNumeric().withMessage('Fuel capacity must be a number'),
  body('fuelEfficiency').optional().isNumeric().withMessage('Fuel efficiency must be a number'),
];

const updateVehicleValidation = [
  param('id').isString().notEmpty().withMessage('Vehicle ID is required'),
  body('make').optional().isString().withMessage('Vehicle make must be a string'),
  body('model').optional().isString().withMessage('Vehicle model must be a string'),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
  body('plateNumber').optional().isString().withMessage('Plate number must be a string'),
  body('type').optional().isIn(['SEDAN', 'HATCHBACK', 'SUV', 'MPV', 'OTHER']).withMessage('Valid vehicle type is required'),
  body('fuelType').optional().isIn(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']).withMessage('Valid fuel type is required'),
  body('fuelCapacity').optional().isNumeric().withMessage('Fuel capacity must be a number'),
  body('fuelEfficiency').optional().isNumeric().withMessage('Fuel efficiency must be a number'),
];

// User Profile Routes
router.get('/profile', usersController.getProfile);
router.put('/profile', updateProfileValidation, validate(updateProfileValidation), usersController.updateProfile);
router.post('/avatar', upload.single('avatar'), usersController.uploadAvatar);
router.delete('/avatar', usersController.deleteAvatar);

// Categories Routes
router.get('/categories', usersController.getCategories);
router.post('/categories', createCategoryValidation, validate(createCategoryValidation), usersController.createCategory);
router.put('/categories/:id', updateCategoryValidation, validate(updateCategoryValidation), usersController.updateCategory);
router.delete('/categories/:id', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), usersController.deleteCategory);

// PHV Platforms Routes
router.get('/platforms', usersController.getPHVPlatforms);
router.post('/platforms', createPlatformValidation, validate(createPlatformValidation), usersController.createPHVPlatform);
router.put('/platforms/:id', updatePlatformValidation, validate(updatePlatformValidation), usersController.updatePHVPlatform);
router.delete('/platforms/:id', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), usersController.deletePHVPlatform);

// Vehicles Routes
router.get('/vehicles', usersController.getVehicles);
router.post('/vehicles', createVehicleValidation, validate(createVehicleValidation), usersController.createVehicle);
router.put('/vehicles/:id', updateVehicleValidation, validate(updateVehicleValidation), usersController.updateVehicle);
router.delete('/vehicles/:id', param('id').isString().notEmpty(), validate([param('id').isString().notEmpty()]), usersController.deleteVehicle);

// User Settings
router.get('/settings', usersController.getSettings);
router.put('/settings', usersController.updateSettings);

// Account Management
router.delete('/account', usersController.deleteAccount);
router.post('/export-data', usersController.exportUserData);

export default router;
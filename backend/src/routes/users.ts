import { Router } from 'express';
import { body, query, param } from 'express-validator';
import multer from 'multer';
import * as usersController from '../controllers/users.controller';
import { validate } from '../middleware/validation';
import { authMiddleware, requireAdmin } from '../middleware/auth';

const router = Router();

// Configure multer for avatar uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// --- Validation Rules ---
const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2 }),
  body('lastName').optional().trim().isLength({ min: 2 }),
  body('phone').optional().isMobilePhone('en-SG'),
];

const createCategoryValidation = [
  body('name').isString().notEmpty(),
  body('type').isIn(['EXPENSE', 'INCOME']),
];

// --- Admin Routes ---
router.get('/', [authMiddleware, requireAdmin], usersController.getAllUsers);

// --- User Profile Routes ---
router.get('/profile', authMiddleware, usersController.getProfile);
router.put('/profile', [authMiddleware, ...updateProfileValidation, validate], usersController.updateProfile);
router.post('/avatar', [authMiddleware, upload.single('avatar')], usersController.uploadAvatar);
router.delete('/avatar', authMiddleware, usersController.deleteAvatar);

// --- Categories Routes ---
router.get('/categories', authMiddleware, usersController.getCategories);
router.post('/categories', [authMiddleware, ...createCategoryValidation, validate], usersController.createCategory);
router.put('/categories/:id', authMiddleware, usersController.updateCategory);
router.delete('/categories/:id', authMiddleware, usersController.deleteCategory);

// --- PHV Platforms Routes ---
router.get('/platforms', authMiddleware, usersController.getPHVPlatforms);
router.post('/platforms', authMiddleware, usersController.createPHVPlatform);
router.put('/platforms/:id', authMiddleware, usersController.updatePHVPlatform);
router.delete('/platforms/:id', authMiddleware, usersController.deletePHVPlatform);

// --- Vehicles Routes ---
router.get('/vehicles', authMiddleware, usersController.getVehicles);
router.post('/vehicles', authMiddleware, usersController.createVehicle);
router.put('/vehicles/:id', authMiddleware, usersController.updateVehicle);
router.delete('/vehicles/:id', authMiddleware, usersController.deleteVehicle);

// --- User Settings ---
router.get('/settings', authMiddleware, usersController.getSettings);
router.put('/settings', authMiddleware, usersController.updateSettings);

// --- Account Management ---
router.delete('/account', authMiddleware, usersController.deleteAccount);
router.post('/export-data', authMiddleware, usersController.exportUserData);

export default router;

import { Request, Response } from 'express';
import { authService, RegisterData, LoginData } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userData: RegisterData = req.body;

  const result = await authService.register(userData);

  logger.info('User registration successful', { userId: result.user.id });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const loginData: LoginData = req.body;

  const result = await authService.login(loginData);

  logger.info('User login successful', { userId: result.user.id });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  const tokens = await authService.refreshToken(refreshToken);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: tokens,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { refreshToken } = req.body;

  if (userId) {
    await authService.logout(userId, refreshToken);
  }

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(userId, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const user = await authService.getUserById(userId);

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: { user },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const updateData = req.body;

  // Remove sensitive fields that shouldn't be updated via this endpoint
  const { password, email, ...safeUpdateData } = updateData;

  const user = await authService.updateProfile(userId, safeUpdateData);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});
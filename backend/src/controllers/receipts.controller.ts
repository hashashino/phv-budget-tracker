import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { asyncHandler, NotFoundError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
// import { ocrService } from '@/services/ocr.service';
import { storageService } from '@/services/storage.service';

export const getReceipts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const {
    page = 1,
    limit = 20,
    processed,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = { userId };

  if (processed !== undefined) {
    where.processedAt = processed === 'true' ? { not: null } : null;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate as string);
    if (endDate) where.createdAt.lte = new Date(endDate as string);
  }

  // Get receipts with pagination
  const [receipts, total] = await Promise.all([
    prisma.receipt.findMany({
      where,
      include: {
        expenses: {
          select: {
            id: true,
            amount: true,
            description: true,
          },
        },
      },
      orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.receipt.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Receipts retrieved successfully',
    data: {
      receipts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

export const getReceipt = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const receipt = await prisma.receipt.findFirst({
    where: { id, userId },
    include: {
      expenses: true,
    },
  });

  if (!receipt) {
    throw new NotFoundError('Receipt not found');
  }

  res.status(200).json({
    success: true,
    message: 'Receipt retrieved successfully',
    data: { receipt },
  });
});

export const uploadReceipt = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const file = req.file;

  if (!file) {
    throw new Error('No file uploaded');
  }

  try {
    // Store the file
    const fileUrl = await storageService.uploadFile(file, userId);

    // Create receipt record
    const receipt = await prisma.receipt.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: fileUrl,
        userId,
      },
    });

    // Process OCR in background
    // ocrService.processReceiptOCR(receipt.id).catch(error => {
    //   logger.error('OCR processing failed', { receiptId: receipt.id, error });
    // });

    logger.info('Receipt uploaded', { userId, receiptId: receipt.id, filename: file.filename });

    res.status(201).json({
      success: true,
      message: 'Receipt uploaded successfully',
      data: { receipt },
    });
  } catch (error) {
    // Clean up file if database operation fails
    if (file.path) {
      await storageService.deleteFile(file.path);
    }
    throw error;
  }
});

export const processReceipt = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Check if receipt exists and belongs to user
  const receipt = await prisma.receipt.findFirst({
    where: { id, userId },
  });

  if (!receipt) {
    throw new NotFoundError('Receipt not found');
  }

  if (receipt.processedAt) {
    res.status(200).json({
      success: true,
      message: 'Receipt already processed',
      data: { receipt },
    });
    return;
  }

  // Process OCR
  // const updatedReceipt = await ocrService.processReceiptOCR(receipt.id);
  const updatedReceipt = receipt; // Placeholder - no OCR processing

  res.status(200).json({
    success: true,
    message: 'Receipt processed successfully',
    data: { receipt: updatedReceipt },
  });
});

export const deleteReceipt = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Check if receipt exists and belongs to user
  const receipt = await prisma.receipt.findFirst({
    where: { id, userId },
  });

  if (!receipt) {
    throw new NotFoundError('Receipt not found');
  }

  // Delete file from storage
  await storageService.deleteFile(receipt.url);

  // Delete receipt record
  await prisma.receipt.delete({
    where: { id },
  });

  logger.info('Receipt deleted', { userId, receiptId: id });

  res.status(200).json({
    success: true,
    message: 'Receipt deleted successfully',
  });
});

export const createExpenseFromReceipt = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { categoryId, description, notes, tags } = req.body;

  // Check if receipt exists and belongs to user
  const receipt = await prisma.receipt.findFirst({
    where: { id, userId },
  });

  if (!receipt) {
    throw new NotFoundError('Receipt not found');
  }

  // Validate category
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) {
    throw new Error('Invalid category');
  }

  // Use OCR data if available, otherwise use provided data
  const amount = receipt.totalAmount || 0;
  const expenseDescription = description || receipt.merchant || 'Expense from receipt';
  const expenseDate = receipt.receiptDate || receipt.createdAt;

  // Create expense
  const expense = await prisma.expense.create({
    data: {
      amount,
      description: expenseDescription,
      date: expenseDate,
      notes,
      tags: tags || [],
      gstAmount: receipt.gstAmount,
      userId,
      categoryId,
      receiptId: receipt.id,
    },
    include: {
      category: true,
      receipt: {
        select: {
          id: true,
          filename: true,
          url: true,
        },
      },
    },
  });

  logger.info('Expense created from receipt', { userId, expenseId: expense.id, receiptId: receipt.id });

  res.status(201).json({
    success: true,
    message: 'Expense created from receipt successfully',
    data: { expense },
  });
});

export const bulkUploadReceipts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new Error('No files uploaded');
  }

  const uploadResults = [];

  for (const file of files) {
    try {
      // Store the file
      const fileUrl = await storageService.uploadFile(file, userId);

      // Create receipt record
      const receipt = await prisma.receipt.create({
        data: {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: fileUrl,
          userId,
        },
      });

      uploadResults.push({
        success: true,
        receipt,
        originalName: file.originalname,
      });

      // Process OCR in background
      // ocrService.processReceiptOCR(receipt.id).catch(error => {
      //   logger.error('OCR processing failed', { receiptId: receipt.id, error });
      // });

    } catch (error) {
      uploadResults.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        originalName: file.originalname,
      });

      // Clean up file if database operation fails
      if (file.path) {
        await storageService.deleteFile(file.path);
      }
    }
  }

  const successCount = uploadResults.filter(r => r.success).length;
  const failureCount = uploadResults.length - successCount;

  logger.info('Bulk receipts uploaded', { userId, successCount, failureCount });

  res.status(201).json({
    success: true,
    message: `${successCount} receipts uploaded successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
    data: {
      results: uploadResults,
      summary: {
        total: uploadResults.length,
        successful: successCount,
        failed: failureCount,
      },
    },
  });
});
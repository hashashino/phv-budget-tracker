import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { bankingIntegrationService } from '@/services/banking/banking-integration.service';
import { prisma } from '@/config/database';
import { BankName } from '@prisma/client';

export const getBankConnections = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const connections = await prisma.bankConnection.findMany({
    where: { userId },
    select: {
      id: true,
      bankName: true,
      accountNumber: true,
      accountType: true,
      isActive: true,
      lastSyncAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Bank connections retrieved successfully',
    data: { connections },
  });
});

export const connectBank = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { bankName, accountNumber, accountType, credentials } = req.body;

  const connection = await bankingIntegrationService.connectBank(userId, {
    bankName: bankName as BankName,
    accountNumber,
    accountType,
    credentials,
  });

  logger.info('Bank connection created', { userId, bankName, connectionId: connection.id });

  res.status(201).json({
    success: true,
    message: 'Bank connected successfully',
    data: { connection },
  });
});

export const getBankConnectionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const connection = await prisma.bankConnection.findFirst({
    where: { id, userId },
    select: {
      id: true,
      bankName: true,
      accountNumber: true,
      accountType: true,
      isActive: true,
      lastSyncAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!connection) {
    res.status(404).json({
      success: false,
      message: 'Bank connection not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Bank connection retrieved successfully',
    data: { connection },
  });
});

export const updateBankConnection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const updateData = req.body;

  const connection = await bankingIntegrationService.updateBankConnection(userId, id, updateData);

  res.status(200).json({
    success: true,
    message: 'Bank connection updated successfully',
    data: { connection },
  });
});

export const deleteBankConnection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  await bankingIntegrationService.deleteBankConnection(userId, id);

  logger.info('Bank connection deleted', { userId, connectionId: id });

  res.status(200).json({
    success: true,
    message: 'Bank connection deleted successfully',
  });
});

export const syncTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { startDate, endDate } = req.body;

  const result = await bankingIntegrationService.syncTransactions(id, { startDate, endDate });

  logger.info('Transactions synced', { userId, connectionId: id, transactionsCount: result.count });

  res.status(200).json({
    success: true,
    message: 'Transactions synced successfully',
    data: result,
  });
});

export const getAccountBalance = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const balance = await bankingIntegrationService.getAccountBalance(id);

  res.status(200).json({
    success: true,
    message: 'Account balance retrieved successfully',
    data: { balance },
  });
});

export const getTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const {
    page = 1,
    limit = 20,
    startDate,
    endDate,
    type,
    minAmount,
    maxAmount,
    merchant,
    category,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {
    bankConnection: { userId },
  };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  if (type) where.type = type;
  if (minAmount) where.amount = { ...where.amount, gte: Number(minAmount) };
  if (maxAmount) where.amount = { ...where.amount, lte: Number(maxAmount) };
  if (merchant) where.merchant = { contains: merchant as string, mode: 'insensitive' };
  if (category) where.category = category;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: {
        bankConnection: {
          select: {
            bankName: true,
            accountType: true,
          },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    message: 'Transactions retrieved successfully',
    data: {
      transactions,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages,
      },
    },
  });
});

export const getTransactionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      bankConnection: { userId },
    },
    include: {
      bankConnection: {
        select: {
          bankName: true,
          accountType: true,
        },
      },
    },
  });

  if (!transaction) {
    res.status(404).json({
      success: false,
      message: 'Transaction not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Transaction retrieved successfully',
    data: { transaction },
  });
});

export const categorizeTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { category, subcategory, notes } = req.body;

  const transaction = await prisma.transaction.update({
    where: {
      id,
      bankConnection: { userId },
    },
    data: {
      category,
      // Additional fields could be added for subcategory and notes
    },
  });

  res.status(200).json({
    success: true,
    message: 'Transaction categorized successfully',
    data: { transaction },
  });
});

export const bulkCategorizeTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { transactionIds, category, subcategory } = req.body;

  const result = await prisma.transaction.updateMany({
    where: {
      id: { in: transactionIds },
      bankConnection: { userId },
    },
    data: {
      category,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Transactions categorized successfully',
    data: { updatedCount: result.count },
  });
});

export const getBankingAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  const analytics = await bankingIntegrationService.getBankingAnalytics(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.status(200).json({
    success: true,
    message: 'Banking analytics retrieved successfully',
    data: analytics,
  });
});

export const getCashFlowAnalysis = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  const cashFlow = await bankingIntegrationService.getCashFlowAnalysis(userId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.status(200).json({
    success: true,
    message: 'Cash flow analysis retrieved successfully',
    data: cashFlow,
  });
});
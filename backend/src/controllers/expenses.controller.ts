import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { asyncHandler, NotFoundError, ValidationError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { gstService } from '@/services/gst.service';

export const getExpenses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const {
    page = 1,
    limit = 20,
    categoryId,
    startDate,
    endDate,
    search,
    sortBy = 'date',
    sortOrder = 'desc',
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = { userId };

  if (categoryId) {
    where.categoryId = categoryId as string;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  if (search) {
    where.OR = [
      { description: { contains: search as string, mode: 'insensitive' } },
      { notes: { contains: search as string, mode: 'insensitive' } },
      { location: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  // Get expenses with pagination
  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
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
      orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.expense.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Expenses retrieved successfully',
    data: {
      expenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

export const getExpense = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const expense = await prisma.expense.findFirst({
    where: { id, userId },
    include: {
      category: true,
      receipt: true,
    },
  });

  if (!expense) {
    throw new NotFoundError('Expense not found');
  }

  res.status(200).json({
    success: true,
    message: 'Expense retrieved successfully',
    data: { expense },
  });
});

export const createExpense = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const {
    amount,
    description,
    date,
    categoryId,
    location,
    notes,
    tags,
    receiptId,
    includeGst = false,
  } = req.body;

  // Validate category belongs to user
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) {
    throw new ValidationError('Invalid category');
  }

  // Calculate GST if needed
  let gstAmount = null;
  let finalAmount = Number(amount);

  if (includeGst) {
    const gstCalculation = gstService.calculateGST(finalAmount);
    gstAmount = Number(gstCalculation.gstAmount);
    finalAmount = Number(gstCalculation.amountBeforeGST);
  }

  const expense = await prisma.expense.create({
    data: {
      amount: finalAmount,
      description,
      date: new Date(date),
      location,
      notes,
      tags: tags || [],
      gstAmount,
      userId,
      categoryId,
      receiptId: receiptId || null,
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

  logger.info('Expense created', { userId, expenseId: expense.id, amount: finalAmount });

  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: { expense },
  });
});

export const updateExpense = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const {
    amount,
    description,
    date,
    categoryId,
    location,
    notes,
    tags,
    receiptId,
    includeGst,
  } = req.body;

  // Check if expense exists and belongs to user
  const existingExpense = await prisma.expense.findFirst({
    where: { id, userId },
  });

  if (!existingExpense) {
    throw new NotFoundError('Expense not found');
  }

  // Validate category if provided
  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!category) {
      throw new ValidationError('Invalid category');
    }
  }

  // Calculate GST if needed
  let gstAmount = existingExpense.gstAmount ? Number(existingExpense.gstAmount) : null;
  let finalAmount = amount ? Number(amount) : Number(existingExpense.amount);

  if (includeGst !== undefined && amount) {
    if (includeGst) {
      const gstCalculation = gstService.calculateGST(finalAmount);
      gstAmount = Number(gstCalculation.gstAmount);
      finalAmount = Number(gstCalculation.amountBeforeGST);
    } else {
      gstAmount = null;
    }
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      ...(amount && { amount: finalAmount }),
      ...(description && { description }),
      ...(date && { date: new Date(date) }),
      ...(categoryId && { categoryId }),
      ...(location !== undefined && { location }),
      ...(notes !== undefined && { notes }),
      ...(tags !== undefined && { tags }),
      ...(receiptId !== undefined && { receiptId }),
      ...(includeGst !== undefined && { gstAmount }),
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

  logger.info('Expense updated', { userId, expenseId: expense.id });

  res.status(200).json({
    success: true,
    message: 'Expense updated successfully',
    data: { expense },
  });
});

export const deleteExpense = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Check if expense exists and belongs to user
  const expense = await prisma.expense.findFirst({
    where: { id, userId },
  });

  if (!expense) {
    throw new NotFoundError('Expense not found');
  }

  await prisma.expense.delete({
    where: { id },
  });

  logger.info('Expense deleted', { userId, expenseId: id });

  res.status(200).json({
    success: true,
    message: 'Expense deleted successfully',
  });
});

export const bulkCreateExpenses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { expenses } = req.body;

  if (!Array.isArray(expenses) || expenses.length === 0) {
    throw new ValidationError('Expenses array is required');
  }

  // Validate all categories belong to user
  const categoryIds = [...new Set(expenses.map(e => e.categoryId))];
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds }, userId },
  });

  if (categories.length !== categoryIds.length) {
    throw new ValidationError('One or more invalid categories');
  }

  // Process expenses with GST calculations
  const processedExpenses = expenses.map(expense => {
    let gstAmount = null;
    let finalAmount = Number(expense.amount);

    if (expense.includeGst) {
      const gstCalculation = gstService.calculateGST(finalAmount);
      gstAmount = Number(gstCalculation.gstAmount);
      finalAmount = Number(gstCalculation.amountBeforeGST);
    }

    return {
      amount: finalAmount,
      description: expense.description,
      date: new Date(expense.date),
      location: expense.location || null,
      notes: expense.notes || null,
      tags: expense.tags || [],
      gstAmount,
      userId,
      categoryId: expense.categoryId,
      receiptId: expense.receiptId || null,
    };
  });

  const createdExpenses = await prisma.expense.createMany({
    data: processedExpenses,
  });

  logger.info('Bulk expenses created', { userId, count: createdExpenses.count });

  res.status(201).json({
    success: true,
    message: `${createdExpenses.count} expenses created successfully`,
    data: { count: createdExpenses.count },
  });
});

export const getExpenseStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  const where: any = { userId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  const [totalExpenses, expensesByCategory] = await Promise.all([
    prisma.expense.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  // Get category details
  const categoryIds = expensesByCategory.map(e => e.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const expensesByCategoryWithDetails = expensesByCategory.map(expense => ({
    category: categoryMap.get(expense.categoryId),
    totalAmount: expense._sum.amount || 0,
    count: expense._count,
  }));

  res.status(200).json({
    success: true,
    message: 'Expense statistics retrieved successfully',
    data: {
      totalAmount: totalExpenses._sum.amount || 0,
      totalCount: totalExpenses._count,
      expensesByCategory: expensesByCategoryWithDetails,
    },
  });
});
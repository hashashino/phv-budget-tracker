import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import { DebtType } from '@prisma/client';

export const getDebts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { page = 1, limit = 20, type, isPaidOff } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = { userId };
  if (type) where.type = type as DebtType;
  if (isPaidOff !== undefined) where.isPaidOff = isPaidOff === 'true';

  const [debts, total] = await Promise.all([
    prisma.debt.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 5,
        },
        _count: {
          select: { payments: true },
        },
      },
    }),
    prisma.debt.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    message: 'Debts retrieved successfully',
    data: {
      debts,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages,
      },
    },
  });
});

export const getDebtSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const [totalDebt, activeDebts, paidOffDebts, totalPayments, nextDue] = await Promise.all([
    prisma.debt.aggregate({
      where: { userId, isPaidOff: false },
      _sum: { amount: true },
    }),
    prisma.debt.count({
      where: { userId, isPaidOff: false },
    }),
    prisma.debt.count({
      where: { userId, isPaidOff: true },
    }),
    prisma.debtPayment.aggregate({
      where: { debt: { userId } },
      _sum: { amount: true },
    }),
    prisma.debt.findFirst({
      where: {
        userId,
        isPaidOff: false,
        dueDate: { not: null },
      },
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        creditor: true,
        amount: true,
        dueDate: true,
        minimumPayment: true,
      },
    }),
  ]);

  const summary = {
    totalDebt: totalDebt._sum.amount || 0,
    activeDebts,
    paidOffDebts,
    totalPaymentsMade: totalPayments._sum.amount || 0,
    nextDueDebt: nextDue,
  };

  res.status(200).json({
    success: true,
    message: 'Debt summary retrieved successfully',
    data: summary,
  });
});

export const createDebt = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const debtData = { ...req.body, userId };

  const debt = await prisma.debt.create({
    data: debtData,
    include: {
      payments: true,
      _count: {
        select: { payments: true },
      },
    },
  });

  logger.info('Debt created', { userId, debtId: debt.id, creditor: debt.creditor });

  res.status(201).json({
    success: true,
    message: 'Debt created successfully',
    data: { debt },
  });
});

export const getDebtById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const debt = await prisma.debt.findFirst({
    where: { id, userId },
    include: {
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
      _count: {
        select: { payments: true },
      },
    },
  });

  if (!debt) {
    res.status(404).json({
      success: false,
      message: 'Debt not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Debt retrieved successfully',
    data: { debt },
  });
});

export const updateDebt = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const updateData = req.body;

  const debt = await prisma.debt.update({
    where: { id, userId },
    data: updateData,
    include: {
      payments: true,
      _count: {
        select: { payments: true },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: 'Debt updated successfully',
    data: { debt },
  });
});

export const deleteDebt = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  await prisma.debt.delete({
    where: { id, userId },
  });

  logger.info('Debt deleted', { userId, debtId: id });

  res.status(200).json({
    success: true,
    message: 'Debt deleted successfully',
  });
});

export const getDebtPayments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const payments = await prisma.debtPayment.findMany({
    where: {
      debt: { id, userId },
    },
    orderBy: { paymentDate: 'desc' },
  });

  res.status(200).json({
    success: true,
    message: 'Debt payments retrieved successfully',
    data: { payments },
  });
});

export const addDebtPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { amount, paymentDate, notes } = req.body;

  // First verify the debt belongs to the user
  const debt = await prisma.debt.findFirst({
    where: { id, userId },
  });

  if (!debt) {
    res.status(404).json({
      success: false,
      message: 'Debt not found',
    });
    return;
  }

  // Create payment and update debt amount
  const [payment, updatedDebt] = await prisma.$transaction([
    prisma.debtPayment.create({
      data: {
        debtId: id,
        amount: Number(amount),
        paymentDate: new Date(paymentDate),
        notes,
      },
    }),
    prisma.debt.update({
      where: { id },
      data: {
        amount: {
          decrement: Number(amount),
        },
        isPaidOff: Number(debt.amount) <= Number(amount),
      },
    }),
  ]);

  logger.info('Debt payment added', { userId, debtId: id, paymentAmount: amount });

  res.status(201).json({
    success: true,
    message: 'Payment added successfully',
    data: { payment, debt: updatedDebt },
  });
});

export const deleteDebtPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { paymentId } = req.params;

  // Get payment to verify ownership and get amount
  const payment = await prisma.debtPayment.findFirst({
    where: {
      id: paymentId,
      debt: { userId },
    },
    include: { debt: true },
  });

  if (!payment) {
    res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
    return;
  }

  // Delete payment and adjust debt amount
  await prisma.$transaction([
    prisma.debtPayment.delete({
      where: { id: paymentId },
    }),
    prisma.debt.update({
      where: { id: payment.debtId },
      data: {
        amount: {
          increment: payment.amount,
        },
        isPaidOff: false,
      },
    }),
  ]);

  logger.info('Debt payment deleted', { userId, paymentId, debtId: payment.debtId });

  res.status(200).json({
    success: true,
    message: 'Payment deleted successfully',
  });
});

export const calculatePayoffProjection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { monthlyPayment, additionalPayment = 0, paymentFrequency = 'MONTHLY' } = req.body;

  const debt = await prisma.debt.findFirst({
    where: { id, userId },
  });

  if (!debt) {
    res.status(404).json({
      success: false,
      message: 'Debt not found',
    });
    return;
  }

  // Calculate payoff projection
  const totalPayment = Number(monthlyPayment) + Number(additionalPayment);
  const interestRate = debt.interestRate ? Number(debt.interestRate) / 100 / 12 : 0; // Monthly rate
  const balance = Number(debt.amount);

  let months = 0;
  let currentBalance = balance;
  const paymentSchedule = [];

  // Calculate payoff schedule (max 600 months to prevent infinite loops)
  while (currentBalance > 0.01 && months < 600) {
    const interestPayment = currentBalance * interestRate;
    const principalPayment = Math.min(totalPayment - interestPayment, currentBalance);
    
    if (principalPayment <= 0) {
      // Payment doesn't cover interest
      months = -1;
      break;
    }

    currentBalance -= principalPayment;
    months++;

    if (months <= 12 || months % 3 === 0) { // Save every 3rd month after first year
      paymentSchedule.push({
        month: months,
        payment: totalPayment,
        interestPayment,
        principalPayment,
        remainingBalance: currentBalance,
      });
    }
  }

  const totalInterest = (totalPayment * months) - balance;
  const totalAmount = totalPayment * months;

  const projection = {
    monthsToPayoff: months > 0 ? months : null,
    yearsToPayoff: months > 0 ? (months / 12).toFixed(1) : null,
    totalInterest: months > 0 ? totalInterest : null,
    totalAmount: months > 0 ? totalAmount : null,
    paymentSchedule,
    isPayable: months > 0 && months <= 600,
  };

  res.status(200).json({
    success: true,
    message: 'Payoff projection calculated successfully',
    data: { projection },
  });
});

export const getPayoffStrategies = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const debts = await prisma.debt.findMany({
    where: { userId, isPaidOff: false },
    orderBy: [
      { interestRate: 'desc' }, // Avalanche method
      { amount: 'asc' }, // Snowball method
    ],
  });

  const strategies = {
    avalanche: {
      name: 'Debt Avalanche',
      description: 'Pay minimum on all debts, extra towards highest interest rate',
      order: [...debts].sort((a, b) => Number(b.interestRate || 0) - Number(a.interestRate || 0)),
    },
    snowball: {
      name: 'Debt Snowball',
      description: 'Pay minimum on all debts, extra towards smallest balance',
      order: [...debts].sort((a, b) => Number(a.amount) - Number(b.amount)),
    },
  };

  res.status(200).json({
    success: true,
    message: 'Payoff strategies retrieved successfully',
    data: { strategies },
  });
});
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import middleware
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler';
import { authMiddleware } from '../src/middleware/auth';
import { validationErrorHandler } from '../src/middleware/validation';

// Import routes
import authRoutes from '../src/routes/auth';
import expenseRoutes from '../src/routes/expenses';
import earningRoutes from '../src/routes/earnings';
import receiptRoutes from '../src/routes/receipts';
import debtRoutes from '../src/routes/debts';
import userRoutes from '../src/routes/users';

// Import utilities
import { logger } from '../src/utils/logger';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Initialize Prisma
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', authMiddleware, expenseRoutes);
app.use('/api/earnings', authMiddleware, earningRoutes);
app.use('/api/receipts', authMiddleware, receiptRoutes);
app.use('/api/debts', authMiddleware, debtRoutes);
app.use('/api/users', authMiddleware, userRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(validationErrorHandler);
app.use(errorHandler);

export default app;
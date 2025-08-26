import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { validationErrorHandler } from './middleware/validation';

// Import routes
import authRoutes from './routes/auth';
import expenseRoutes from './routes/expenses';
import earningRoutes from './routes/earnings';
import receiptRoutes from './routes/receipts';
// import bankingRoutes from './routes/banking';
import debtRoutes from './routes/debts';
// import analyticsRoutes from './routes/analytics';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';

// Import utilities
import { logger } from './utils/logger';
import { initializeServices } from './config/services';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', // Admin web
    'http://localhost:8081', // User frontend
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove any falsy values
  credentials: true,
}));

app.use(compression());
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all requests
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/expenses', authMiddleware, expenseRoutes);
app.use('/api/earnings', authMiddleware, earningRoutes);
app.use('/api/receipts', authMiddleware, receiptRoutes);
// app.use('/api/banking', authMiddleware, bankingRoutes);  // Temporarily disabled
app.use('/api/debts', authMiddleware, debtRoutes);
// app.use('/api/analytics', authMiddleware, analyticsRoutes);  // Temporarily disabled
app.use('/api/users', authMiddleware, userRoutes);

// Handle 404 - must be after all other routes
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(validationErrorHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Initialize services (make it optional)
    try {
      await initializeServices();
    } catch (serviceError) {
      logger.warn('Some services failed to initialize, continuing with limited functionality');
    }
    
    // Connect to database (optional for development)
    if (process.env.DATABASE_URL) {
      try {
        await prisma.$connect();
        logger.info('Connected to database');
      } catch (dbError) {
        logger.warn('Database connection failed, some features will be limited');
      }
    } else {
      logger.warn('No DATABASE_URL provided, running in limited mode without database');
    }

    app.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
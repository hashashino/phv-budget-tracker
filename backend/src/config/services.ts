import { logger } from '@/utils/logger';
import { emailService } from '@/services/email.service';
import { storageService } from '@/services/storage.service';
import { ocrService } from '@/services/ocr.service';
import { redisClient } from '@/utils/redis';

export async function initializeServices(): Promise<void> {
  logger.info('Initializing services...');

  try {
    // Initialize Redis connection (optional)
    try {
      await redisClient.ping();
      logger.info('Redis connection established');
    } catch (redisError) {
      logger.warn('Redis connection failed, continuing without Redis');
    }

    // Initialize storage service
    await storageService.initialize();
    logger.info('Storage service initialized');

    // Initialize OCR service
    await ocrService.initialize();
    logger.info('OCR service initialized');

    // Test email service
    if (process.env.NODE_ENV !== 'test') {
      await emailService.testConnection();
      logger.info('Email service initialized');
    }

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    throw error;
  }
}
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { prisma } from '@/config/database';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { gstService } from './gst.service';
import { NotFoundError } from '@/middleware/errorHandler';

interface OCRResult {
  text: string;
  merchant?: string;
  totalAmount?: number;
  gstAmount?: number;
  receiptDate?: Date;
  receiptNumber?: string;
  confidence: number;
}

class OCRService {
  private client: ImageAnnotatorClient | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      if (!config.googleCloud.projectId || !config.googleCloud.keyFile) {
        logger.warn('Google Cloud Vision API not configured, OCR will be disabled');
        return;
      }

      this.client = new ImageAnnotatorClient({
        projectId: config.googleCloud.projectId,
        keyFilename: config.googleCloud.keyFile,
      });

      this.isInitialized = true;
      logger.info('Google Cloud Vision API initialized');
    } catch (error) {
      logger.error('Failed to initialize Google Cloud Vision API:', error);
      throw error;
    }
  }

  async processReceiptOCR(receiptId: string): Promise<any> {
    if (!this.isInitialized || !this.client) {
      throw new Error('OCR service not initialized');
    }

    // Get receipt from database
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundError('Receipt not found');
    }

    if (receipt.processedAt) {
      logger.info('Receipt already processed', { receiptId });
      return receipt;
    }

    try {
      // Process image with Google Cloud Vision
      const ocrResult = await this.extractTextFromImage(receipt.url);

      // Extract structured data from OCR text
      const extractedData = this.extractReceiptData(ocrResult.text);

      // Update receipt with OCR results
      const updatedReceipt = await prisma.receipt.update({
        where: { id: receiptId },
        data: {
          ocrText: ocrResult.text,
          ocrData: {
            confidence: ocrResult.confidence,
            extractedData,
            processedAt: new Date(),
          },
          merchant: extractedData.merchant,
          totalAmount: extractedData.totalAmount,
          gstAmount: extractedData.gstAmount,
          receiptDate: extractedData.receiptDate,
          receiptNumber: extractedData.receiptNumber,
          processedAt: new Date(),
        },
      });

      logger.info('Receipt OCR processed successfully', { receiptId });
      return updatedReceipt;

    } catch (error) {
      logger.error('OCR processing failed', { receiptId, error });
      
      // Update receipt with error status
      await prisma.receipt.update({
        where: { id: receiptId },
        data: {
          ocrData: {
            error: error instanceof Error ? error.message : 'Unknown OCR error',
            processedAt: new Date(),
          },
          processedAt: new Date(),
        },
      });

      throw error;
    }
  }

  private async extractTextFromImage(imageUrl: string): Promise<OCRResult> {
    if (!this.client) {
      throw new Error('OCR client not initialized');
    }

    try {
      // Perform text detection
      const [result] = await this.client.textDetection(imageUrl);
      const detections = result.textAnnotations;

      if (!detections || detections.length === 0) {
        throw new Error('No text detected in image');
      }

      const fullText = detections[0]?.description || '';
      
      // Calculate confidence score (simplified)
      const confidence = this.calculateConfidence(detections);

      return {
        text: fullText,
        confidence,
      };

    } catch (error) {
      logger.error('Google Cloud Vision API error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  private extractReceiptData(text: string): {
    merchant?: string;
    totalAmount?: number;
    gstAmount?: number;
    receiptDate?: Date;
    receiptNumber?: string;
  } {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return {
      merchant: this.extractMerchant(lines),
      totalAmount: this.extractTotalAmount(text),
      gstAmount: this.extractGSTAmount(text),
      receiptDate: this.extractDate(text),
      receiptNumber: this.extractReceiptNumber(text),
    };
  }

  private extractMerchant(lines: string[]): string | undefined {
    // Usually the merchant name is in the first few lines
    // Look for lines that don't contain numbers, dates, or common receipt keywords
    const excludePatterns = [
      /\d{2}\/\d{2}\/\d{4}/, // Dates
      /\$\d+/, // Money amounts
      /receipt/i,
      /tax/i,
      /gst/i,
      /total/i,
      /subtotal/i,
      /invoice/i,
    ];

    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.length > 3 && line.length < 50) {
        const hasExcludedPattern = excludePatterns.some(pattern => pattern.test(line));
        if (!hasExcludedPattern) {
          return line;
        }
      }
    }

    return undefined;
  }

  private extractTotalAmount(text: string): number | undefined {
    const patterns = [
      /total[:\s]+\$?(\d+\.?\d*)/i,
      /amount[:\s]+\$?(\d+\.?\d*)/i,
      /grand\s+total[:\s]+\$?(\d+\.?\d*)/i,
      /\$(\d+\.\d{2})\s*(?:total|amount)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const amount = parseFloat(match[1]);
        if (amount > 0 && amount < 10000) { // Reasonable range
          return amount;
        }
      }
    }

    return undefined;
  }

  private extractGSTAmount(text: string): number | undefined {
    const gstData = gstService.extractGSTFromReceiptText(text);
    return gstData.gstAmount;
  }

  private extractDate(text: string): Date | undefined {
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\d{1,2}-\d{1,2}-\d{4})/,
      /(\d{4}-\d{1,2}-\d{1,2})/,
      /(\d{1,2}\s+\w{3}\s+\d{4})/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const date = new Date(match[1]);
        if (!isNaN(date.getTime()) && date.getFullYear() > 2000) {
          return date;
        }
      }
    }

    return undefined;
  }

  private extractReceiptNumber(text: string): string | undefined {
    const patterns = [
      /receipt\s*#?:?\s*(\w+)/i,
      /invoice\s*#?:?\s*(\w+)/i,
      /ref\s*#?:?\s*(\w+)/i,
      /order\s*#?:?\s*(\w+)/i,
      /#(\w{6,})/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return undefined;
  }

  private calculateConfidence(detections: any[]): number {
    if (!detections || detections.length === 0) return 0;

    // Simple confidence calculation based on number of detected text blocks
    // and their bounding polygon completeness
    let totalConfidence = 0;
    let validDetections = 0;

    for (const detection of detections.slice(1)) { // Skip first element (full text)
      if (detection.boundingPoly && detection.boundingPoly.vertices) {
        totalConfidence += detection.confidence || 0.8; // Default confidence if not provided
        validDetections++;
      }
    }

    return validDetections > 0 ? totalConfidence / validDetections : 0.5;
  }

  // Process multiple receipts in batch
  async processMultipleReceipts(receiptIds: string[]): Promise<void> {
    logger.info('Starting batch OCR processing', { count: receiptIds.length });

    const promises = receiptIds.map(async (receiptId) => {
      try {
        await this.processReceiptOCR(receiptId);
      } catch (error) {
        logger.error('Failed to process receipt in batch', { receiptId, error });
      }
    });

    await Promise.all(promises);
    logger.info('Batch OCR processing completed', { count: receiptIds.length });
  }

  // Get OCR processing status
  async getProcessingStatus(receiptId: string): Promise<{
    isProcessed: boolean;
    processedAt?: Date;
    hasError: boolean;
    confidence?: number;
  }> {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      select: {
        processedAt: true,
        ocrData: true,
      },
    });

    if (!receipt) {
      throw new NotFoundError('Receipt not found');
    }

    const ocrData = receipt.ocrData as any;
    
    return {
      isProcessed: !!receipt.processedAt,
      processedAt: receipt.processedAt || undefined,
      hasError: !!(ocrData?.error),
      confidence: ocrData?.confidence,
    };
  }

  // Reprocess failed OCR
  async reprocessReceipt(receiptId: string): Promise<any> {
    // Reset processing status
    await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        processedAt: null,
        ocrData: null,
        ocrText: null,
        merchant: null,
        totalAmount: null,
        gstAmount: null,
        receiptDate: null,
        receiptNumber: null,
      },
    });

    // Process again
    return this.processReceiptOCR(receiptId);
  }
}

export const ocrService = new OCRService();
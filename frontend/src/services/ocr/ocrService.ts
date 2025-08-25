import { apiClient } from '@services/api/apiClient';
import * as FileSystem from 'expo-file-system';

export interface OCRResult {
  text: string;
  confidence: number;
  extractedData: {
    amount?: number;
    date?: string;
    vendor?: string;
    items?: Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>;
    total?: number;
    gst?: number;
    currency?: string;
  };
}

export interface ScreenshotProcessingResult {
  platform: string;
  earnings: Array<{
    amount: number;
    date: string;
    trips: number;
    hours: number;
    distance?: number;
  }>;
  confidence: number;
}

class OCRService {
  private readonly API_TIMEOUT = 60000; // 60 seconds for OCR processing

  /**
   * Process receipt image using OCR
   */
  async processReceipt(imageUri: string): Promise<OCRResult> {
    try {
      // Check if image exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);

      // Send to OCR service
      const response = await apiClient.post('/ocr/receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: this.API_TIMEOUT,
      });

      return this.validateOCRResult(response.data);
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Process earnings screenshot from PHV apps
   */
  async processEarningsScreenshot(
    imageUri: string,
    platform: 'grab' | 'gojek' | 'tada' | 'comfort_delgro' | 'uber'
  ): Promise<ScreenshotProcessingResult> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Screenshot file does not exist');
      }

      const formData = new FormData();
      formData.append('screenshot', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'earnings_screenshot.jpg',
      } as any);
      formData.append('platform', platform);

      const response = await apiClient.post('/ocr/earnings-screenshot', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: this.API_TIMEOUT,
      });

      return this.validateScreenshotResult(response.data);
    } catch (error) {
      console.error('Screenshot processing error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Process business card for vendor information
   */
  async processBusinessCard(imageUri: string): Promise<{
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
  }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Business card image does not exist');
      }

      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'business_card.jpg',
      } as any);

      const response = await apiClient.post('/ocr/business-card', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: this.API_TIMEOUT,
      });

      return response.data;
    } catch (error) {
      console.error('Business card processing error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Batch process multiple images
   */
  async batchProcessReceipts(imageUris: string[]): Promise<OCRResult[]> {
    const results: OCRResult[] = [];
    const errors: string[] = [];

    for (const imageUri of imageUris) {
      try {
        const result = await this.processReceipt(imageUri);
        results.push(result);
      } catch (error) {
        errors.push(`Failed to process ${imageUri}: ${this.getErrorMessage(error)}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Batch processing errors:', errors);
    }

    return results;
  }

  /**
   * Validate OCR result structure
   */
  private validateOCRResult(data: any): OCRResult {
    if (!data || typeof data.text !== 'string') {
      throw new Error('Invalid OCR response format');
    }

    return {
      text: data.text,
      confidence: data.confidence || 0,
      extractedData: {
        amount: this.parseAmount(data.extractedData?.amount),
        date: data.extractedData?.date,
        vendor: data.extractedData?.vendor,
        items: data.extractedData?.items || [],
        total: this.parseAmount(data.extractedData?.total),
        gst: this.parseAmount(data.extractedData?.gst),
        currency: data.extractedData?.currency || 'SGD',
      },
    };
  }

  /**
   * Validate screenshot processing result
   */
  private validateScreenshotResult(data: any): ScreenshotProcessingResult {
    if (!data || !data.platform) {
      throw new Error('Invalid screenshot processing response');
    }

    return {
      platform: data.platform,
      earnings: data.earnings || [],
      confidence: data.confidence || 0,
    };
  }

  /**
   * Parse amount from string or number
   */
  private parseAmount(value: any): number | undefined {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unknown error occurred during processing';
  }

  /**
   * Check if OCR service is available
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get('/ocr/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const ocrService = new OCRService();
export default OCRService;
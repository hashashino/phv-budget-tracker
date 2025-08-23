import axios, { AxiosInstance } from 'axios';
import { logger } from '@/utils/logger';
import { cacheService } from '@/utils/redis';

export interface BankAccount {
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  accountName: string;
}

export interface BankTransaction {
  transactionId: string;
  amount: number;
  description: string;
  date: Date;
  type: 'debit' | 'credit';
  category?: string;
  merchant?: string;
  balance?: number;
}

export interface BankConnectionConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  scopes: string[];
}

export abstract class BaseBankService {
  protected client: AxiosInstance;
  protected config: BankConnectionConfig;
  protected bankName: string;

  constructor(bankName: string, config: BankConnectionConfig) {
    this.bankName = bankName;
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PHV-Budget-Tracker/1.0',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`${this.bankName} API Request`, {
          method: config.method,
          url: config.url,
          headers: config.headers,
        });
        return config;
      },
      (error) => {
        logger.error(`${this.bankName} API Request Error`, error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`${this.bankName} API Response`, {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        logger.error(`${this.bankName} API Error`, {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  // Abstract methods that each bank service must implement
  abstract authenticate(authCode: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }>;

  abstract refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }>;

  abstract getAccounts(accessToken: string): Promise<BankAccount[]>;

  abstract getTransactions(
    accessToken: string,
    accountNumber: string,
    fromDate: Date,
    toDate: Date
  ): Promise<BankTransaction[]>;

  // Common methods
  protected async getAccessToken(userId: string, bankConnectionId: string): Promise<string> {
    const cacheKey = `bank_token:${userId}:${bankConnectionId}`;
    const cachedToken = await cacheService.get<string>(cacheKey);
    
    if (cachedToken) {
      return cachedToken;
    }

    throw new Error('Access token not found or expired');
  }

  protected async cacheAccessToken(
    userId: string,
    bankConnectionId: string,
    accessToken: string,
    expiresIn: number
  ): Promise<void> {
    const cacheKey = `bank_token:${userId}:${bankConnectionId}`;
    const ttl = expiresIn - 300; // Refresh 5 minutes before expiry
    await cacheService.set(cacheKey, accessToken, ttl);
  }

  protected handleApiError(error: any): Error {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          return new Error('Authentication failed - token may be expired');
        case 403:
          return new Error('Access forbidden - insufficient permissions');
        case 429:
          return new Error('Rate limit exceeded - too many requests');
        case 500:
          return new Error('Bank service temporarily unavailable');
        default:
          return new Error(`${this.bankName} API error: ${data?.message || 'Unknown error'}`);
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout - bank service is slow to respond');
    }
    
    return new Error(`Network error connecting to ${this.bankName}`);
  }

  protected async makeAuthenticatedRequest<T>(
    userId: string,
    bankConnectionId: string,
    requestFn: (accessToken: string) => Promise<T>
  ): Promise<T> {
    try {
      const accessToken = await this.getAccessToken(userId, bankConnectionId);
      return await requestFn(accessToken);
    } catch (error) {
      // If token error, try to refresh
      if (error instanceof Error && error.message.includes('token')) {
        logger.info(`Attempting to refresh ${this.bankName} token`, { userId, bankConnectionId });
        // Token refresh logic would go here
        // For now, throw the original error
      }
      throw error;
    }
  }

  // Utility methods
  protected formatAmount(amount: string | number): number {
    return parseFloat(amount.toString());
  }

  protected parseDate(dateString: string): Date {
    // Handle various date formats from different banks
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateString}`);
    }
    return date;
  }

  protected categorizeTransaction(description: string): string {
    const description_lower = description.toLowerCase();
    
    // PHV-specific categorization
    if (description_lower.includes('grab') || description_lower.includes('gojek') || 
        description_lower.includes('ryde') || description_lower.includes('tada')) {
      return 'PHV_EARNING';
    }
    
    if (description_lower.includes('petrol') || description_lower.includes('fuel') ||
        description_lower.includes('shell') || description_lower.includes('esso') ||
        description_lower.includes('caltex')) {
      return 'FUEL';
    }
    
    if (description_lower.includes('workshop') || description_lower.includes('service') ||
        description_lower.includes('repair')) {
      return 'VEHICLE_MAINTENANCE';
    }
    
    if (description_lower.includes('insurance')) {
      return 'INSURANCE';
    }
    
    if (description_lower.includes('parking') || description_lower.includes('erp') ||
        description_lower.includes('toll')) {
      return 'TRANSPORT';
    }
    
    return 'OTHER';
  }

  // Get authorization URL for OAuth flow
  getAuthorizationUrl(userId: string, redirectUri: string): string {
    const state = Buffer.from(JSON.stringify({ userId, bankName: this.bankName })).toString('base64');
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      scope: this.config.scopes.join(' '),
      state,
    });

    return `${this.config.baseUrl}/oauth/authorize?${params}`;
  }

  // Validate webhook signature (if supported by bank)
  protected validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implementation would depend on specific bank's webhook signature method
    // This is a placeholder
    return true;
  }
}
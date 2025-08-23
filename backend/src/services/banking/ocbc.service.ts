import { BaseBankService, BankAccount, BankTransaction, BankConnectionConfig } from './base-bank.service';
import { config } from '@/config/environment';

export class OCBCBankService extends BaseBankService {
  constructor() {
    const ocbcConfig: BankConnectionConfig = {
      clientId: config.banking.ocbc.clientId || '',
      clientSecret: config.banking.ocbc.clientSecret || '',
      baseUrl: config.banking.ocbc.baseUrl,
      scopes: ['account_info', 'transactions', 'balance_inquiry'],
    };

    super('OCBC', ocbcConfig);
  }

  async authenticate(authCode: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const response = await this.client.post('/oauth2/token', {
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: authCode,
        redirect_uri: 'postmessage', // OCBC uses postmessage for mobile apps
      });

      const { access_token, refresh_token, expires_in } = response.data;

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
      };
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const response = await this.client.post('/oauth2/token', {
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token, expires_in } = response.data;

      return {
        accessToken: access_token,
        refreshToken: refresh_token || refreshToken,
        expiresIn: expires_in,
      };
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getAccounts(accessToken: string): Promise<BankAccount[]> {
    try {
      const response = await this.client.get('/api/v1/accounts', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-API-Version': '1.0',
        },
      });

      const accountsData = response.data.data || response.data.accounts || [];

      return accountsData.map((account: any) => ({
        accountNumber: account.accountNumber || account.maskedAccountNumber,
        accountType: this.mapOCBCAccountType(account.accountType || account.productType),
        balance: this.formatAmount(account.currentBalance || account.availableBalance || 0),
        currency: account.currency || 'SGD',
        accountName: account.accountName || account.nickName || `OCBC ${account.productType}`,
      }));
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getTransactions(
    accessToken: string,
    accountNumber: string,
    fromDate: Date,
    toDate: Date
  ): Promise<BankTransaction[]> {
    try {
      const response = await this.client.get(`/api/v1/accounts/${accountNumber}/transactions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-API-Version': '1.0',
        },
        params: {
          startDate: fromDate.toISOString().split('T')[0],
          endDate: toDate.toISOString().split('T')[0],
          pageSize: 200, // OCBC API page size
        },
      });

      const transactions = response.data.data || response.data.transactions || [];

      return transactions.map((txn: any) => {
        const amount = this.formatAmount(txn.amount || txn.transactionAmount || 0);
        const isDebit = txn.debitCreditIndicator === 'DEBIT' || 
                       txn.transactionType === 'DEBIT' || 
                       amount < 0;

        return {
          transactionId: txn.transactionId || txn.id || txn.reference,
          amount: Math.abs(amount),
          description: this.cleanOCBCDescription(txn.description || txn.transactionDescription || ''),
          date: this.parseDate(txn.transactionDate || txn.valueDate),
          type: isDebit ? 'debit' : 'credit',
          category: this.categorizeTransaction(txn.description || txn.transactionDescription || ''),
          merchant: this.extractMerchantFromOCBC(txn.description || txn.transactionDescription || ''),
          balance: txn.runningBalance ? this.formatAmount(txn.runningBalance) : undefined,
        };
      });
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // OCBC-specific methods
  private mapOCBCAccountType(ocbcType: string): string {
    const typeMapping: Record<string, string> = {
      'SAVINGS': 'SAVINGS',
      'CURRENT': 'CURRENT',
      'CASA': 'SAVINGS', // Current and Savings Account
      'FD': 'FIXED_DEPOSIT',
      'TD': 'FIXED_DEPOSIT', // Time Deposit
      'CREDITCARD': 'CREDIT_CARD',
      'LOAN': 'LOAN',
    };

    return typeMapping[ocbcType?.toUpperCase()] || 'SAVINGS';
  }

  private cleanOCBCDescription(description: string): string {
    // Remove OCBC-specific prefixes and codes
    return description
      .replace(/^(TXN|TRF|PAY|DPT|WDL|FEE)\s*[-:]?\s*/i, '')
      .replace(/\s+REF:\s*\w+$/, '') // Remove reference numbers
      .replace(/\s+\d{2}\/\d{2}\/\d{2}$/, '') // Remove date suffixes
      .trim();
  }

  private extractMerchantFromOCBC(description: string): string | undefined {
    const cleanDescription = this.cleanOCBCDescription(description);
    
    // OCBC transaction patterns
    const merchantPatterns = [
      /^([A-Z\s&]+?)\s+(?:SG|SINGAPORE)/i, // Merchant name before location
      /^([A-Z\s&]+?)\s+\d+/i, // Merchant name before numbers
      /^([A-Z\s&]{3,})/i, // Generic merchant name
    ];

    for (const pattern of merchantPatterns) {
      const match = cleanDescription.match(pattern);
      if (match && match[1] && match[1].length > 2) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  // OCBC 360 Account specific features
  async get360BonusDetails(accessToken: string, accountNumber: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/v1/accounts/${accountNumber}/360-bonus`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-API-Version': '1.0',
        },
      });

      return response.data;
    } catch (error) {
      // 360 bonus might not be available for all accounts
      console.warn('360 bonus details not available:', error.message);
      return null;
    }
  }

  // OCBC Pay Anyone integration
  async getPayAnyoneTransactions(
    accessToken: string,
    fromDate: Date,
    toDate: Date
  ): Promise<BankTransaction[]> {
    try {
      const response = await this.client.get('/api/v1/pay-anyone/transactions', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-API-Version': '1.0',
        },
        params: {
          startDate: fromDate.toISOString().split('T')[0],
          endDate: toDate.toISOString().split('T')[0],
        },
      });

      const transactions = response.data.data || [];

      return transactions.map((txn: any) => ({
        transactionId: `payanyone_${txn.id}`,
        amount: this.formatAmount(txn.amount),
        description: `Pay Anyone - ${txn.description || txn.recipientName}`,
        date: this.parseDate(txn.transactionDate),
        type: 'debit' as const,
        category: 'DIGITAL_PAYMENT',
        merchant: txn.recipientName,
      }));
    } catch (error) {
      console.warn('Pay Anyone transactions not available:', error.message);
      return [];
    }
  }

  getAccountTypes(): string[] {
    return [
      'SAVINGS',
      'CURRENT',
      'CASA',
      'FIXED_DEPOSIT',
      'FOREIGN_CURRENCY',
      'CREDIT_CARD',
      'LOAN',
    ];
  }
}
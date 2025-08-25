import { BaseBankService, BankAccount, BankTransaction, BankConnectionConfig } from './base-bank.service';
import { config } from '../../config/environment';

export class UOBBankService extends BaseBankService {
  constructor() {
    const uobConfig: BankConnectionConfig = {
      clientId: config.banking.uob.clientId || '',
      clientSecret: config.banking.uob.clientSecret || '',
      baseUrl: config.banking.uob.baseUrl,
      scopes: ['accounts', 'transactions', 'balances'],
    };

    super('UOB', uobConfig);
  }

  async authenticate(authCode: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const response = await this.client.post('/oauth/v1/token', {
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: authCode,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
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
      const response = await this.client.post('/oauth/v1/token', {
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
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
      const response = await this.client.get('/personal/v1/accounts', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'X-UOB-API-VERSION': '1.0',
        },
      });

      const accountsData = response.data.accounts || response.data.data || [];

      return accountsData.map((account: any) => ({
        accountNumber: account.accountNumber || account.accountId,
        accountType: this.mapUOBAccountType(account.accountType || account.productCode),
        balance: this.formatAmount(account.availableBalance || account.currentBalance || 0),
        currency: account.currency || 'SGD',
        accountName: account.accountName || account.productName || `UOB ${account.accountType}`,
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
      const response = await this.client.get(`/personal/v1/accounts/${accountNumber}/transactions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'X-UOB-API-VERSION': '1.0',
        },
        params: {
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
          maxResults: 500, // UOB API limit
        },
      });

      const transactions = response.data.transactions || response.data.data || [];

      return transactions.map((txn: any) => {
        const amount = this.formatAmount(txn.amount || txn.transactionAmount || 0);
        const isDebit = txn.creditDebitIndicator === 'DEBIT' || 
                       txn.type === 'DEBIT' || 
                       amount < 0;

        return {
          transactionId: txn.transactionId || txn.id || txn.referenceNumber,
          amount: Math.abs(amount),
          description: this.cleanUOBDescription(txn.description || txn.narrative || ''),
          date: this.parseDate(txn.transactionDate || txn.valueDate),
          type: isDebit ? 'debit' : 'credit',
          category: this.categorizeTransaction(txn.description || txn.narrative || ''),
          merchant: this.extractMerchantFromUOB(txn.description || txn.narrative || ''),
          balance: txn.runningBalance ? this.formatAmount(txn.runningBalance) : undefined,
        };
      });
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // UOB-specific methods
  private mapUOBAccountType(uobType: string): string {
    const typeMapping: Record<string, string> = {
      'SDA': 'SAVINGS', // Savings Deposit Account
      'CDA': 'CURRENT', // Current Deposit Account
      'FDA': 'FIXED_DEPOSIT', // Fixed Deposit Account
      'FCA': 'FOREIGN_CURRENCY', // Foreign Currency Account
      'CCA': 'CREDIT_CARD', // Credit Card Account
      'HLA': 'LOAN', // Housing Loan Account
      'PLA': 'LOAN', // Personal Loan Account
      'SAVINGS': 'SAVINGS',
      'CURRENT': 'CURRENT',
    };

    return typeMapping[uobType?.toUpperCase()] || 'SAVINGS';
  }

  private cleanUOBDescription(description: string): string {
    // Remove UOB-specific prefixes and codes
    return description
      .replace(/^(POS|ATM|IBG|FAST|GIRO|BILL)\s*[-:]?\s*/i, '')
      .replace(/\s+TXN\s*ID:\s*\w+$/, '') // Remove transaction ID
      .replace(/\s+\d{2}\/\d{2}\/\d{4}$/, '') // Remove date suffixes
      .replace(/\s+SG$/, '') // Remove country code
      .trim();
  }

  private extractMerchantFromUOB(description: string): string | undefined {
    const cleanDescription = this.cleanUOBDescription(description);
    
    // UOB transaction patterns
    const merchantPatterns = [
      /^([A-Z\s&]+?)\s+(?:SINGAPORE|SG)/i,
      /^([A-Z\s&]+?)\s+\d{6,}/i, // Merchant before long number sequences
      /^([A-Z\s&]{4,})/i, // Generic merchant name
    ];

    for (const pattern of merchantPatterns) {
      const match = cleanDescription.match(pattern);
      if (match && match[1] && match[1].length > 3) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  // UOB ONE Account specific features
  async getONEAccountBonuses(accessToken: string, accountNumber: string): Promise<any> {
    try {
      const response = await this.client.get(`/personal/v1/accounts/${accountNumber}/one-bonuses`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-UOB-API-VERSION': '1.0',
        },
      });

      return response.data;
    } catch (error) {
      console.warn('ONE Account bonuses not available:', error.message);
      return null;
    }
  }

  // UOB Pay Now integration
  async getPayNowTransactions(
    accessToken: string,
    fromDate: Date,
    toDate: Date
  ): Promise<BankTransaction[]> {
    try {
      const response = await this.client.get('/personal/v1/paynow/transactions', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-UOB-API-VERSION': '1.0',
        },
        params: {
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
        },
      });

      const transactions = response.data.transactions || [];

      return transactions.map((txn: any) => ({
        transactionId: `paynow_${txn.id}`,
        amount: this.formatAmount(txn.amount),
        description: `PayNow - ${txn.description || txn.recipientInfo}`,
        date: this.parseDate(txn.transactionDate),
        type: txn.type?.toLowerCase() as 'debit' | 'credit',
        category: 'DIGITAL_PAYMENT',
        merchant: txn.recipientInfo || txn.recipientName,
      }));
    } catch (error) {
      console.warn('PayNow transactions not available:', error.message);
      return [];
    }
  }

  // UOB Credit Card transactions
  async getCreditCardTransactions(
    accessToken: string,
    cardNumber: string,
    fromDate: Date,
    toDate: Date
  ): Promise<BankTransaction[]> {
    try {
      const response = await this.client.get(`/personal/v1/creditcards/${cardNumber}/transactions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-UOB-API-VERSION': '1.0',
        },
        params: {
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
        },
      });

      const transactions = response.data.transactions || [];

      return transactions.map((txn: any) => ({
        transactionId: `cc_${txn.transactionId}`,
        amount: this.formatAmount(txn.amount),
        description: txn.merchantName || txn.description,
        date: this.parseDate(txn.transactionDate),
        type: 'debit' as const, // Credit card transactions are typically debits
        category: this.categorizeTransaction(txn.merchantName || txn.description),
        merchant: txn.merchantName,
      }));
    } catch (error) {
      console.warn('Credit card transactions not available:', error.message);
      return [];
    }
  }

  // UOB Investment accounts
  async getInvestmentAccounts(accessToken: string): Promise<any[]> {
    try {
      const response = await this.client.get('/personal/v1/investments/accounts', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-UOB-API-VERSION': '1.0',
        },
      });

      return response.data.accounts || [];
    } catch (error) {
      console.warn('Investment accounts not available:', error.message);
      return [];
    }
  }

  getAccountTypes(): string[] {
    return [
      'SAVINGS',
      'CURRENT',
      'FIXED_DEPOSIT',
      'FOREIGN_CURRENCY',
      'CREDIT_CARD',
      'LOAN',
      'INVESTMENT',
    ];
  }

  // UOB-specific fee information
  async getAccountFees(accessToken: string, accountNumber: string): Promise<any> {
    try {
      const response = await this.client.get(`/personal/v1/accounts/${accountNumber}/fees`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-UOB-API-VERSION': '1.0',
        },
      });

      return response.data;
    } catch (error) {
      console.warn('Account fees not available:', error.message);
      return null;
    }
  }
}
import { BaseBankService, BankAccount, BankTransaction, BankConnectionConfig } from './base-bank.service';
import { config } from '@/config/environment';

export class DBSBankService extends BaseBankService {
  constructor() {
    const dbsConfig: BankConnectionConfig = {
      clientId: config.banking.dbs.clientId || '',
      clientSecret: config.banking.dbs.clientSecret || '',
      baseUrl: config.banking.dbs.baseUrl,
      scopes: ['accounts', 'transactions', 'balance'],
    };

    super('DBS', dbsConfig);
  }

  async authenticate(authCode: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const response = await this.client.post('/oauth/token', {
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: authCode,
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
      const response = await this.client.post('/oauth/token', {
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token, expires_in } = response.data;

      return {
        accessToken: access_token,
        refreshToken: refresh_token || refreshToken, // Some banks don't return new refresh token
        expiresIn: expires_in,
      };
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getAccounts(accessToken: string): Promise<BankAccount[]> {
    try {
      const response = await this.client.get('/accounts', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const accounts = response.data.accounts || response.data.data || [];

      return accounts.map((account: any) => ({
        accountNumber: account.accountNumber || account.account_number,
        accountType: account.accountType || account.account_type || 'SAVINGS',
        balance: this.formatAmount(account.balance || account.availableBalance || 0),
        currency: account.currency || 'SGD',
        accountName: account.accountName || account.name || `DBS Account ${account.accountNumber}`,
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
      const response = await this.client.get(`/accounts/${accountNumber}/transactions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          fromDate: fromDate.toISOString().split('T')[0], // YYYY-MM-DD format
          toDate: toDate.toISOString().split('T')[0],
          limit: 500, // DBS API limit
        },
      });

      const transactions = response.data.transactions || response.data.data || [];

      return transactions.map((txn: any) => {
        const amount = this.formatAmount(txn.amount || txn.transactionAmount || 0);
        const isDebit = txn.transactionType === 'DEBIT' || 
                       txn.type === 'DEBIT' || 
                       amount < 0;

        return {
          transactionId: txn.transactionId || txn.id || txn.referenceNumber,
          amount: Math.abs(amount),
          description: txn.description || txn.narrative || txn.particulars || '',
          date: this.parseDate(txn.transactionDate || txn.date),
          type: isDebit ? 'debit' : 'credit',
          category: this.categorizeTransaction(txn.description || txn.narrative || ''),
          merchant: this.extractMerchant(txn.description || txn.narrative || ''),
          balance: txn.runningBalance ? this.formatAmount(txn.runningBalance) : undefined,
        };
      });
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // DBS-specific methods
  async getAccountBalance(accessToken: string, accountNumber: string): Promise<number> {
    try {
      const response = await this.client.get(`/accounts/${accountNumber}/balance`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return this.formatAmount(response.data.balance || response.data.availableBalance || 0);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  private extractMerchant(description: string): string | undefined {
    // Remove common DBS transaction prefixes
    const cleanDescription = description
      .replace(/^(POS|ATM|IBG|FAST|NETS|VISA|MASTERCARD)\s*/i, '')
      .replace(/\s*\d{2}\/\d{2}\s*$/, '') // Remove date suffix
      .replace(/\s*SG\s*$/, '') // Remove country code
      .trim();

    // Extract merchant name (usually the first part before numbers/codes)
    const merchantMatch = cleanDescription.match(/^([A-Za-z\s&]+)/);
    return merchantMatch ? merchantMatch[1].trim() : undefined;
  }

  // Get DBS-specific account types
  getAccountTypes(): string[] {
    return [
      'SAVINGS',
      'CURRENT', 
      'FIXED_DEPOSIT',
      'FOREIGN_CURRENCY',
      'LOAN',
      'CREDIT_CARD',
    ];
  }

  // DBS PayLah! integration (if available)
  async getPayLahTransactions(
    accessToken: string,
    fromDate: Date,
    toDate: Date
  ): Promise<BankTransaction[]> {
    try {
      const response = await this.client.get('/paylah/transactions', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
        },
      });

      const transactions = response.data.transactions || [];

      return transactions.map((txn: any) => ({
        transactionId: `paylah_${txn.id}`,
        amount: this.formatAmount(txn.amount),
        description: `PayLah! - ${txn.description}`,
        date: this.parseDate(txn.date),
        type: txn.type.toLowerCase() as 'debit' | 'credit',
        category: 'DIGITAL_PAYMENT',
        merchant: txn.merchant,
      }));
    } catch (error) {
      // PayLah! might not be available for all accounts
      console.warn('PayLah! transactions not available:', error.message);
      return [];
    }
  }
}
import { apiClient } from '@services/api/apiClient';
import { storageService } from '@services/storage/storageService';
import { BankAccount, BankTransaction } from '@types/index';
import { SINGAPORE_BANKS } from '@constants/index';

export interface BankConnectionConfig {
  bankCode: string;
  accountNumber: string;
  credentials: {
    username?: string;
    password?: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  category?: string;
  type?: 'debit' | 'credit';
}

export interface BankSyncResult {
  success: boolean;
  accountsUpdated: number;
  transactionsAdded: number;
  lastSyncTime: string;
  errors?: string[];
}

class BankingService {
  private readonly CACHE_DURATION = 30; // 30 minutes
  private readonly SYNC_ENDPOINT = '/banking';

  /**
   * Connect a bank account
   */
  async connectBankAccount(config: BankConnectionConfig): Promise<BankAccount> {
    try {
      // Validate bank code
      const supportedBank = SINGAPORE_BANKS.find(bank => bank.value === config.bankCode);
      if (!supportedBank) {
        throw new Error('Unsupported bank. Please contact support.');
      }

      // Send connection request to backend
      const response = await apiClient.post(`${this.SYNC_ENDPOINT}/connect`, {
        bankCode: config.bankCode,
        accountNumber: config.accountNumber,
        credentials: config.credentials,
      });

      const bankAccount: BankAccount = response.data;

      // Cache the account information
      await this.cacheBankAccount(bankAccount);

      return bankAccount;
    } catch (error) {
      console.error('Error connecting bank account:', error);
      throw new Error(this.getBankingErrorMessage(error));
    }
  }

  /**
   * Get all connected bank accounts
   */
  async getBankAccounts(useCache: boolean = true): Promise<BankAccount[]> {
    try {
      // Try cache first if requested
      if (useCache) {
        const cached = await storageService.getCacheItem<BankAccount[]>('bank_accounts');
        if (cached) {
          return cached;
        }
      }

      const response = await apiClient.get(`${this.SYNC_ENDPOINT}/accounts`);
      const accounts: BankAccount[] = response.data;

      // Cache the accounts
      await storageService.setCacheItem('bank_accounts', accounts, this.CACHE_DURATION);

      return accounts;
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      throw new Error('Failed to fetch bank accounts');
    }
  }

  /**
   * Sync transactions from all connected banks
   */
  async syncAllAccounts(): Promise<BankSyncResult> {
    try {
      const response = await apiClient.post(`${this.SYNC_ENDPOINT}/sync`);
      const result: BankSyncResult = response.data;

      // Clear cached data to force refresh
      await this.clearBankingCache();

      return result;
    } catch (error) {
      console.error('Error syncing bank accounts:', error);
      throw new Error('Failed to sync bank accounts');
    }
  }

  /**
   * Sync specific bank account
   */
  async syncAccount(accountId: string): Promise<BankSyncResult> {
    try {
      const response = await apiClient.post(`${this.SYNC_ENDPOINT}/sync/${accountId}`);
      const result: BankSyncResult = response.data;

      // Clear cached data for this account
      await storageService.removeItem(`bank_transactions_${accountId}`);

      return result;
    } catch (error) {
      console.error(`Error syncing account ${accountId}:`, error);
      throw new Error('Failed to sync bank account');
    }
  }

  /**
   * Get bank transactions
   */
  async getBankTransactions(
    accountId: string,
    filter?: TransactionFilter,
    useCache: boolean = true
  ): Promise<BankTransaction[]> {
    try {
      const cacheKey = `bank_transactions_${accountId}`;

      // Try cache first if no filter is applied
      if (useCache && !filter) {
        const cached = await storageService.getCacheItem<BankTransaction[]>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const response = await apiClient.get(`${this.SYNC_ENDPOINT}/transactions/${accountId}`, {
        params: filter,
      });
      const transactions: BankTransaction[] = response.data;

      // Cache only if no filter was applied
      if (!filter) {
        await storageService.setCacheItem(cacheKey, transactions, this.CACHE_DURATION);
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching bank transactions:', error);
      throw new Error('Failed to fetch bank transactions');
    }
  }

  /**
   * Categorize bank transaction
   */
  async categorizeTransaction(
    transactionId: string,
    category: string,
    isExpenseRelated: boolean
  ): Promise<void> {
    try {
      await apiClient.put(`${this.SYNC_ENDPOINT}/transactions/${transactionId}/categorize`, {
        category,
        isExpenseRelated,
      });

      // Clear transaction cache to force refresh
      await this.clearTransactionCache();
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      throw new Error('Failed to categorize transaction');
    }
  }

  /**
   * Create expense from bank transaction
   */
  async createExpenseFromTransaction(
    transactionId: string,
    expenseData: {
      category: string;
      description?: string;
      tags?: string[];
    }
  ): Promise<void> {
    try {
      await apiClient.post(`${this.SYNC_ENDPOINT}/transactions/${transactionId}/create-expense`, expenseData);
    } catch (error) {
      console.error('Error creating expense from transaction:', error);
      throw new Error('Failed to create expense from transaction');
    }
  }

  /**
   * Disconnect bank account
   */
  async disconnectBankAccount(accountId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.SYNC_ENDPOINT}/accounts/${accountId}`);

      // Clear cached data for this account
      await Promise.all([
        storageService.removeItem(`bank_account_${accountId}`),
        storageService.removeItem(`bank_transactions_${accountId}`),
      ]);

      // Clear accounts cache
      await storageService.removeItem('bank_accounts');
    } catch (error) {
      console.error('Error disconnecting bank account:', error);
      throw new Error('Failed to disconnect bank account');
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<number> {
    try {
      const response = await apiClient.get(`${this.SYNC_ENDPOINT}/accounts/${accountId}/balance`);
      return response.data.balance;
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw new Error('Failed to get account balance');
    }
  }

  /**
   * Check bank connection status
   */
  async checkConnectionStatus(accountId: string): Promise<{
    connected: boolean;
    lastSync: string;
    error?: string;
  }> {
    try {
      const response = await apiClient.get(`${this.SYNC_ENDPOINT}/accounts/${accountId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error checking connection status:', error);
      return {
        connected: false,
        lastSync: '',
        error: 'Failed to check connection status',
      };
    }
  }

  /**
   * Get spending insights from bank data
   */
  async getSpendingInsights(
    accountId: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<{
    totalSpent: number;
    avgDailySpent: number;
    topCategories: Array<{ category: string; amount: number; percentage: number }>;
    monthlyTrend: Array<{ month: string; amount: number }>;
  }> {
    try {
      const response = await apiClient.get(`${this.SYNC_ENDPOINT}/insights/${accountId}`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting spending insights:', error);
      throw new Error('Failed to get spending insights');
    }
  }

  /**
   * Auto-categorize transactions using AI
   */
  async autoCategorizePendingTransactions(accountId: string): Promise<{
    categorized: number;
    skipped: number;
  }> {
    try {
      const response = await apiClient.post(`${this.SYNC_ENDPOINT}/auto-categorize/${accountId}`);
      return response.data;
    } catch (error) {
      console.error('Error auto-categorizing transactions:', error);
      throw new Error('Failed to auto-categorize transactions');
    }
  }

  /**
   * Export bank transactions
   */
  async exportTransactions(
    accountId: string,
    format: 'csv' | 'excel' | 'pdf',
    filter?: TransactionFilter
  ): Promise<string> {
    try {
      const response = await apiClient.post(`${this.SYNC_ENDPOINT}/export/${accountId}`, {
        format,
        filter,
      });
      return response.data.downloadUrl;
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw new Error('Failed to export transactions');
    }
  }

  /**
   * Cache bank account information
   */
  private async cacheBankAccount(account: BankAccount): Promise<void> {
    await storageService.setCacheItem(`bank_account_${account.id}`, account, this.CACHE_DURATION);
  }

  /**
   * Clear all banking-related cache
   */
  private async clearBankingCache(): Promise<void> {
    const keys = [
      'bank_accounts',
      'bank_sync_status',
    ];

    await Promise.all(keys.map(key => storageService.removeItem(key)));
  }

  /**
   * Clear transaction cache
   */
  private async clearTransactionCache(): Promise<void> {
    // This would ideally remove all transaction cache items
    // For now, we'll just clear the general transaction cache
    await storageService.removeItem('bank_transactions');
  }

  /**
   * Get user-friendly error message for banking errors
   */
  private getBankingErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    const status = error.response?.status;
    switch (status) {
      case 400:
        return 'Invalid banking credentials or account information';
      case 401:
        return 'Banking session expired. Please reconnect your account';
      case 403:
        return 'Access denied. Please check your banking permissions';
      case 404:
        return 'Bank account not found';
      case 429:
        return 'Too many banking requests. Please try again later';
      case 500:
        return 'Banking service temporarily unavailable';
      default:
        return error.message || 'Banking operation failed';
    }
  }

  /**
   * Check if banking service is available
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get(`${this.SYNC_ENDPOINT}/health`);
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const bankingService = new BankingService();
export default BankingService;
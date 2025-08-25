import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { BankName, TransactionType } from '@prisma/client';
import { DBSBankService } from './dbs.service';
import { OCBCBankService } from './ocbc.service';
import { UOBBankService } from './uob.service';
import { BaseBankService, BankAccount, BankTransaction } from './base-bank.service';
import { NotFoundError, ValidationError } from '../../middleware/errorHandler';
import { cacheService } from '../../utils/redis';

export interface BankConnectionData {
  bankName: BankName;
  authCode: string;
  redirectUri: string;
}

export interface SyncResult {
  accountsUpdated: number;
  transactionsAdded: number;
  transactionsUpdated: number;
  errors: string[];
}

class BankingIntegrationService {
  private bankServices: Map<BankName, BaseBankService> = new Map();

  constructor() {
    this.initializeBankServices();
  }

  private initializeBankServices(): void {
    // Initialize bank services based on configuration
    this.bankServices.set(BankName.DBS, new DBSBankService());
    this.bankServices.set(BankName.OCBC, new OCBCBankService());
    this.bankServices.set(BankName.UOB, new UOBBankService());
    
    logger.info('Banking services initialized', { 
      banks: Array.from(this.bankServices.keys()) 
    });
  }

  private getBankService(bankName: BankName): BaseBankService {
    const service = this.bankServices.get(bankName);
    if (!service) {
      throw new ValidationError(`Bank service not available: ${bankName}`);
    }
    return service;
  }

  async connectBank(userId: string, connectionData: BankConnectionData): Promise<{
    connectionId: string;
    accounts: BankAccount[];
  }> {
    const { bankName, authCode, redirectUri } = connectionData;
    const bankService = this.getBankService(bankName);

    try {
      // Authenticate with bank
      const authResult = await bankService.authenticate(authCode);
      
      // Get accounts
      const accounts = await bankService.getAccounts(authResult.accessToken);
      
      if (accounts.length === 0) {
        throw new ValidationError('No accounts found for this bank connection');
      }

      // Create bank connection record
      const bankConnection = await prisma.bankConnection.create({
        data: {
          bankName,
          accountNumber: accounts[0].accountNumber, // Primary account
          accountType: accounts[0].accountType,
          userId,
          accessToken: this.encryptToken(authResult.accessToken),
          refreshToken: this.encryptToken(authResult.refreshToken),
          lastSyncAt: new Date(),
        },
      });

      // Cache access token
      await this.cacheAccessToken(
        userId,
        bankConnection.id,
        authResult.accessToken,
        authResult.expiresIn
      );

      logger.info('Bank connected successfully', {
        userId,
        bankName,
        connectionId: bankConnection.id,
        accountsCount: accounts.length,
      });

      return {
        connectionId: bankConnection.id,
        accounts,
      };

    } catch (error) {
      logger.error('Bank connection failed', {
        userId,
        bankName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async disconnectBank(userId: string, connectionId: string): Promise<void> {
    const connection = await this.getBankConnection(userId, connectionId);

    // Remove cached tokens
    await cacheService.delete(`bank_token:${userId}:${connectionId}`);

    // Delete connection and all associated transactions
    await prisma.$transaction([
      prisma.transaction.deleteMany({
        where: { bankConnectionId: connectionId },
      }),
      prisma.bankConnection.delete({
        where: { id: connectionId },
      }),
    ]);

    logger.info('Bank disconnected', { userId, connectionId, bankName: connection.bankName });
  }

  async syncBankData(userId: string, connectionId?: string): Promise<SyncResult> {
    const connections = connectionId 
      ? [await this.getBankConnection(userId, connectionId)]
      : await prisma.bankConnection.findMany({ where: { userId, isActive: true } });

    if (connections.length === 0) {
      throw new NotFoundError('No bank connections found');
    }

    let totalAccountsUpdated = 0;
    let totalTransactionsAdded = 0;
    let totalTransactionsUpdated = 0;
    const allErrors: string[] = [];

    for (const connection of connections) {
      try {
        const result = await this.syncSingleConnection(connection);
        totalAccountsUpdated += result.accountsUpdated;
        totalTransactionsAdded += result.transactionsAdded;
        totalTransactionsUpdated += result.transactionsUpdated;
        allErrors.push(...result.errors);

        // Update last sync time
        await prisma.bankConnection.update({
          where: { id: connection.id },
          data: { lastSyncAt: new Date() },
        });

      } catch (error) {
        const errorMessage = `${connection.bankName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        allErrors.push(errorMessage);
        logger.error('Bank sync failed for connection', {
          connectionId: connection.id,
          bankName: connection.bankName,
          error: errorMessage,
        });
      }
    }

    const result: SyncResult = {
      accountsUpdated: totalAccountsUpdated,
      transactionsAdded: totalTransactionsAdded,
      transactionsUpdated: totalTransactionsUpdated,
      errors: allErrors,
    };

    logger.info('Bank sync completed', { userId, result });
    return result;
  }

  private async syncSingleConnection(connection: any): Promise<SyncResult> {
    const bankService = this.getBankService(connection.bankName);
    let accountsUpdated = 0;
    let transactionsAdded = 0;
    let transactionsUpdated = 0;
    const errors: string[] = [];

    try {
      // Get fresh access token
      const accessToken = await this.getValidAccessToken(connection);

      // Get accounts and update balances
      const accounts = await bankService.getAccounts(accessToken);
      
      for (const account of accounts) {
        if (account.accountNumber === connection.accountNumber) {
          // Update account balance if needed
          accountsUpdated++;
          break;
        }
      }

      // Sync transactions from last sync date or 30 days ago
      const fromDate = connection.lastSyncAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = new Date();

      const transactions = await bankService.getTransactions(
        accessToken,
        connection.accountNumber,
        fromDate,
        toDate
      );

      // Save transactions
      for (const transaction of transactions) {
        try {
          await this.saveTransaction(connection.id, transaction);
          transactionsAdded++;
        } catch (error) {
          if (error instanceof Error && error.message.includes('unique constraint')) {
            // Transaction already exists, try to update
            try {
              await this.updateTransaction(connection.id, transaction);
              transactionsUpdated++;
            } catch (updateError) {
              errors.push(`Failed to update transaction ${transaction.transactionId}: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`);
            }
          } else {
            errors.push(`Failed to save transaction ${transaction.transactionId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error during sync');
    }

    return { accountsUpdated, transactionsAdded, transactionsUpdated, errors };
  }

  private async saveTransaction(bankConnectionId: string, transaction: BankTransaction): Promise<void> {
    await prisma.transaction.create({
      data: {
        externalId: transaction.transactionId,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        type: transaction.type === 'debit' ? TransactionType.DEBIT : TransactionType.CREDIT,
        category: transaction.category,
        merchant: transaction.merchant,
        balance: transaction.balance,
        bankConnectionId,
      },
    });
  }

  private async updateTransaction(bankConnectionId: string, transaction: BankTransaction): Promise<void> {
    await prisma.transaction.updateMany({
      where: {
        bankConnectionId,
        externalId: transaction.transactionId,
      },
      data: {
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        merchant: transaction.merchant,
        balance: transaction.balance,
      },
    });
  }

  private async getValidAccessToken(connection: any): Promise<string> {
    const userId = connection.userId;
    const cacheKey = `bank_token:${userId}:${connection.id}`;
    
    // Try to get cached token
    let accessToken = await cacheService.get<string>(cacheKey);
    
    if (!accessToken) {
      // Try to refresh token
      const bankService = this.getBankService(connection.bankName);
      const refreshToken = this.decryptToken(connection.refreshToken);
      
      const authResult = await bankService.refreshAccessToken(refreshToken);
      
      // Update stored tokens
      await prisma.bankConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: this.encryptToken(authResult.accessToken),
          refreshToken: this.encryptToken(authResult.refreshToken),
        },
      });

      // Cache new token
      await this.cacheAccessToken(
        userId,
        connection.id,
        authResult.accessToken,
        authResult.expiresIn
      );

      accessToken = authResult.accessToken;
    }

    return accessToken;
  }

  private async getBankConnection(userId: string, connectionId: string): Promise<any> {
    const connection = await prisma.bankConnection.findFirst({
      where: { id: connectionId, userId },
    });

    if (!connection) {
      throw new NotFoundError('Bank connection not found');
    }

    return connection;
  }

  private async cacheAccessToken(
    userId: string,
    connectionId: string,
    accessToken: string,
    expiresIn: number
  ): Promise<void> {
    const cacheKey = `bank_token:${userId}:${connectionId}`;
    const ttl = expiresIn - 300; // Expire 5 minutes before actual expiry
    await cacheService.set(cacheKey, accessToken, ttl);
  }

  // Placeholder encryption methods - implement with proper encryption
  private encryptToken(token: string): string {
    // TODO: Implement proper encryption using crypto library
    return Buffer.from(token).toString('base64');
  }

  private decryptToken(encryptedToken: string): string {
    // TODO: Implement proper decryption
    return Buffer.from(encryptedToken, 'base64').toString();
  }

  // Get user's bank connections
  async getUserBankConnections(userId: string): Promise<any[]> {
    return prisma.bankConnection.findMany({
      where: { userId },
      select: {
        id: true,
        bankName: true,
        accountNumber: true,
        accountType: true,
        isActive: true,
        lastSyncAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get transactions for a user
  async getUserTransactions(
    userId: string,
    options: {
      connectionId?: string;
      fromDate?: Date;
      toDate?: Date;
      type?: TransactionType;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ transactions: any[]; total: number }> {
    const {
      connectionId,
      fromDate,
      toDate,
      type,
      limit = 50,
      offset = 0,
    } = options;

    const where: any = {
      bankConnection: { userId },
    };

    if (connectionId) {
      where.bankConnectionId = connectionId;
    }

    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = fromDate;
      if (toDate) where.date.lte = toDate;
    }

    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          bankConnection: {
            select: {
              bankName: true,
              accountNumber: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
  }

  // Get authorization URLs for all supported banks
  getAuthorizationUrls(userId: string, redirectUri: string): Record<string, string> {
    const urls: Record<string, string> = {};

    for (const [bankName, service] of this.bankServices) {
      urls[bankName] = service.getAuthorizationUrl(userId, redirectUri);
    }

    return urls;
  }

  // Manual refresh for a specific connection
  async refreshConnection(userId: string, connectionId: string): Promise<void> {
    const connection = await this.getBankConnection(userId, connectionId);
    const bankService = this.getBankService(connection.bankName);

    try {
      const refreshToken = this.decryptToken(connection.refreshToken);
      const authResult = await bankService.refreshAccessToken(refreshToken);

      // Update stored tokens
      await prisma.bankConnection.update({
        where: { id: connectionId },
        data: {
          accessToken: this.encryptToken(authResult.accessToken),
          refreshToken: this.encryptToken(authResult.refreshToken),
        },
      });

      // Update cache
      await this.cacheAccessToken(
        userId,
        connectionId,
        authResult.accessToken,
        authResult.expiresIn
      );

      logger.info('Bank connection refreshed', { userId, connectionId });

    } catch (error) {
      logger.error('Failed to refresh bank connection', {
        userId,
        connectionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

export const bankingIntegrationService = new BankingIntegrationService();
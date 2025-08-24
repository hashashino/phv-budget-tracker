import { Request } from 'express';
import { User, BankName, CategoryType, PlatformType, VehicleType, FuelType, DebtType, TransactionType } from '@prisma/client';

// Express Request interface extension is in middleware/auth.ts

// Common response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DateRangeParams {
  startDate?: Date;
  endDate?: Date;
}

// Authentication types
export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  licenseNumber?: string;
  vehicleNumber?: string;
  phvCompany?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
}

// Banking types
export interface BankConnectionData {
  bankName: BankName;
  accountNumber: string;
  accountType: string;
  credentials?: Record<string, any>;
}

export interface TransactionSyncOptions {
  startDate?: Date;
  endDate?: Date;
  forceSync?: boolean;
}

export interface BankingAnalyticsOptions extends DateRangeParams {
  bankConnectionId?: string;
}

// Expense types
export interface ExpenseData {
  amount: number;
  description: string;
  date: Date;
  categoryId: string;
  location?: string;
  notes?: string;
  tags?: string[];
  receiptId?: string;
  gstAmount?: number;
}

export interface ExpenseFilters extends DateRangeParams, PaginationParams {
  categoryId?: string;
  search?: string;
  sortBy?: 'date' | 'amount' | 'description' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
}

// Earning types
export interface EarningData {
  amount: number;
  grossAmount: number;
  netAmount: number;
  date: Date;
  platformId: string;
  vehicleId?: string;
  commission?: number;
  incentive?: number;
  tips?: number;
  startTime?: Date;
  endTime?: Date;
  distance?: number;
  trips?: number;
  workingHours?: number;
  fuelCost?: number;
  notes?: string;
}

export interface EarningFilters extends DateRangeParams, PaginationParams {
  platformId?: string;
  vehicleId?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'date' | 'amount' | 'netAmount' | 'workingHours';
  sortOrder?: 'asc' | 'desc';
}

export interface EarningsUploadData {
  platform: string;
  data: Array<{
    date: string;
    amount: number;
    trips?: number;
    hours?: number;
    distance?: number;
  }>;
}

// Receipt types
export interface ReceiptUploadOptions {
  description?: string;
  autoProcess?: boolean;
}

export interface OCRResult {
  merchant?: string;
  totalAmount?: number;
  gstAmount?: number;
  receiptDate?: Date;
  receiptNumber?: string;
  items?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  }>;
  confidence: number;
  rawText: string;
}

// Debt types
export interface DebtData {
  creditor: string;
  amount: number;
  originalAmount: number;
  type: DebtType;
  interestRate?: number;
  dueDate?: Date;
  minimumPayment?: number;
  description?: string;
}

export interface DebtPaymentData {
  amount: number;
  paymentDate: Date;
  notes?: string;
}

export interface PayoffProjectionOptions {
  monthlyPayment: number;
  additionalPayment?: number;
  paymentFrequency?: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';
}

export interface PayoffProjectionResult {
  monthsToPayoff: number | null;
  yearsToPayoff: string | null;
  totalInterest: number | null;
  totalAmount: number | null;
  paymentSchedule: Array<{
    month: number;
    payment: number;
    interestPayment: number;
    principalPayment: number;
    remainingBalance: number;
  }>;
  isPayable: boolean;
}

// Analytics types
export interface AnalyticsOptions extends DateRangeParams {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  groupBy?: string;
}

export interface PHVAnalyticsOptions extends AnalyticsOptions {
  platformId?: string;
  vehicleId?: string;
}

export interface ExpenseAnalyticsOptions extends AnalyticsOptions {
  categoryId?: string;
}

export interface ProfitabilityOptions extends DateRangeParams {
  platformId?: string;
  includeFixedCosts?: boolean;
}

export interface DashboardData {
  totalEarnings: number;
  totalExpenses: number;
  netIncome: number;
  totalDebt: number;
  recentTransactions: any[];
  upcomingDues: any[];
  monthlyTrends: any[];
}

export interface PerformanceMetrics {
  avgEarningsPerHour: number;
  avgEarningsPerTrip: number;
  avgTripsPerDay: number;
  totalWorkingHours: number;
  totalTrips: number;
  totalDistance: number;
  fuelEfficiency: number;
}

export interface PeakHoursData {
  hour: number;
  dayOfWeek: string;
  avgEarnings: number;
  avgTrips: number;
  efficiency: number;
}

// PHV Platform types
export interface PHVPlatformData {
  name: string;
  type: PlatformType;
  commission: number;
  apiKey?: string;
  apiSecret?: string;
  isActive?: boolean;
}

// Vehicle types
export interface VehicleData {
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  type: VehicleType;
  fuelType: FuelType;
  fuelCapacity?: number;
  fuelEfficiency?: number;
}

// Category types
export interface CategoryData {
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
}

// File upload types
export interface FileUploadOptions {
  file: Buffer;
  filename: string;
  contentType: string;
  metadata?: Record<string, any>;
}

export interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
  contentType: string;
}

// Email types
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
}

// Notification types
export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  data?: Record<string, any>;
}

// GST calculation types
export interface GSTCalculation {
  amount: number;
  gstAmount: number;
  netAmount: number;
  gstRate: number;
  isGSTInclusive: boolean;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Cache types
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[];
}

// Logging types
export interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, any>;
}

// Error types
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

// Export specific error classes
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  public readonly errors: ValidationError[];

  constructor(message: string = 'Validation Error', errors: ValidationError[] = []) {
    super(message, 422);
    this.errors = errors;
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service Unavailable') {
    super(message, 503);
  }
}
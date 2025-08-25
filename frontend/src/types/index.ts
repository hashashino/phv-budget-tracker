export type UserRole = 
  | 'USER'
  | 'CUSTOMER_SUPPORT'
  | 'OPERATIONS_ADMIN'
  | 'TECHNICAL_ADMIN'
  | 'FINANCE_MANAGER'
  | 'SUPER_ADMIN';

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  licenseNumber: string;
  vehicleDetails?: VehicleDetails;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vehicleType: 'private_hire' | 'taxi';
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
}

// Expense Types
export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  receiptUrl?: string;
  location?: Location;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'fuel'
  | 'maintenance'
  | 'insurance'
  | 'license_fees'
  | 'parking'
  | 'tolls'
  | 'erp'
  | 'cleaning'
  | 'meals'
  | 'phone_bill'
  | 'data_plan'
  | 'car_rental'
  | 'inspection'
  | 'road_tax'
  | 'other';

// Earnings Types
export interface Earning {
  id: string;
  userId: string;
  amount: number;
  source: EarningSource;
  platform: Platform;
  tripId?: string;
  date: string;
  startLocation?: Location;
  endLocation?: Location;
  duration?: number; // in minutes
  distance?: number; // in kilometers
  tips?: number;
  surge?: number;
  createdAt: string;
  updatedAt: string;
}

export type EarningSource = 'trip' | 'bonus' | 'incentive' | 'referral' | 'other';

export type Platform = 'grab' | 'gojek' | 'tada' | 'comfort_delgro' | 'uber' | 'other';

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  postalCode?: string;
}

// Receipt Types
export interface Receipt {
  id: string;
  userId: string;
  expenseId?: string;
  imageUrl: string;
  ocrText?: string;
  extractedAmount?: number;
  extractedDate?: string;
  extractedVendor?: string;
  isProcessed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Financial Summary Types
export interface FinancialSummary {
  totalEarnings: number;
  totalExpenses: number;
  netIncome: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  expensesByCategory: Record<ExpenseCategory, number>;
  earningsByPlatform: Record<Platform, number>;
}

// Debt Projection Types
export interface DebtProjection {
  currentDebt: number;
  monthlyPayment: number;
  interestRate: number;
  projectedPayoffDate: string;
  totalInterest: number;
  monthlyProjections: MonthlyProjection[];
}

export interface MonthlyProjection {
  month: string;
  remainingDebt: number;
  interestPayment: number;
  principalPayment: number;
}

// Banking Integration Types
export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountType: 'savings' | 'checking';
  balance: number;
  isActive: boolean;
  lastSyncedAt: string;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  date: string;
  type: 'debit' | 'credit';
  category?: string;
  isExpenseRelated: boolean;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ReceiptCapture: { expenseId?: string };
  ExpenseDetails: { expenseId: string };
  EarningDetails: { earningId: string };
  Reports: { period?: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  ExpensesStack: undefined;
  EarningsStack: undefined;
  ReceiptsStack: undefined;
  Reports: undefined;
  Settings: undefined;
  Admin: undefined;
};

export type ExpensesStackParamList = {
  ExpensesList: undefined;
  ExpenseEntry: { initialCategory?: ExpenseCategory; receiptImage?: string };
  ExpenseDetails: { expenseId: string };
};

export type EarningsStackParamList = {
  EarningsList: undefined;
  EarningEntry: { initialPlatform?: Platform };
  EarningDetails: { earningId: string };
};

export type ReceiptsStackParamList = {
  ReceiptsList: undefined;
  ReceiptCapture: { expenseId?: string };
  ReceiptDetails: { receiptId: string };
};

// Form Types
export interface ExpenseFormData {
  amount: string;
  category: ExpenseCategory;
  description: string;
  date: Date;
  receiptImage?: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
  tags: string[];
}

export interface EarningFormData {
  amount: string;
  source: EarningSource;
  platform: Platform;
  date: Date;
  startLocation?: string;
  endLocation?: string;
  duration?: string;
  distance?: string;
  tips?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  text: string;
  disabled: string;
  placeholder: string;
}

// PHV-specific Types
export interface PHVTrip {
  id: string;
  platform: Platform;
  startTime: string;
  endTime: string;
  startLocation: Location;
  endLocation: Location;
  distance: number;
  duration: number;
  fare: number;
  commission: number;
  netEarning: number;
  surge?: number;
  tips?: number;
  gst?: number;
  tollCharges?: number;
  erpCharges?: number;
}

export interface GST {
  amount: number;
  rate: number; // Singapore GST is 8% as of 2023
  included: boolean;
}

export interface TaxSummary {
  period: 'monthly' | 'quarterly' | 'yearly';
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  gstCollected: number;
  gstPaid: number;
  netGST: number;
  incomeTax: number;
}

export interface FuelConsumption {
  date: string;
  amount: number;
  pricePerLiter: number;
  liters: number;
  odometer: number;
  fuelEfficiency?: number; // km per liter
}

export interface MaintenanceRecord {
  id: string;
  type: 'regular_service' | 'repair' | 'inspection' | 'other';
  description: string;
  cost: number;
  date: string;
  odometer: number;
  vendor: string;
  nextServiceDue?: number; // odometer reading
  warrantyExpiry?: string;
}

// Component Props Types
export interface BaseComponentProps {
  testID?: string;
  style?: any;
}
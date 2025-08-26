export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // PHV specific fields
  licenseNumber?: string;
  vehicleNumber?: string;
  phvCompany?: string;
  
  // Regional settings
  countryCode: string;
  preferredLanguage: string;
  timezone: string;
  
  // Financial access tracking
  lastFinancialAccess?: string;
  financialAccessLevel: number;
  requiresApproval: boolean;
  approvedBy?: string;
}

export enum UserRole {
  USER = 'USER',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
  OPERATIONS_ADMIN = 'OPERATIONS_ADMIN',
  TECHNICAL_ADMIN = 'TECHNICAL_ADMIN',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalExpenses: number;
  totalEarnings: number;
  recentRegistrations: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
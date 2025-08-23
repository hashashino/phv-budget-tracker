import { ExpenseCategory, Platform, EarningSource } from '@types/index';

// App Configuration
export const APP_CONFIG = {
  NAME: 'PHV Driver Budget Tracker',
  VERSION: '1.0.0',
  CURRENCY: 'SGD',
  CURRENCY_SYMBOL: '$',
  LOCALE: 'en-SG',
  TIMEZONE: 'Asia/Singapore',
} as const;

// Singapore PHV Platforms
export const PHV_PLATFORMS: Record<Platform, { label: string; color: string }> = {
  grab: { label: 'Grab', color: '#00B14F' },
  gojek: { label: 'Gojek', color: '#00AA13' },
  tada: { label: 'TADA', color: '#FF6B6B' },
  comfort_delgro: { label: 'ComfortDelGro', color: '#E30613' },
  uber: { label: 'Uber', color: '#000000' },
  other: { label: 'Other', color: '#6B7280' },
} as const;

// Expense Categories
export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  fuel: { label: 'Fuel', icon: 'gas-station', color: '#EF4444' },
  maintenance: { label: 'Maintenance', icon: 'car-wrench', color: '#F97316' },
  insurance: { label: 'Insurance', icon: 'shield-check', color: '#8B5CF6' },
  license_fees: { label: 'License & Fees', icon: 'card-account-details', color: '#06B6D4' },
  parking: { label: 'Parking', icon: 'parking', color: '#84CC16' },
  tolls: { label: 'Tolls', icon: 'highway', color: '#F59E0B' },
  erp: { label: 'ERP Charges', icon: 'gate', color: '#DC2626' },
  cleaning: { label: 'Car Cleaning', icon: 'car-wash', color: '#10B981' },
  meals: { label: 'Meals', icon: 'food', color: '#EC4899' },
  phone_bill: { label: 'Phone Bill', icon: 'phone', color: '#6366F1' },
  data_plan: { label: 'Data Plan', icon: 'wifi', color: '#3B82F6' },
  car_rental: { label: 'Car Rental', icon: 'car-rental', color: '#7C3AED' },
  inspection: { label: 'Inspection', icon: 'clipboard-check', color: '#059669' },
  road_tax: { label: 'Road Tax', icon: 'currency-usd', color: '#EA580C' },
  other: { label: 'Other', icon: 'dots-horizontal', color: '#6B7280' },
} as const;

// Earning Sources
export const EARNING_SOURCES: Record<EarningSource, { label: string; icon: string; color: string }> = {
  trip: { label: 'Trip Fare', icon: 'car', color: '#10B981' },
  bonus: { label: 'Bonus', icon: 'gift', color: '#F59E0B' },
  incentive: { label: 'Incentive', icon: 'star', color: '#8B5CF6' },
  referral: { label: 'Referral', icon: 'account-plus', color: '#06B6D4' },
  other: { label: 'Other', icon: 'cash', color: '#6B7280' },
} as const;

// Time Periods
export const TIME_PERIODS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

// Recurring Frequencies
export const RECURRING_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

// Singapore Banks
export const SINGAPORE_BANKS = [
  { value: 'dbs', label: 'DBS Bank' },
  { value: 'ocbc', label: 'OCBC Bank' },
  { value: 'uob', label: 'United Overseas Bank (UOB)' },
  { value: 'maybank', label: 'Maybank Singapore' },
  { value: 'cimb', label: 'CIMB Bank' },
  { value: 'hsbc', label: 'HSBC Singapore' },
  { value: 'standard_chartered', label: 'Standard Chartered' },
  { value: 'citibank', label: 'Citibank Singapore' },
  { value: 'other', label: 'Other' },
] as const;

// Chart Colors
export const CHART_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#84CC16', // Lime
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#6B7280', // Gray
] as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  NOTIFICATION_SETTINGS: 'notification_settings',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  EXPENSES: {
    LIST: '/expenses',
    CREATE: '/expenses',
    UPDATE: '/expenses',
    DELETE: '/expenses',
    UPLOAD_RECEIPT: '/expenses/receipt',
  },
  EARNINGS: {
    LIST: '/earnings',
    CREATE: '/earnings',
    UPDATE: '/earnings',
    DELETE: '/earnings',
  },
  RECEIPTS: {
    LIST: '/receipts',
    UPLOAD: '/receipts/upload',
    PROCESS_OCR: '/receipts/ocr',
  },
  REPORTS: {
    SUMMARY: '/reports/summary',
    DETAILED: '/reports/detailed',
    EXPORT: '/reports/export',
  },
  BANKING: {
    ACCOUNTS: '/banking/accounts',
    TRANSACTIONS: '/banking/transactions',
    SYNC: '/banking/sync',
  },
} as const;

// Singapore Specific Constants
export const SINGAPORE_CONFIG = {
  GST_RATE: 0.08, // 8% GST as of 2024
  CPF_CONTRIBUTION: {
    EMPLOYEE_RATE: 0.20, // 20%
    EMPLOYER_RATE: 0.17, // 17%
  },
  PHV_LICENSE_FEES: {
    VOCATIONAL_LICENSE: 50, // SGD per year
    PRIVATE_HIRE_CAR_LICENSE: 720, // SGD per year
  },
  COMMON_FUEL_STATIONS: [
    'Shell',
    'Esso',
    'Caltex',
    'SPC',
    'Sinopec',
    'PetroChina',
  ],
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  DISPLAY_WITH_TIME: 'DD MMM YYYY, HH:mm',
  API: 'YYYY-MM-DD',
  FILE_NAME: 'YYYYMMDD_HHmmss',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_SG: /^(\+65)?[689]\d{7}$/,
  LICENSE_PLATE_SG: /^[A-Z]{1,3}\d{1,4}[A-Z]?$/,
  AMOUNT: /^\d+(\.\d{1,2})?$/,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  BIOMETRIC_AUTH: true,
  BANKING_INTEGRATION: true,
  OCR_PROCESSING: true,
  VOICE_NOTES: false, // Future feature
  AI_CATEGORIZATION: false, // Future feature
} as const;
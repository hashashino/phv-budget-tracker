import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { APP_CONFIG, SINGAPORE_CONFIG } from '@constants/index';

/**
 * Currency formatting utilities
 */
export const formatCurrency = (amount: number, currency: string = APP_CONFIG.CURRENCY): string => {
  return new Intl.NumberFormat(APP_CONFIG.LOCALE, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCurrencyCompact = (amount: number): string => {
  if (Math.abs(amount) >= 1000000) {
    return formatCurrency(amount / 1000000) + 'M';
  }
  if (Math.abs(amount) >= 1000) {
    return formatCurrency(amount / 1000) + 'K';
  }
  return formatCurrency(amount);
};

/**
 * Date formatting utilities
 */
export const formatDate = (date: string | Date, formatString: string = 'dd MMM yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd MMM yyyy, HH:mm');
};

export const formatRelativeDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays <= 7) return `${diffInDays} days ago`;
  if (diffInDays <= 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays <= 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

/**
 * Date range utilities
 */
export const getDateRange = (period: 'week' | 'month' | 'quarter' | 'year', date: Date = new Date()) => {
  switch (period) {
    case 'week':
      return {
        start: startOfWeek(date, { weekStartsOn: 1 }), // Monday start
        end: endOfWeek(date, { weekStartsOn: 1 }),
      };
    case 'month':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    case 'quarter':
      const quarter = Math.floor(date.getMonth() / 3);
      const startMonth = quarter * 3;
      return {
        start: new Date(date.getFullYear(), startMonth, 1),
        end: new Date(date.getFullYear(), startMonth + 3, 0),
      };
    case 'year':
      return {
        start: startOfYear(date),
        end: endOfYear(date),
      };
    default:
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
  }
};

/**
 * Tax and GST utilities
 */
export const calculateGST = (amount: number, isInclusive: boolean = true): {
  amount: number;
  gst: number;
  total: number;
} => {
  const gstRate = SINGAPORE_CONFIG.GST_RATE;
  
  if (isInclusive) {
    // GST is included in the amount
    const gst = amount * gstRate / (1 + gstRate);
    return {
      amount: amount - gst,
      gst: gst,
      total: amount,
    };
  } else {
    // GST is additional to the amount
    const gst = amount * gstRate;
    return {
      amount: amount,
      gst: gst,
      total: amount + gst,
    };
  }
};

export const calculateIncomeTax = (annualIncome: number): number => {
  // Simplified Singapore income tax calculation for residents
  // This is a basic calculation - actual tax calculation is more complex
  const brackets = [
    { min: 0, max: 20000, rate: 0 },
    { min: 20000, max: 30000, rate: 0.02 },
    { min: 30000, max: 40000, rate: 0.035 },
    { min: 40000, max: 80000, rate: 0.07 },
    { min: 80000, max: 120000, rate: 0.115 },
    { min: 120000, max: 160000, rate: 0.15 },
    { min: 160000, max: 200000, rate: 0.18 },
    { min: 200000, max: 240000, rate: 0.19 },
    { min: 240000, max: 280000, rate: 0.195 },
    { min: 280000, max: 320000, rate: 0.20 },
    { min: 320000, max: Infinity, rate: 0.22 },
  ];

  let tax = 0;
  let remainingIncome = annualIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;
    
    const taxableInThisBracket = Math.min(remainingIncome, bracket.max - bracket.min);
    tax += taxableInThisBracket * bracket.rate;
    remainingIncome -= taxableInThisBracket;
  }

  return tax;
};

/**
 * Validation utilities
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateSingaporePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+65)?[689]\d{7}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateLicensePlate = (licensePlate: string): boolean => {
  const plateRegex = /^[A-Z]{1,3}\d{1,4}[A-Z]?$/;
  return plateRegex.test(licensePlate.toUpperCase());
};

export const validateAmount = (amount: string): boolean => {
  const amountRegex = /^\d+(\.\d{1,2})?$/;
  return amountRegex.test(amount) && parseFloat(amount) > 0;
};

/**
 * String utilities
 */
export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength - 3) + '...';
};

export const generateRandomId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Number utilities
 */
export const roundToDecimal = (number: number, decimals: number = 2): number => {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat(APP_CONFIG.LOCALE).format(number);
};

export const parseFormattedNumber = (formattedNumber: string): number => {
  return parseFloat(formattedNumber.replace(/[^\d.-]/g, ''));
};

/**
 * Array utilities
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Color utilities
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Debounce utility
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Error handling utilities
 */
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: any): boolean => {
  return !error.response && error.request;
};

/**
 * Platform specific utilities
 */
export const isAndroid = (): boolean => {
  return require('react-native').Platform.OS === 'android';
};

export const isIOS = (): boolean => {
  return require('react-native').Platform.OS === 'ios';
};

/**
 * File utilities
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * PHV specific utilities
 */
export const calculateFuelEfficiency = (distance: number, fuelUsed: number): number => {
  if (fuelUsed === 0) return 0;
  return roundToDecimal(distance / fuelUsed, 2);
};

export const calculateHourlyRate = (earnings: number, hours: number): number => {
  if (hours === 0) return 0;
  return roundToDecimal(earnings / hours, 2);
};

export const calculatePerKmRate = (earnings: number, distance: number): number => {
  if (distance === 0) return 0;
  return roundToDecimal(earnings / distance, 2);
};

/**
 * Export utilities object
 */
export const utils = {
  // Currency
  formatCurrency,
  formatCurrencyCompact,
  
  // Date
  formatDate,
  formatDateTime,
  formatRelativeDate,
  getDateRange,
  
  // Tax
  calculateGST,
  calculateIncomeTax,
  
  // Validation
  validateEmail,
  validateSingaporePhone,
  validateLicensePlate,
  validateAmount,
  
  // String
  capitalizeFirstLetter,
  truncateText,
  generateRandomId,
  
  // Number
  roundToDecimal,
  formatNumber,
  parseFormattedNumber,
  
  // Array
  groupBy,
  sortBy,
  
  // Color
  hexToRgba,
  getContrastColor,
  
  // Function
  debounce,
  
  // Error
  getErrorMessage,
  isNetworkError,
  
  // Platform
  isAndroid,
  isIOS,
  
  // File
  getFileExtension,
  formatFileSize,
  
  // PHV
  calculateFuelEfficiency,
  calculateHourlyRate,
  calculatePerKmRate,
};
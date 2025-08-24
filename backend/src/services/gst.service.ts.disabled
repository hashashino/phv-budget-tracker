import { config } from '@/config/environment';
import Decimal from 'decimal.js';

export interface GSTCalculation {
  amountBeforeGST: number;
  gstAmount: number;
  amountAfterGST: number;
  gstRate: number;
}

class GSTService {
  private readonly gstRate = config.singapore.gstRate; // 8% GST rate for Singapore

  /**
   * Calculate GST when the amount includes GST
   * Used when user enters the total amount paid (inclusive of GST)
   */
  calculateGST(amountInclusiveOfGST: number): GSTCalculation {
    const totalAmount = new Decimal(amountInclusiveOfGST);
    const gstRate = new Decimal(this.gstRate);
    const multiplier = new Decimal(1).plus(gstRate);

    const amountBeforeGST = totalAmount.dividedBy(multiplier);
    const gstAmount = amountBeforeGST.times(gstRate);

    return {
      amountBeforeGST: amountBeforeGST.toNumber(),
      gstAmount: gstAmount.toNumber(),
      amountAfterGST: totalAmount.toNumber(),
      gstRate: this.gstRate,
    };
  }

  /**
   * Add GST to an amount
   * Used when user enters the base amount (exclusive of GST)
   */
  addGST(amountExclusiveOfGST: number): GSTCalculation {
    const baseAmount = new Decimal(amountExclusiveOfGST);
    const gstRate = new Decimal(this.gstRate);

    const gstAmount = baseAmount.times(gstRate);
    const amountAfterGST = baseAmount.plus(gstAmount);

    return {
      amountBeforeGST: baseAmount.toNumber(),
      gstAmount: gstAmount.toNumber(),
      amountAfterGST: amountAfterGST.toNumber(),
      gstRate: this.gstRate,
    };
  }

  /**
   * Check if a purchase amount qualifies for GST
   * In Singapore, GST applies to most goods and services
   */
  isGSTApplicable(category: string): boolean {
    const gstExemptCategories = [
      'medical',
      'education',
      'residential_property_sale',
      'financial_services',
      'insurance',
    ];

    return !gstExemptCategories.includes(category.toLowerCase());
  }

  /**
   * Format GST amount for display
   */
  formatGSTAmount(amount: number): string {
    return new Decimal(amount).toFixed(2);
  }

  /**
   * Calculate quarterly GST report data
   * Useful for PHV drivers who need to file GST returns
   */
  calculateQuarterlyGST(expenses: Array<{ amount: number; gstAmount: number | null; date: Date }>): {
    totalExpenses: number;
    totalGSTClaimed: number;
    gstClaimableExpenses: number;
    quarter: string;
    startDate: Date;
    endDate: Date;
  } {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalGSTClaimed = expenses.reduce((sum, expense) => sum + (expense.gstAmount || 0), 0);
    const gstClaimableExpenses = expenses.filter(e => e.gstAmount !== null).length;

    // Get quarter info from first expense date
    const firstDate = expenses[0]?.date || new Date();
    const quarter = this.getQuarter(firstDate);
    const { startDate, endDate } = this.getQuarterDates(firstDate);

    return {
      totalExpenses,
      totalGSTClaimed,
      gstClaimableExpenses,
      quarter,
      startDate,
      endDate,
    };
  }

  /**
   * Extract GST information from receipt text using common patterns
   */
  extractGSTFromReceiptText(receiptText: string): {
    gstAmount: number | null;
    totalAmount: number | null;
    gstNumber: string | null;
  } {
    const text = receiptText.toUpperCase();
    
    // Common GST patterns in Singapore receipts
    const gstPatterns = [
      /GST[:\s]+\$?(\d+\.?\d*)/,
      /G\.S\.T[:\s]+\$?(\d+\.?\d*)/,
      /TAX[:\s]+\$?(\d+\.?\d*)/,
      /(\d+\.?\d*)\s*GST/,
    ];

    const totalPatterns = [
      /TOTAL[:\s]+\$?(\d+\.?\d*)/,
      /AMOUNT[:\s]+\$?(\d+\.?\d*)/,
      /GRAND\s+TOTAL[:\s]+\$?(\d+\.?\d*)/,
    ];

    const gstNumberPatterns = [
      /GST\s*REG\s*NO[:\s]*(\d{8,12})/,
      /GST\s*NO[:\s]*(\d{8,12})/,
      /REG\s*NO[:\s]*(\d{8,12})/,
    ];

    let gstAmount: number | null = null;
    let totalAmount: number | null = null;
    let gstNumber: string | null = null;

    // Extract GST amount
    for (const pattern of gstPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        gstAmount = parseFloat(match[1]);
        break;
      }
    }

    // Extract total amount
    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        totalAmount = parseFloat(match[1]);
        break;
      }
    }

    // Extract GST registration number
    for (const pattern of gstNumberPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        gstNumber = match[1];
        break;
      }
    }

    return { gstAmount, totalAmount, gstNumber };
  }

  private getQuarter(date: Date): string {
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const year = date.getFullYear();
    
    if (month <= 3) return `Q1 ${year}`;
    if (month <= 6) return `Q2 ${year}`;
    if (month <= 9) return `Q3 ${year}`;
    return `Q4 ${year}`;
  }

  private getQuarterDates(date: Date): { startDate: Date; endDate: Date } {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    let startMonth: number;
    let endMonth: number;
    
    if (month <= 3) {
      startMonth = 1;
      endMonth = 3;
    } else if (month <= 6) {
      startMonth = 4;
      endMonth = 6;
    } else if (month <= 9) {
      startMonth = 7;
      endMonth = 9;
    } else {
      startMonth = 10;
      endMonth = 12;
    }
    
    const startDate = new Date(year, startMonth - 1, 1);
    const endDate = new Date(year, endMonth, 0); // Last day of the month
    
    return { startDate, endDate };
  }

  /**
   * Get current GST rate
   */
  getCurrentGSTRate(): number {
    return this.gstRate;
  }

  /**
   * Validate GST calculation
   */
  validateGSTCalculation(
    baseAmount: number,
    gstAmount: number,
    tolerance = 0.01
  ): boolean {
    const expectedGST = new Decimal(baseAmount).times(this.gstRate);
    const actualGST = new Decimal(gstAmount);
    const difference = expectedGST.minus(actualGST).abs();
    
    return difference.lte(tolerance);
  }
}

export const gstService = new GSTService();
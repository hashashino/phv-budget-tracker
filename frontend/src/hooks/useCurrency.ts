import { useMemo } from 'react';

/**
 * Currency formatting hook for Singapore and other supported regions
 */
export default function useCurrency(locale: string = 'en-SG') {
  const formatters = useMemo(() => {
    const regions = {
      'en-SG': { currency: 'SGD', symbol: 'S$' },
      'en-MY': { currency: 'MYR', symbol: 'RM' }, 
      'th-TH': { currency: 'THB', symbol: '฿' },
      'id-ID': { currency: 'IDR', symbol: 'Rp' },
      'en-US': { currency: 'USD', symbol: '$' },
      'en-AU': { currency: 'AUD', symbol: 'A$' },
    };

    const region = regions[locale as keyof typeof regions] || regions['en-SG'];

    return {
      // Standard currency formatter
      currency: new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: region.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      
      // Compact formatter for large amounts
      compact: new Intl.NumberFormat(locale, {
        style: 'currency', 
        currency: region.currency,
        notation: 'compact',
        compactDisplay: 'short',
      }),
      
      // Number formatter without currency symbol
      number: new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      
      symbol: region.symbol,
      currencyCode: region.currency,
    };
  }, [locale]);

  const formatCurrency = (amount: number): string => {
    return formatters.currency.format(amount);
  };

  const formatCompact = (amount: number): string => {
    return formatters.compact.format(amount);
  };

  const formatNumber = (amount: number): string => {
    return formatters.number.format(amount);
  };

  // Format with custom symbol placement
  const formatCustom = (amount: number, showSymbol = true, position: 'before' | 'after' = 'before'): string => {
    const formatted = formatters.number.format(Math.abs(amount));
    const symbol = formatters.symbol;
    
    if (!showSymbol) return formatted;
    
    if (position === 'before') {
      return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
    } else {
      return amount < 0 ? `-${formatted}${symbol}` : `${formatted}${symbol}`;
    }
  };

  // Color coding for amounts
  const getAmountColor = (amount: number, type: 'earning' | 'expense' | 'auto' = 'auto') => {
    if (type === 'earning') return '#10b981'; // Success green
    if (type === 'expense') return '#ef4444'; // Danger red
    
    // Auto detect
    return amount >= 0 ? '#10b981' : '#ef4444';
  };

  // Format percentage for charts
  const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  };

  return {
    formatCurrency,
    formatCompact, 
    formatNumber,
    formatCustom,
    formatPercentage,
    getAmountColor,
    symbol: formatters.symbol,
    currencyCode: formatters.currencyCode,
  };
}
// src/utils/helpers/currencyUtils.ts

/**
 * Currency utilities for the expense tracker app
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
}

// Common currencies
export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimals: 0 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2 },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', decimals: 2 },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso', decimals: 2 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimals: 2 },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', decimals: 2 },
  SAR: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', decimals: 2 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimals: 2 },
};

/**
 * Get currency info by code
 */
export const getCurrencyInfo = (code: string): CurrencyInfo => {
  return CURRENCIES[code] || { code, symbol: code, name: code, decimals: 2 };
};

/**
 * Format amount with currency symbol
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string = 'BDT',
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    decimals?: number;
    symbolPosition?: 'before' | 'after';
  } = {}
): string => {
  const {
    showSymbol = true,
    showCode = false,
    decimals,
    symbolPosition = 'before',
  } = options;

  const currency = getCurrencyInfo(currencyCode);
  const decimalPlaces = decimals !== undefined ? decimals : currency.decimals;

  // Format the number
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  // Build the formatted string
  let formatted = formattedAmount;

  if (showSymbol && currency.symbol) {
    if (symbolPosition === 'before') {
      formatted = `${currency.symbol}${formatted}`;
    } else {
      formatted = `${formatted} ${currency.symbol}`;
    }
  }

  if (showCode) {
    formatted = showSymbol ? `${formatted} ${currency.code}` : `${formatted} ${currency.code}`;
  }

  return formatted;
};

/**
 * Format amount as compact currency (e.g., $1.2K, $1.5M)
 */
export const formatCompactCurrency = (
  amount: number,
  currencyCode: string = 'BDT',
  showSymbol: boolean = true
): string => {
  const currency = getCurrencyInfo(currencyCode);
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  let value: number;
  let suffix: string;

  if (absAmount >= 1000000000) {
    value = absAmount / 1000000000;
    suffix = 'B';
  } else if (absAmount >= 1000000) {
    value = absAmount / 1000000;
    suffix = 'M';
  } else if (absAmount >= 1000) {
    value = absAmount / 1000;
    suffix = 'K';
  } else {
    return formatCurrency(amount, currencyCode, { showSymbol });
  }

  const formattedValue = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
  const symbol = showSymbol ? currency.symbol : '';

  return `${sign}${symbol}${formattedValue}${suffix}`;
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (value: string, currencyCode: string = 'BDT'): number => {
  if (!value || typeof value !== 'string') return 0;

  const currency = getCurrencyInfo(currencyCode);

  // Remove currency symbol and spaces
  let cleanValue = value
    .replace(currency.symbol, '')
    .replace(/\s/g, '')
    .replace(/,/g, '');

  // Handle negative values
  const isNegative = cleanValue.includes('-') || cleanValue.includes('(');
  cleanValue = cleanValue.replace(/[-()]/g, '');

  const parsed = parseFloat(cleanValue) || 0;
  return isNegative ? -parsed : parsed;
};

/**
 * Format amount for input (without symbols, proper decimals)
 */
export const formatAmountInput = (
  amount: number,
  currencyCode: string = 'BDT'
): string => {
  const currency = getCurrencyInfo(currencyCode);
  return amount.toFixed(currency.decimals);
};

/**
 * Get all supported currencies as array
 */
export const getSupportedCurrencies = (): CurrencyInfo[] => {
  return Object.values(CURRENCIES).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Check if currency is supported
 */
export const isCurrencySupported = (code: string): boolean => {
  return code in CURRENCIES;
};

/**
 * Get currency symbol by code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  return getCurrencyInfo(currencyCode).symbol;
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1,
  showSign: boolean = false
): string => {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (
  oldValue: number,
  newValue: number
): number => {
  if (oldValue === 0) {
    return newValue === 0 ? 0 : 100;
  }
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
};

/**
 * Format amount with positive/negative colors
 */
export const getAmountColor = (amount: number): string => {
  if (amount > 0) return '#10B981'; // green for positive
  if (amount < 0) return '#EF4444'; // red for negative
  return '#6B7280'; // gray for zero
};

/**
 * Round to currency decimals
 */
export const roundToCurrency = (amount: number, currencyCode: string = 'BDT'): number => {
  const currency = getCurrencyInfo(currencyCode);
  const multiplier = Math.pow(10, currency.decimals);
  return Math.round(amount * multiplier) / multiplier;
};

/**
 * Format large numbers with appropriate scaling
 */
export const formatLargeNumber = (num: number): string => {
  if (Math.abs(num) >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toString();
};

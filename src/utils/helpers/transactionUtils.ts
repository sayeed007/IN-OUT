// src/utils/helpers/transactionUtils.ts
import type { TransactionType } from '../../types/global';

/**
 * Get the appropriate color for a transaction type
 */
export const getTransactionTypeColor = (type: TransactionType): string => {
  switch (type) {
    case 'income':
      return '#10B981'; // Green for income
    case 'expense':
      return '#EF4444'; // Red for expenses
    case 'transfer':
      return '#3B82F6'; // Blue for transfers
    default:
      return '#6B7280'; // Gray for unknown types
  }
};

/**
 * Get the appropriate icon for a transaction type
 */
export const getTransactionTypeIcon = (type: TransactionType): string => {
  switch (type) {
    case 'income':
      return 'trending-up-outline';
    case 'expense':
      return 'trending-down-outline';
    case 'transfer':
      return 'swap-horizontal-outline';
    default:
      return 'help-outline';
  }
};

/**
 * Get the display label for a transaction type
 */
export const getTransactionTypeLabel = (type: TransactionType): string => {
  switch (type) {
    case 'income':
      return 'Income';
    case 'expense':
      return 'Expense';
    case 'transfer':
      return 'Transfer';
    default:
      return 'Unknown';
  }
};

/**
 * Get the appropriate prefix for displaying transaction amounts
 */
export const getTransactionAmountPrefix = (type: TransactionType): string => {
  switch (type) {
    case 'income':
      return '+';
    case 'expense':
      return '-';
    case 'transfer':
      return ''; // No prefix for transfers
    default:
      return '';
  }
};

/**
 * Check if a transaction type represents money coming in
 */
export const isIncomeTransaction = (type: TransactionType): boolean => {
  return type === 'income';
};

/**
 * Check if a transaction type represents money going out
 */
export const isExpenseTransaction = (type: TransactionType): boolean => {
  return type === 'expense';
};

/**
 * Check if a transaction type represents a transfer
 */
export const isTransferTransaction = (type: TransactionType): boolean => {
  return type === 'transfer';
};
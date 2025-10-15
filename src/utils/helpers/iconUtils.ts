import type { Account, TransactionType } from '../../types/global';

/**
 * Get Ionicons icon name for account type
 * Use this when rendering Icon components from react-native-vector-icons/Ionicons
 * Centralized utility to maintain consistency across the app
 */
export const getAccountTypeIcon = (type: Account['type']): string => {
  switch (type) {
    case 'bank':
      return 'card-outline';
    case 'cash':
      return 'wallet-outline';
    case 'card':
      return 'card-outline';
    case 'wallet':
      return 'phone-portrait-outline';
    default:
      return 'ellipse-outline';
  }
};

/**
 * Get emoji icon for account type
 * Use this for text labels or where emoji representation is needed
 * Used in places where emoji representation is preferred
 */
export const getAccountTypeEmoji = (type: Account['type']): string => {
  switch (type) {
    case 'bank':
      return '🏦';
    case 'cash':
      return '💵';
    case 'card':
      return '💳';
    case 'wallet':
      return '👛';
    default:
      return '📱';
  }
};

/**
 * Get emoji icon for transaction/category type
 * Use this for quick category type identification in text labels
 */
export const getCategoryTypeEmoji = (type: TransactionType): string => {
  switch (type) {
    case 'income':
      return '💰';
    case 'expense':
      return '💸';
    case 'transfer':
      return '🔄';
    default:
      return '📝';
  }
};

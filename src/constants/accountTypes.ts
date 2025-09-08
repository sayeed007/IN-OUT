// src/constants/accountTypes.ts
import type { Account } from '../types/global';

export const ACCOUNT_TYPES = [
  { 
    value: 'bank' as const, 
    label: 'Bank Account', 
    icon: 'card-outline',
    description: 'Savings, checking accounts'
  },
  { 
    value: 'cash' as const, 
    label: 'Cash', 
    icon: 'wallet-outline',
    description: 'Physical cash on hand'
  },
  { 
    value: 'card' as const, 
    label: 'Credit/Debit Card', 
    icon: 'card-outline',
    description: 'Credit or debit cards'
  },
  { 
    value: 'wallet' as const, 
    label: 'Digital Wallet', 
    icon: 'phone-portrait-outline',
    description: 'Digital payment apps'
  },
  { 
    value: 'other' as const, 
    label: 'Other', 
    icon: 'ellipse-outline',
    description: 'Other account types'
  },
] as const;

export type AccountTypeInfo = typeof ACCOUNT_TYPES[number];
export type AccountType = Account['type'];
// src/types/global.ts
export type UUID = string;

// Base entity interface
export interface BaseEntity {
  id: UUID;
  createdAt: string;
  updatedAt: string;
}

// Account types
export interface Account extends BaseEntity {
  name: string;
  type: 'cash' | 'bank' | 'wallet' | 'card' | 'other';
  openingBalance: number;
  currencyCode: string;
  isArchived: boolean;
}

// Category types  
export interface Category extends BaseEntity {
  name: string;
  type: TransactionType;
  parentId: UUID | null;
  color: string;
  icon: string;
  isArchived: boolean;
}

// Transaction types
export interface Transaction extends BaseEntity {
  type: TransactionType;
  accountId: UUID;
  accountIdTo: UUID | null; // For transfers
  categoryId: UUID | null; // Null for transfers
  amount: number;
  currencyCode: string;
  date: string;
  note?: string;
  tags: string[];
  attachmentIds: UUID[];
}

// Budget types
export interface Budget extends BaseEntity {
  categoryId: UUID;
  periodId: string; // YYYY-MM-DD format (period start date)
  periodStartDay: number; // Day of month the period starts (1-28), stored for historical accuracy
  amount: number;
  rollover: boolean;
  // Legacy field for backward compatibility during migration
  month?: string; // YYYY-MM format (deprecated, use periodId)
}

// Attachment types
export interface Attachment extends BaseEntity {
  transactionId: UUID;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

// UI State types
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface FilterState {
  type?: TransactionType;
  accountIds: UUID[];
  categoryIds: UUID[];
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  searchQuery: string;
}

export interface AppPreferences {
  currencyCode: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  firstDayOfWeek: 0 | 1; // 0 = Saturday , 1 = Sunday
  budgetStartDay: number; // 1-28
  theme: 'light' | 'dark' | 'system';
  enableAppLock: boolean;
  lockTimeout: number; // minutes
  enableNotifications: boolean;
  includeTransfersInTotals: boolean;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface MonthlyReportData {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  categoryBreakdown: ChartDataPoint[];
  dailyTrend: ChartDataPoint[];
}
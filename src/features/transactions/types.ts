import { Transaction, Account, Category } from '../../types/global';

// Extended transaction with related data
export interface TransactionWithDetails extends Transaction {
    account?: Account;
    accountTo?: Account;
    category?: Category;
}

// Transaction form data
export interface TransactionFormData {
    type: Transaction['type'];
    amount: string;
    accountId: string;
    accountIdTo?: string;
    categoryId?: string;
    date: string;
    note: string;
    tags: string[];
}

// Transaction filters
export interface TransactionFilters {
    type?: Transaction['type'];
    accountIds: string[];
    categoryIds: string[];
    tags: string[];
    dateRange: {
        start?: string;
        end?: string;
    };
    searchQuery: string;
}

// Transaction summary data
export interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    transactionCount: number;
    averageAmount: number;
}

// Daily transaction group
export interface DailyTransactionGroup {
    date: string;
    transactions: TransactionWithDetails[];
    totals: {
        income: number;
        expense: number;
        net: number;
    };
}

// Category spending breakdown
export interface CategorySpending {
    category: Category;
    amount: number;
    percentage: number;
    transactionCount: number;
}

// Account balance summary
export interface AccountBalanceSummary {
    account: Account;
    currentBalance: number;
    openingBalance: number;
    totalIncome: number;
    totalExpense: number;
    totalTransfers: number;
}

// Transaction statistics
export interface TransactionStats {
    totalTransactions: number;
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    averageIncome: number;
    averageExpense: number;
    mostUsedCategory?: Category;
    mostUsedAccount?: Account;
    recentActivity: {
        lastTransactionDate?: string;
        daysSinceLastTransaction: number;
    };
}

// Quick add transaction template
export interface QuickAddTemplate {
    id: string;
    name: string;
    type: Transaction['type'];
    amount?: number;
    categoryId?: string;
    accountId?: string;
    tags: string[];
    note?: string;
}

// Transaction import/export data
export interface TransactionExportData {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
    exportDate: string;
    version: string;
}

// Transaction validation result
export interface TransactionValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
    warnings: string[];
}

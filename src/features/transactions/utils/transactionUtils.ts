import { Transaction, Account, Category } from '../../../types/global';

// Format currency amount
export const formatCurrency = (
    amount: number,
    currencyCode: string = 'BDT',
    locale: string = 'en-US'
): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
    }).format(amount);
};

// Format amount without currency symbol
export const formatAmount = (
    amount: number,
    locale: string = 'en-US'
): string => {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Calculate account balance
export const calculateAccountBalance = (
    account: Account,
    transactions: Transaction[]
): number => {
    let balance = account.openingBalance;

    transactions.forEach(transaction => {
        if (transaction.accountId === account.id) {
            // Outgoing transaction
            if (transaction.type === 'expense') {
                balance -= transaction.amount;
            } else if (transaction.type === 'income') {
                balance += transaction.amount;
            } else if (transaction.type === 'transfer') {
                balance -= transaction.amount;
            }
        }

        if (transaction.type === 'transfer' && transaction.accountIdTo === account.id) {
            // Incoming transfer
            balance += transaction.amount;
        }
    });

    return balance;
};

// Group transactions by date
export const groupTransactionsByDate = (transactions: Transaction[]): Record<string, Transaction[]> => {
    return transactions.reduce((groups, transaction) => {
        const date = transaction.date.split('T')[0]; // Get YYYY-MM-DD part
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {} as Record<string, Transaction[]>);
};

// Calculate daily totals
export const calculateDailyTotals = (transactions: Transaction[]): Record<string, {
    income: number;
    expense: number;
    net: number;
}> => {
    const grouped = groupTransactionsByDate(transactions);

    return Object.keys(grouped).reduce((totals, date) => {
        const dayTransactions = grouped[date];
        let income = 0;
        let expense = 0;

        dayTransactions.forEach(transaction => {
            if (transaction.type === 'income') {
                income += transaction.amount;
            } else if (transaction.type === 'expense') {
                expense += transaction.amount;
            }
            // Transfers don't affect income/expense totals
        });

        totals[date] = {
            income,
            expense,
            net: income - expense,
        };

        return totals;
    }, {} as Record<string, { income: number; expense: number; net: number; }>);
};

// Calculate monthly totals
export const calculateMonthlyTotals = (
    transactions: Transaction[],
    year: number,
    month: number
): { income: number; expense: number; net: number } => {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const monthlyTransactions = transactions.filter(transaction => {
        const transactionDate = transaction.date.split('T')[0];
        return transactionDate >= startDate && transactionDate <= endDate;
    });

    let income = 0;
    let expense = 0;

    monthlyTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
            income += transaction.amount;
        } else if (transaction.type === 'expense') {
            expense += transaction.amount;
        }
        // Transfers don't affect income/expense totals
    });

    return {
        income,
        expense,
        net: income - expense,
    };
};

// Get category breakdown for a period
export const getCategoryBreakdown = (
    transactions: Transaction[],
    categories: Category[],
    startDate?: string,
    endDate?: string
): Array<{ category: Category; amount: number; percentage: number }> => {
    let filteredTransactions = transactions;

    // Filter by date range if provided
    if (startDate && endDate) {
        filteredTransactions = transactions.filter(transaction => {
            const transactionDate = transaction.date.split('T')[0];
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }

    // Group by category
    const categoryTotals = filteredTransactions.reduce((totals, transaction) => {
        if (transaction.categoryId && transaction.type !== 'transfer') {
            if (!totals[transaction.categoryId]) {
                totals[transaction.categoryId] = 0;
            }
            totals[transaction.categoryId] += transaction.amount;
        }
        return totals;
    }, {} as Record<string, number>);

    // Calculate total for percentage
    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    // Map to category objects with percentages
    return Object.entries(categoryTotals)
        .map(([categoryId, amount]) => {
            const category = categories.find(cat => cat.id === categoryId);
            if (!category) return null;

            return {
                category,
                amount,
                percentage: total > 0 ? (amount / total) * 100 : 0,
            };
        })
        .filter(Boolean)
        .sort((a, b) => b!.amount - a!.amount);
};

// Format date for display
export const formatDate = (
    dateString: string,
    format: 'short' | 'long' | 'relative' = 'short'
): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (format === 'relative') {
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
    }

    if (format === 'long') {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    // Short format
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
};

// Get transaction type color
export const getTransactionTypeColor = (type: Transaction['type']): string => {
    switch (type) {
        case 'income':
            return '#10B981'; // Green
        case 'expense':
            return '#EF4444'; // Red
        case 'transfer':
            return '#6366F1'; // Blue
        default:
            return '#6B7280'; // Gray
    }
};

// Get transaction type icon
export const getTransactionTypeIcon = (type: Transaction['type']): string => {
    switch (type) {
        case 'income':
            return 'arrow-down';
        case 'expense':
            return 'arrow-up';
        case 'transfer':
            return 'swap-horizontal';
        default:
            return 'help-circle';
    }
};

// Search transactions
export const searchTransactions = (
    transactions: Transaction[],
    query: string,
    categories: Category[],
    accounts: Account[]
): Transaction[] => {
    if (!query.trim()) return transactions;

    const searchTerm = query.toLowerCase();

    return transactions.filter(transaction => {
        // Search in note
        if (transaction.note?.toLowerCase().includes(searchTerm)) {
            return true;
        }

        // Search in tags
        if (transaction.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
            return true;
        }

        // Search in category name
        if (transaction.categoryId) {
            const category = categories.find(cat => cat.id === transaction.categoryId);
            if (category?.name.toLowerCase().includes(searchTerm)) {
                return true;
            }
        }

        // Search in account names
        const account = accounts.find(acc => acc.id === transaction.accountId);
        if (account?.name.toLowerCase().includes(searchTerm)) {
            return true;
        }

        if (transaction.accountIdTo) {
            const accountTo = accounts.find(acc => acc.id === transaction.accountIdTo);
            if (accountTo?.name.toLowerCase().includes(searchTerm)) {
                return true;
            }
        }

        return false;
    });
};

// Filter transactions
export const filterTransactions = (
    transactions: Transaction[],
    filters: {
        type?: Transaction['type'];
        accountIds?: string[];
        categoryIds?: string[];
        tags?: string[];
        startDate?: string;
        endDate?: string;
    }
): Transaction[] => {
    return transactions.filter(transaction => {
        // Type filter
        if (filters.type && transaction.type !== filters.type) {
            return false;
        }

        // Account filter
        if (filters.accountIds && filters.accountIds.length > 0) {
            const isInAccount = filters.accountIds.includes(transaction.accountId) ||
                (transaction.accountIdTo && filters.accountIds.includes(transaction.accountIdTo));
            if (!isInAccount) {
                return false;
            }
        }

        // Category filter
        if (filters.categoryIds && filters.categoryIds.length > 0) {
            if (!transaction.categoryId || !filters.categoryIds.includes(transaction.categoryId)) {
                return false;
            }
        }

        // Tags filter
        if (filters.tags && filters.tags.length > 0) {
            const hasMatchingTag = filters.tags.some(tag => transaction.tags.includes(tag));
            if (!hasMatchingTag) {
                return false;
            }
        }

        // Date range filter
        if (filters.startDate && transaction.date < filters.startDate) {
            return false;
        }
        if (filters.endDate && transaction.date > filters.endDate) {
            return false;
        }

        return true;
    });
};

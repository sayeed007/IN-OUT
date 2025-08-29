// src/state/selectors/transactionSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { api } from '../api';

// Get transactions for current month
export const selectCurrentMonthTransactions = createSelector(
    [
        (state: RootState) => state.app.currentMonth,
        api.endpoints.getTransactions.select({}),
    ],
    (currentMonth, transactionsResult) => {
        const transactions = transactionsResult.data || [];
        const [year, month] = currentMonth.split('-');

        return transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getFullYear().toString() === year &&
                (txDate.getMonth() + 1).toString().padStart(2, '0') === month;
        });
    }
);

// Calculate monthly totals
export const selectMonthlyTotals = createSelector(
    [selectCurrentMonthTransactions],
    (transactions) => {
        return transactions.reduce(
            (totals, tx) => {
                if (tx.type === 'income') {
                    totals.income += tx.amount;
                } else if (tx.type === 'expense') {
                    totals.expense += tx.amount;
                }
                // Transfers don't affect income/expense totals
                return totals;
            },
            { income: 0, expense: 0, net: 0 }
        );
    }
);

// Get filtered transactions based on current filter state
export const selectFilteredTransactions = createSelector(
    [
        (state: RootState) => state.filters,
        api.endpoints.getTransactions.select({}),
    ],
    (filters, transactionsResult) => {
        let transactions = transactionsResult.data || [];

        // Apply type filter
        if (filters.type) {
            transactions = transactions.filter(tx => tx.type === filters.type);
        }

        // Apply account filter
        if (filters.accountIds.length > 0) {
            transactions = transactions.filter(tx =>
                filters.accountIds.includes(tx.accountId) ||
                (tx.accountIdTo && filters.accountIds.includes(tx.accountIdTo))
            );
        }

        // Apply category filter
        if (filters.categoryIds.length > 0) {
            transactions = transactions.filter(tx =>
                tx.categoryId && filters.categoryIds.includes(tx.categoryId)
            );
        }

        // Apply date range filter
        if (filters.dateRange.start || filters.dateRange.end) {
            transactions = transactions.filter(tx => {
                const txDate = new Date(tx.date);
                const start = filters.dateRange.start ? new Date(filters.dateRange.start) : new Date('1900-01-01');
                const end = filters.dateRange.end ? new Date(filters.dateRange.end) : new Date('2100-12-31');
                return txDate >= start && txDate <= end;
            });
        }

        // Apply tag filter
        if (filters.tags.length > 0) {
            transactions = transactions.filter(tx =>
                filters.tags.some(tag => tx.tags.includes(tag))
            );
        }

        // Apply search query
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            transactions = transactions.filter(tx =>
                (tx.note && tx.note.toLowerCase().includes(query)) ||
                tx.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        return transactions;
    }
);
// src/state/selectors/transactionSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { api } from '../api';
import { isDateInPeriod } from '../../utils/helpers/dateUtils';

// Get transactions for current period
export const selectCurrentPeriodTransactions = createSelector(
    [
        (state: RootState) => state.app.currentPeriod,
        (state: RootState) => state.preferences.budgetStartDay,
        api.endpoints.getTransactions.select({}),
    ],
    (currentPeriod, periodStartDay, transactionsResult) => {
        const transactions = transactionsResult.data || [];

        return transactions.filter(tx => {
            return isDateInPeriod(tx.date, currentPeriod, periodStartDay);
        });
    }
);

// Legacy selector for backward compatibility
// This is kept for components that haven't been updated yet
export const selectCurrentMonthTransactions = selectCurrentPeriodTransactions;

// Calculate period totals
export const selectPeriodTotals = createSelector(
    [selectCurrentPeriodTransactions],
    (transactions) => {
        const totals = transactions.reduce(
            (acc, tx) => {
                if (tx.type === 'income') {
                    acc.income += tx.amount;
                } else if (tx.type === 'expense') {
                    acc.expense += tx.amount;
                }
                // Transfers don't affect income/expense totals
                return acc;
            },
            { income: 0, expense: 0, net: 0 }
        );

        // Calculate net amount
        totals.net = totals.income - totals.expense;

        return totals;
    }
);

// Legacy selector for backward compatibility
export const selectMonthlyTotals = selectPeriodTotals;

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
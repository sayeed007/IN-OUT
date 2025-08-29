// src/state/selectors/accountSelectors.ts  
import { createSelector } from '@reduxjs/toolkit';
import { api } from '../api';

// Get all accounts (non-archived)
export const selectActiveAccounts = createSelector(
    [api.endpoints.getAccounts.select()],
    (accountsResult) => {
        return accountsResult.data?.filter(account => !account.isArchived) || [];
    }
);

// Calculate account balance based on transactions
export const selectAccountBalance = (accountId: string) =>
    createSelector(
        [
            api.endpoints.getAccounts.select(),
            api.endpoints.getTransactions.select({}),
        ],
        (accountsResult, transactionsResult) => {
            const account = accountsResult.data?.find(acc => acc.id === accountId);
            if (!account) return 0;

            const transactions = transactionsResult.data || [];

            const balanceChange = transactions.reduce((balance, tx) => {
                // Transaction affects this account as source
                if (tx.accountId === accountId) {
                    if (tx.type === 'income') return balance + tx.amount;
                    if (tx.type === 'expense') return balance - tx.amount;
                    if (tx.type === 'transfer') return balance - tx.amount; // Outgoing transfer
                }

                // Transaction affects this account as destination (transfer)
                if (tx.type === 'transfer' && tx.accountIdTo === accountId) {
                    return balance + tx.amount; // Incoming transfer
                }

                return balance;
            }, 0);

            return account.openingBalance + balanceChange;
        }
    );

// Get total balance across all accounts
export const selectTotalBalance = createSelector(
    [selectActiveAccounts, api.endpoints.getTransactions.select({})],
    (accounts, transactionsResult) => {
        const transactions = transactionsResult.data || [];

        return accounts.reduce((total, account) => {
            const balanceChange = transactions.reduce((balance, tx) => {
                if (tx.accountId === account.id) {
                    if (tx.type === 'income') return balance + tx.amount;
                    if (tx.type === 'expense') return balance - tx.amount;
                    if (tx.type === 'transfer') return balance - tx.amount;
                }
                if (tx.type === 'transfer' && tx.accountIdTo === account.id) {
                    return balance + tx.amount;
                }
                return balance;
            }, 0);

            return total + account.openingBalance + balanceChange;
        }, 0);
    }
);
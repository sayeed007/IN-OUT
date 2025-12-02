// src/state/api.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { localBaseQuery } from '../services/storage/localBaseQuery';
import type { Account, Budget, Category, Transaction } from '../types/global';

// Always use localBaseQuery for now (mock/local development)
const baseQuery = localBaseQuery;

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Account', 'Category', 'Transaction', 'Budget', 'Attachment'],
  endpoints: (builder) => ({
    // Account endpoints
    getAccounts: builder.query<Account[], void>({
      query: () => '/accounts?_sort=openingBalance&_order=desc',
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Account' as const, id })),
            { type: 'Account', id: 'LIST' },
          ]
          : [{ type: 'Account', id: 'LIST' }],
    }),

    getAccount: builder.query<Account, string>({
      query: (id) => `/accounts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Account', id }],
    }),

    addAccount: builder.mutation<Account, Partial<Account>>({
      query: (body) => ({
        url: '/accounts',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),

    updateAccount: builder.mutation<Account, Partial<Account> & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/accounts/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Account', id },
        { type: 'Account', id: 'LIST' },
      ],
    }),

    deleteAccount: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),

    // Category endpoints
    getCategories: builder.query<Category[], void>({
      query: () => '/categories?_sort=name&_order=asc',
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Category' as const, id })),
            { type: 'Category', id: 'LIST' },
          ]
          : [{ type: 'Category', id: 'LIST' }],
    }),

    getCategory: builder.query<Category, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    addCategory: builder.mutation<Category, Partial<Category>>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    updateCategory: builder.mutation<Category, Partial<Category> & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    deleteCategory: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    // Transaction endpoints
    getTransactions: builder.query<
      Transaction[],
      {
        type?: string;
        start?: string;
        end?: string;
        accountId?: string;
        categoryId?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.type) searchParams.append('type', params.type);
        if (params.start) searchParams.append('date_gte', params.start);
        if (params.end) searchParams.append('date_lte', params.end);
        if (params.accountId) searchParams.append('accountId', params.accountId);
        if (params.categoryId) searchParams.append('categoryId', params.categoryId);
        if (params.page) searchParams.append('_page', params.page.toString());
        if (params.limit) searchParams.append('_limit', params.limit.toString());

        searchParams.append('_sort', 'date');
        searchParams.append('_order', 'desc');

        return `/transactions?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Transaction' as const, id })),
            { type: 'Transaction', id: 'LIST' },
          ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),

    getTransaction: builder.query<Transaction, string>({
      query: (id) => `/transactions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transaction', id }],
    }),

    addTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      query: (body) => ({
        url: '/transactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'Account', id: 'LIST' }, // Account balances change
      ],
    }),

    updateTransaction: builder.mutation<Transaction, Partial<Transaction> & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/transactions/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' },
        { type: 'Account', id: 'LIST' },
      ],
    }),

    deleteTransaction: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'Account', id: 'LIST' },
      ],
    }),

    // Budget endpoints
    getBudgets: builder.query<Budget[], { periodId?: string }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.periodId) searchParams.append('periodId', params.periodId);
        return `/budgets?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Budget' as const, id })),
            { type: 'Budget', id: 'LIST' },
          ]
          : [{ type: 'Budget', id: 'LIST' }],
    }),

    getBudget: builder.query<Budget, string>({
      query: (id) => `/budgets/${id}`,
      providesTags: (result, error, id) => [{ type: 'Budget', id }],
    }),

    addBudget: builder.mutation<Budget, Partial<Budget>>({
      query: (body) => ({
        url: '/budgets',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Budget', id: 'LIST' }],
    }),

    updateBudget: builder.mutation<Budget, Partial<Budget> & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/budgets/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Budget', id },
        { type: 'Budget', id: 'LIST' },
      ],
    }),

    deleteBudget: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/budgets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Budget', id: 'LIST' }],
    }),
  }),
});

// Export hooks for components
export const {
  useGetAccountsQuery,
  useGetAccountQuery,
  useAddAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,

  useGetCategoriesQuery,
  useGetCategoryQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,

  useGetTransactionsQuery,
  useGetTransactionQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,

  useGetBudgetsQuery,
  useGetBudgetQuery,
  useAddBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
} = api;
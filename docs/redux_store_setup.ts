// src/state/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api';
import appSlice from './slices/appSlice';
import filtersSlice from './slices/filtersSlice';
import preferencesSlice from './slices/preferencesSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    app: appSlice,
    filters: filtersSlice,
    preferences: preferencesSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [api.util.resetApiState.type],
      },
    }).concat(api.middleware),
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// src/state/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// src/services/storage/localBaseQuery.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { STORAGE_KEYS } from '../../utils/env';

// Default database structure
const DEFAULT_DB = {
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  attachments: [],
  recurringRules: [],
  transactionTemplates: [],
  version: '1.0.0', // For future migrations
};

interface LocalDBData {
  accounts: any[];
  categories: any[];
  transactions: any[];
  budgets: any[];
  attachments: any[];
  recurringRules: any[];
  transactionTemplates: any[];
  version: string;
}

class LocalDatabase {
  private static instance: LocalDatabase;
  private cache: LocalDBData | null = null;

  static getInstance(): LocalDatabase {
    if (!LocalDatabase.instance) {
      LocalDatabase.instance = new LocalDatabase();
    }
    return LocalDatabase.instance;
  }

  async loadDB(): Promise<LocalDBData> {
    if (this.cache) return this.cache;

    try {
      const dbJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_DB);
      this.cache = dbJson ? JSON.parse(dbJson) : { ...DEFAULT_DB };
      return this.cache;
    } catch (error) {
      console.error('Failed to load database:', error);
      this.cache = { ...DEFAULT_DB };
      return this.cache;
    }
  }

  async saveDB(data: LocalDBData): Promise<void> {
    try {
      this.cache = data;
      await AsyncStorage.setItem(STORAGE_KEYS.APP_DB, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save database:', error);
      throw new Error('Database save failed');
    }
  }

  clearCache(): void {
    this.cache = null;
  }
}

const localDB = LocalDatabase.getInstance();

// Custom base query that simulates REST API behavior with local storage
export const localBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args) => {
  try {
    // Normalize args
    const { url, method = 'GET', body } = typeof args === 'string' ? { url: args } : args;
    
    // Parse URL and params
    const [pathname, search] = url.split('?');
    const resource = pathname.replace('/', '');
    const params = new URLSearchParams(search || '');

    // Load database
    const db = await localDB.loadDB();
    let result;

    switch (method.toUpperCase()) {
      case 'GET': {
        if (pathname.includes('/') && pathname.split('/').length === 3) {
          // GET /resource/:id
          const [, resourceName, id] = pathname.split('/');
          const item = db[resourceName as keyof LocalDBData]?.find((item: any) => item.id === id);
          if (!item) {
            return { error: { status: 404, data: 'Not found' } };
          }
          result = item;
        } else {
          // GET /resource with optional query params
          let data = [...(db[resource as keyof LocalDBData] || [])];

          // Apply filters
          if (params.get('type')) {
            data = data.filter((item: any) => item.type === params.get('type'));
          }
          
          if (params.get('date_gte')) {
            const startDate = new Date(params.get('date_gte')!);
            data = data.filter((item: any) => new Date(item.date) >= startDate);
          }
          
          if (params.get('date_lte')) {
            const endDate = new Date(params.get('date_lte')!);
            data = data.filter((item: any) => new Date(item.date) <= endDate);
          }

          if (params.get('month')) {
            data = data.filter((item: any) => item.month === params.get('month'));
          }

          if (params.get('categoryId')) {
            data = data.filter((item: any) => item.categoryId === params.get('categoryId'));
          }

          // Apply sorting
          const sortBy = params.get('_sort') || 'createdAt';
          const sortOrder = params.get('_order') || 'desc';
          
          data.sort((a: any, b: any) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            
            if (sortOrder === 'desc') {
              return aVal < bVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
          });

          // Apply pagination
          const page = parseInt(params.get('_page') || '1');
          const limit = parseInt(params.get('_limit') || '1000');
          const start = (page - 1) * limit;
          const end = start + limit;
          
          result = data.slice(start, end);
        }
        break;
      }

      case 'POST': {
        const id = uuidv4();
        const now = new Date().toISOString();
        const newItem = { 
          ...body, 
          id, 
          createdAt: now, 
          updatedAt: now 
        };

        const resourceArray = db[resource as keyof LocalDBData] as any[];
        resourceArray.push(newItem);
        await localDB.saveDB(db);
        result = newItem;
        break;
      }

      case 'PUT':
      case 'PATCH': {
        const id = pathname.split('/').pop() || (body as any)?.id;
        const resourceArray = db[resource as keyof LocalDBData] as any[];
        const index = resourceArray.findIndex((item: any) => item.id === id);
        
        if (index === -1) {
          return { error: { status: 404, data: 'Not found' } };
        }

        const updatedItem = {
          ...resourceArray[index],
          ...body,
          updatedAt: new Date().toISOString()
        };

        resourceArray[index] = updatedItem;
        await localDB.saveDB(db);
        result = updatedItem;
        break;
      }

      case 'DELETE': {
        const id = pathname.split('/').pop();
        const resourceArray = db[resource as keyof LocalDBData] as any[];
        const index = resourceArray.findIndex((item: any) => item.id === id);
        
        if (index === -1) {
          return { error: { status: 404, data: 'Not found' } };
        }

        resourceArray.splice(index, 1);
        await localDB.saveDB(db);
        result = { id };
        break;
      }

      default:
        return { error: { status: 405, data: 'Method not allowed' } };
    }

    return { data: result };
  } catch (error) {
    console.error('LocalBaseQuery error:', error);
    return { 
      error: { 
        status: 500, 
        data: error instanceof Error ? error.message : 'Unknown error' 
      } 
    };
  }
};

// src/state/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { localBaseQuery } from '../services/storage/localBaseQuery';
import { API_CONFIG, IS_DEV } from '../utils/env';
import type { Account, Category, Transaction, Budget } from '../types/global';

// Use fetchBaseQuery in development, localBaseQuery in production
const baseQuery = IS_DEV
  ? fetchBaseQuery({ 
      baseUrl: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
    })
  : localBaseQuery;

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Account', 'Category', 'Transaction', 'Budget', 'Attachment'],
  endpoints: (builder) => ({
    // Account endpoints
    getAccounts: builder.query<Account[], void>({
      query: () => '/accounts?_sort=createdAt&_order=desc',
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
    getBudgets: builder.query<Budget[], { month?: string }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.month) searchParams.append('month', params.month);
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
  useAddCategoryMutation,
  useUpdateCategoryMutation,

  useGetTransactionsQuery,
  useGetTransactionQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,

  useGetBudgetsQuery,
  useAddBudgetMutation,
  useUpdateBudgetMutation,
} = api;

// src/state/slices/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isInitialized: boolean;
  isLocked: boolean;
  currentMonth: string; // YYYY-MM
  currentYear: string; // YYYY
  lastActiveTimestamp: number;
}

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getCurrentYear = () => {
  return new Date().getFullYear().toString();
};

const initialState: AppState = {
  isInitialized: false,
  isLocked: false,
  currentMonth: getCurrentMonth(),
  currentYear: getCurrentYear(),
  lastActiveTimestamp: Date.now(),
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setLocked: (state, action: PayloadAction<boolean>) => {
      state.isLocked = action.payload;
    },
    setCurrentMonth: (state, action: PayloadAction<string>) => {
      state.currentMonth = action.payload;
    },
    setCurrentYear: (state, action: PayloadAction<string>) => {
      state.currentYear = action.payload;
    },
    updateLastActive: (state) => {
      state.lastActiveTimestamp = Date.now();
    },
    resetToCurrentPeriod: (state) => {
      state.currentMonth = getCurrentMonth();
      state.currentYear = getCurrentYear();
    },
  },
});

export const {
  setInitialized,
  setLocked,
  setCurrentMonth,
  setCurrentYear,
  updateLastActive,
  resetToCurrentPeriod,
} = appSlice.actions;

export default appSlice.reducer;

// src/state/slices/preferencesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppPreferences } from '../../types/global';
import { APP_CONFIG } from '../../utils/env';

const initialState: AppPreferences = {
  currencyCode: APP_CONFIG.DEFAULT_CURRENCY,
  dateFormat: 'MM/DD/YYYY',
  firstDayOfWeek: 1, // Monday
  budgetStartDay: 1,
  theme: 'system',
  enableAppLock: false,
  lockTimeout: APP_CONFIG.LOCK_TIMEOUT_DEFAULT,
  enableNotifications: true,
  includeTransfersInTotals: false,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    updatePreferences: (state, action: PayloadAction<Partial<AppPreferences>>) => {
      return { ...state, ...action.payload };
    },
    resetPreferences: () => initialState,
  },
});

export const { updatePreferences, resetPreferences } = preferencesSlice.actions;
export default preferencesSlice.reducer;

// src/state/slices/filtersSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FilterState, UUID } from '../../types/global';

const initialState: FilterState = {
  type: undefined,
  accountIds: [],
  categoryIds: [],
  tags: [],
  dateRange: {},
  searchQuery: '',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setTransactionType: (state, action: PayloadAction<typeof state.type>) => {
      state.type = action.payload;
    },
    toggleAccount: (state, action: PayloadAction<UUID>) => {
      const id = action.payload;
      const index = state.accountIds.indexOf(id);
      if (index >= 0) {
        state.accountIds.splice(index, 1);
      } else {
        state.accountIds.push(id);
      }
    },
    toggleCategory: (state, action: PayloadAction<UUID>) => {
      const id = action.payload;
      const index = state.categoryIds.indexOf(id);
      if (index >= 0) {
        state.categoryIds.splice(index, 1);
      } else {
        state.categoryIds.
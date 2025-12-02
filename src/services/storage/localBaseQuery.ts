// src/services/storage/localBaseQuery.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { STORAGE_KEYS } from '../../utils/env';

// Default database structure with initial seed data
const DEFAULT_DB = {
  accounts: [
    {
      id: 'acc1',
      name: 'Cash',
      type: 'cash',
      openingBalance: 500,
      currencyCode: 'BDT',
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'acc2',
      name: 'Main Bank Account',
      type: 'bank',
      openingBalance: 2500,
      currencyCode: 'BDT',
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ],
  categories: [
    {
      id: 'cat1',
      name: 'Food & Dining',
      type: 'expense',
      parentId: null,
      color: '#EF4444',
      icon: '🍽️',
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'cat2',
      name: 'Transportation',
      type: 'expense',
      parentId: null,
      color: '#3B82F6',
      icon: '🚗',
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'cat3',
      name: 'Salary',
      type: 'income',
      parentId: null,
      color: '#10B981',
      icon: '💰',
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'cat4',
      name: 'Groceries',
      type: 'expense',
      parentId: null,
      color: '#22C55E',
      icon: '🛒',
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'cat5',
      name: 'Utilities',
      type: 'expense',
      parentId: null,
      color: '#F59E0B',
      icon: '⚡',
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'cat6',
      name: 'Entertainment',
      type: 'expense',
      parentId: null,
      color: '#8B5CF6',
      icon: '🎬',
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'cat7',
      name: 'Healthcare',
      type: 'expense',
      parentId: null,
      color: '#EC4899',
      icon: '🏥',
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'cat8',
      name: 'Rent',
      type: 'expense',
      parentId: null,
      color: '#6B7280',
      icon: '🏠',
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'cat9',
      name: 'Freelance Work',
      type: 'income',
      parentId: null,
      color: '#06B6D4',
      icon: '💼',
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'cat10',
      name: 'Investment Returns',
      type: 'income',
      parentId: null,
      color: '#84CC16',
      icon: '📈',
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ],
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
      // Add timeout to AsyncStorage operation
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AsyncStorage timeout')), 3000)
      );

      const loadPromise = AsyncStorage.getItem(STORAGE_KEYS.APP_DB);
      const dbJson = await Promise.race([loadPromise, timeoutPromise]);

      if (dbJson) {
        this.cache = JSON.parse(dbJson);
      } else {
        console.info('No database found, using default with seed data...');
        this.cache = { ...DEFAULT_DB };
        // Save the default database immediately
        await this.saveDB(this.cache);
      }

      if (this?.cache) {
        console.info('Database loaded:', {
          accounts: this?.cache.accounts.length,
          categories: this?.cache.categories.length,
          transactions: this?.cache.transactions.length
        });
      }

      return this.cache!;
    } catch (error) {
      console.error('Failed to load database:', error);
      // If it's a timeout or parse error, return default DB
      this.cache = { ...DEFAULT_DB };
      return this.cache;
    }
  }

  async resetDB(): Promise<void> {
    console.log('Resetting database to default...');
    this.cache = { ...DEFAULT_DB };
    await this.saveDB(this.cache);
  }

  async saveDB(data: LocalDBData): Promise<void> {
    try {
      this.cache = data;

      // Add timeout to save operation
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AsyncStorage save timeout')), 3000)
      );

      const savePromise = AsyncStorage.setItem(STORAGE_KEYS.APP_DB, JSON.stringify(data));
      await Promise.race([savePromise, timeoutPromise]);
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
> = async (args): Promise<{ data: unknown } | { error: FetchBaseQueryError }> => {
  // Create timeout promise to simulate network behavior
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('AbortError: Operation timed out'));
    }, 5000); // 5 second timeout
  });

  try {
    // Normalize args
    const { url, method = 'GET', body } = typeof args === 'string' ? { url: args } : args;

    // Wrap the operation in a race with timeout
    const operationPromise = (async () => {

      // Parse URL and params
      const [pathname, search] = url.split('?');
      const pathParts = pathname.split('/').filter(Boolean); // Remove empty strings
      const resource = pathParts[0]; // First part is the resource name

      // Parse query params manually for React Native compatibility
      const parseQueryParams = (queryString: string): Record<string, string> => {
        if (!queryString) return {};
        return queryString.split('&').reduce((acc, param) => {
          const [key, value] = param.split('=');
          if (key) acc[key] = decodeURIComponent(value || '');
          return acc;
        }, {} as Record<string, string>);
      };
      const params = parseQueryParams(search || '');

      console.log(`LocalBaseQuery: ${method.toUpperCase()} ${pathname}`, body ? { body } : '');

      // Load database
      const db = await localDB.loadDB();
      let result;

      switch (method.toUpperCase()) {
        case 'GET': {
          if (pathname.includes('/') && pathname.split('/').length === 3) {
            // GET /resource/:id
            const [, resourceName, id] = pathname.split('/');
            const resourceData = db[resourceName as keyof LocalDBData];
            if (!Array.isArray(resourceData)) {
              return { error: { status: 400, data: `Invalid resource: ${resourceName}` } as FetchBaseQueryError };
            }
            const item = resourceData.find((dbItem: any) => dbItem.id === id);
            if (!item) {
              return { error: { status: 404, data: 'Not found' } as FetchBaseQueryError };
            }
            result = item;
          } else {
            // GET /resource with optional query params
            const resourceData = db[resource as keyof LocalDBData];
            if (!Array.isArray(resourceData)) {
              return { error: { status: 400, data: `Invalid resource: ${resource}` } as FetchBaseQueryError };
            }
            let data = [...resourceData];

            // Apply filters
            const typeParam = params.type;
            if (typeParam) {
              data = data.filter((item: any) => item.type === typeParam);
            }

            const dateGteParam = params.date_gte;
            if (dateGteParam) {
              const startDate = new Date(dateGteParam);
              data = data.filter((item: any) => new Date(item.date) >= startDate);
            }

            const dateLteParam = params.date_lte;
            if (dateLteParam) {
              const endDate = new Date(dateLteParam);
              data = data.filter((item: any) => new Date(item.date) <= endDate);
            }

            const monthParam = params.month;
            if (monthParam) {
              data = data.filter((item: any) => item.month === monthParam);
            }

            const categoryIdParam = params.categoryId;
            if (categoryIdParam) {
              data = data.filter((item: any) => item.categoryId === categoryIdParam);
            }

            // Apply sorting
            const sortBy = params._sort || 'createdAt';
            const sortOrder = params._order || 'desc';

            data.sort((a: any, b: any) => {
              const aVal = a[sortBy];
              const bVal = b[sortBy];

              // Handle numerical sorting for balance fields
              if (sortBy === 'openingBalance' || sortBy === 'amount') {
                const numA = typeof aVal === 'number' ? aVal : parseFloat(aVal) || 0;
                const numB = typeof bVal === 'number' ? bVal : parseFloat(bVal) || 0;

                if (sortOrder === 'desc') {
                  return numB - numA;
                }
                return numA - numB;
              }

              // Handle string/date sorting
              if (sortOrder === 'desc') {
                return aVal < bVal ? 1 : -1;
              }
              return aVal > bVal ? 1 : -1;
            });

            // Apply pagination
            const pageParam = params._page;
            const limitParam = params._limit;
            const page = parseInt(pageParam || '1', 10);
            const limit = parseInt(limitParam || '1000', 10);
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

          if (!resourceArray || !Array.isArray(resourceArray)) {
            return { error: { status: 400, data: `Invalid resource: ${resource}` } as FetchBaseQueryError };
          }

          // Special handling for transactions - update account balances
          if (resource === 'transactions') {
            const transaction = newItem as any;
            const { type, amount, accountId, accountIdTo } = transaction;

            if (type && amount && accountId) {
              const accountsArray = db.accounts as any[];

              // Update source account balance
              const sourceAccountIndex = accountsArray.findIndex((acc: any) => acc.id === accountId);
              if (sourceAccountIndex !== -1) {
                const currentBalance = accountsArray[sourceAccountIndex].openingBalance || 0;

                if (type === 'income') {
                  // Income increases account balance
                  accountsArray[sourceAccountIndex].openingBalance = currentBalance + amount;
                } else if (type === 'expense') {
                  // Expense decreases account balance
                  accountsArray[sourceAccountIndex].openingBalance = currentBalance - amount;
                } else if (type === 'transfer' && accountIdTo) {
                  // Transfer decreases source account balance
                  accountsArray[sourceAccountIndex].openingBalance = currentBalance - amount;

                  // Transfer increases destination account balance
                  const destAccountIndex = accountsArray.findIndex((acc: any) => acc.id === accountIdTo);
                  if (destAccountIndex !== -1) {
                    const destCurrentBalance = accountsArray[destAccountIndex].openingBalance || 0;
                    accountsArray[destAccountIndex].openingBalance = destCurrentBalance + amount;
                    accountsArray[destAccountIndex].updatedAt = now;
                  }
                }

                accountsArray[sourceAccountIndex].updatedAt = now;
              }
            }
          }

          resourceArray.push(newItem);
          await localDB.saveDB(db);
          result = newItem;
          break;
        }

        case 'PUT':
        case 'PATCH': {
          const id = pathname.split('/').pop() || (body as any)?.id;
          const resourceArray = db[resource as keyof LocalDBData] as any[];

          if (!resourceArray || !Array.isArray(resourceArray)) {
            return { error: { status: 400, data: `Invalid resource: ${resource}` } as FetchBaseQueryError };
          }

          const index = resourceArray.findIndex((item: any) => item.id === id);

          if (index === -1) {
            return { error: { status: 404, data: 'Not found' } as FetchBaseQueryError };
          }

          // Special handling for transactions - reverse old transaction and apply new one
          if (resource === 'transactions') {
            const oldTransaction = resourceArray[index];
            const accountsArray = db.accounts as any[];
            const now = new Date().toISOString();

            // Reverse the old transaction
            if (oldTransaction.type && oldTransaction.amount && oldTransaction.accountId) {
              const sourceAccountIndex = accountsArray.findIndex((acc: any) => acc.id === oldTransaction.accountId);
              if (sourceAccountIndex !== -1) {
                const currentBalance = accountsArray[sourceAccountIndex].openingBalance || 0;

                if (oldTransaction.type === 'income') {
                  // Reverse income: decrease account balance
                  accountsArray[sourceAccountIndex].openingBalance = currentBalance - oldTransaction.amount;
                } else if (oldTransaction.type === 'expense') {
                  // Reverse expense: increase account balance
                  accountsArray[sourceAccountIndex].openingBalance = currentBalance + oldTransaction.amount;
                } else if (oldTransaction.type === 'transfer' && oldTransaction.accountIdTo) {
                  // Reverse transfer: increase source, decrease destination
                  accountsArray[sourceAccountIndex].openingBalance = currentBalance + oldTransaction.amount;

                  const destAccountIndex = accountsArray.findIndex((acc: any) => acc.id === oldTransaction.accountIdTo);
                  if (destAccountIndex !== -1) {
                    const destCurrentBalance = accountsArray[destAccountIndex].openingBalance || 0;
                    accountsArray[destAccountIndex].openingBalance = destCurrentBalance - oldTransaction.amount;
                    accountsArray[destAccountIndex].updatedAt = now;
                  }
                }

                accountsArray[sourceAccountIndex].updatedAt = now;
              }
            }

            // Apply the new transaction
            const newTransaction = { ...oldTransaction, ...body };
            if (newTransaction.type && newTransaction.amount && newTransaction.accountId) {
              const sourceAccountIndex = accountsArray.findIndex((acc: any) => acc.id === newTransaction.accountId);
              if (sourceAccountIndex !== -1) {
                const currentBalance = accountsArray[sourceAccountIndex].openingBalance || 0;

                if (newTransaction.type === 'income') {
                  // Income increases account balance
                  accountsArray[sourceAccountIndex].openingBalance = currentBalance + newTransaction.amount;
                } else if (newTransaction.type === 'expense') {
                  // Expense decreases account balance
                  accountsArray[sourceAccountIndex].openingBalance = currentBalance - newTransaction.amount;
                } else if (newTransaction.type === 'transfer' && newTransaction.accountIdTo) {
                  // Transfer decreases source account balance
                  accountsArray[sourceAccountIndex].openingBalance = currentBalance - newTransaction.amount;

                  // Transfer increases destination account balance
                  const destAccountIndex = accountsArray.findIndex((acc: any) => acc.id === newTransaction.accountIdTo);
                  if (destAccountIndex !== -1) {
                    const destCurrentBalance = accountsArray[destAccountIndex].openingBalance || 0;
                    accountsArray[destAccountIndex].openingBalance = destCurrentBalance + newTransaction.amount;
                    accountsArray[destAccountIndex].updatedAt = now;
                  }
                }

                accountsArray[sourceAccountIndex].updatedAt = now;
              }
            }
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

          if (!resourceArray || !Array.isArray(resourceArray)) {
            return { error: { status: 400, data: `Invalid resource: ${resource}` } as FetchBaseQueryError };
          }

          const index = resourceArray.findIndex((item: any) => item.id === id);

          if (index === -1) {
            return { error: { status: 404, data: 'Not found' } as FetchBaseQueryError };
          }

          // Special handling for transactions - reverse the transaction effect on balances
          if (resource === 'transactions') {
            const transaction = resourceArray[index];
            const accountsArray = db.accounts as any[];
            const now = new Date().toISOString();

            if (transaction.type && transaction.amount && transaction.accountId) {
              const sourceAccountIndex = accountsArray.findIndex((acc: any) => acc.id === transaction.accountId);
              if (sourceAccountIndex !== -1) {
                const currentBalance = accountsArray[sourceAccountIndex].openingBalance || 0;

                if (transaction.type === 'income') {
                  // Reverse income: decrease account balance
                  accountsArray[sourceAccountIndex].openingBalance = currentBalance - transaction.amount;
                } else if (transaction.type === 'expense') {
                  // Reverse expense: increase account balance
                  accountsArray[sourceAccountIndex].openingBalance = currentBalance + transaction.amount;
                } else if (transaction.type === 'transfer' && transaction.accountIdTo) {
                  // Reverse transfer: increase source, decrease destination
                  accountsArray[sourceAccountIndex].openingBalance = currentBalance + transaction.amount;

                  const destAccountIndex = accountsArray.findIndex((acc: any) => acc.id === transaction.accountIdTo);
                  if (destAccountIndex !== -1) {
                    const destCurrentBalance = accountsArray[destAccountIndex].openingBalance || 0;
                    accountsArray[destAccountIndex].openingBalance = destCurrentBalance - transaction.amount;
                    accountsArray[destAccountIndex].updatedAt = now;
                  }
                }

                accountsArray[sourceAccountIndex].updatedAt = now;
              }
            }
          }

          resourceArray.splice(index, 1);
          await localDB.saveDB(db);
          result = { id };
          break;
        }

        default:
          return { error: { status: 405, data: 'Method not allowed' } as FetchBaseQueryError };
      }

      console.log(`LocalBaseQuery result:`, result);
      return { data: result };
    })();

    // Race between operation and timeout
    const result = await Promise.race([operationPromise, timeoutPromise]);
    return result as { data: unknown } | { error: FetchBaseQueryError };
  } catch (error) {
    console.error('LocalBaseQuery error:', error);

    // Handle timeout errors specifically
    if (error instanceof Error && error.message.includes('AbortError')) {
      return {
        error: {
          status: 'TIMEOUT_ERROR' as const,
          error: error.message
        } as FetchBaseQueryError
      };
    }

    return {
      error: {
        status: 500,
        data: error instanceof Error ? error.message : 'Unknown error'
      } as FetchBaseQueryError
    };
  }
};
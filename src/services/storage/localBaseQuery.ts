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
      // Add timeout to AsyncStorage operation
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('AsyncStorage timeout')), 3000)
      );
      
      const loadPromise = AsyncStorage.getItem(STORAGE_KEYS.APP_DB);
      const dbJson = await Promise.race([loadPromise, timeoutPromise]);
      
      this.cache = dbJson ? JSON.parse(dbJson) : { ...DEFAULT_DB };
      return this.cache;
    } catch (error) {
      console.error('Failed to load database:', error);
      // If it's a timeout or parse error, return default DB
      this.cache = { ...DEFAULT_DB };
      return this.cache;
    }
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
> = async (args) => {
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
    })();

    // Race between operation and timeout
    const result = await Promise.race([operationPromise, timeoutPromise]);
    return result;
  } catch (error) {
    console.error('LocalBaseQuery error:', error);
    
    // Handle timeout errors specifically
    if (error instanceof Error && error.message.includes('AbortError')) {
      return { 
        error: { 
          status: 'TIMEOUT_ERROR', 
          data: error.message 
        } 
      };
    }
    
    return { 
      error: { 
        status: 500, 
        data: error instanceof Error ? error.message : 'Unknown error' 
      } 
    };
  }
};
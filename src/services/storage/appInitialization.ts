import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Account, Category, Transaction, Budget } from '../../types/global';
import { ACCOUNT_TYPES } from '../../constants/accountTypes';

// Storage keys
export const STORAGE_KEYS = {
  APP_DB: 'appDb',
  ONBOARDING_COMPLETE: 'onboardingComplete',
  APP_SETTINGS: 'appSettings',
  SECURITY_SETTINGS: 'securitySettings',
  BACKUP_TIMESTAMP: 'lastBackupTimestamp',
} as const;

// Default database structure
export interface AppDatabase {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  attachments: any[];
  recurringRules: any[];
  transactionTemplates: any[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

// Default categories for seeding
const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Food & Dining', type: 'expense', parentId: null, color: '#F97316', icon: 'restaurant-outline', isArchived: false },
  { name: 'Groceries', type: 'expense', parentId: null, color: '#10B981', icon: 'bag-outline', isArchived: false },
  { name: 'Transportation', type: 'expense', parentId: null, color: '#3B82F6', icon: 'car-outline', isArchived: false },
  { name: 'Utilities', type: 'expense', parentId: null, color: '#8B5CF6', icon: 'flash-outline', isArchived: false },
  { name: 'Entertainment', type: 'expense', parentId: null, color: '#EC4899', icon: 'game-controller-outline', isArchived: false },
  { name: 'Healthcare', type: 'expense', parentId: null, color: '#EF4444', icon: 'medical-outline', isArchived: false },
  { name: 'Shopping', type: 'expense', parentId: null, color: '#F59E0B', icon: 'bag-handle-outline', isArchived: false },
  { name: 'Education', type: 'expense', parentId: null, color: '#06B6D4', icon: 'school-outline', isArchived: false },
  { name: 'Personal Care', type: 'expense', parentId: null, color: '#84CC16', icon: 'person-outline', isArchived: false },
  { name: 'Other', type: 'expense', parentId: null, color: '#6B7280', icon: 'ellipsis-horizontal-outline', isArchived: false },
];

const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Salary', type: 'income', parentId: null, color: '#10B981', icon: 'card-outline', isArchived: false },
  { name: 'Business', type: 'income', parentId: null, color: '#3B82F6', icon: 'business-outline', isArchived: false },
  { name: 'Investment', type: 'income', parentId: null, color: '#8B5CF6', icon: 'trending-up-outline', isArchived: false },
  { name: 'Freelance', type: 'income', parentId: null, color: '#F59E0B', icon: 'laptop-outline', isArchived: false },
  { name: 'Gift', type: 'income', parentId: null, color: '#EC4899', icon: 'gift-outline', isArchived: false },
  { name: 'Other Income', type: 'income', parentId: null, color: '#6B7280', icon: 'add-circle-outline', isArchived: false },
];

// Generate default accounts from centralized ACCOUNT_TYPES
const DEFAULT_ACCOUNTS: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>[] = ACCOUNT_TYPES.map(accountType => ({
  name: accountType.label,
  type: accountType.value,
  openingBalance: 0,
  currencyCode: 'BDT', // Will be replaced with user's currency during initialization
  isArchived: false,
}));

class AppInitializationService {
  private static instance: AppInitializationService;

  static getInstance(): AppInitializationService {
    if (!AppInitializationService.instance) {
      AppInitializationService.instance = new AppInitializationService();
    }
    return AppInitializationService.instance;
  }

  /**
   * Initialize the app database with default data
   */
  async initializeDatabase(userCurrency: string = 'BDT'): Promise<AppDatabase> {
    try {
      const existingDb = await this.getDatabase();

      if (existingDb) {
        console.info('Database already exists, skipping initialization');
        return existingDb;
      }

      const now = new Date().toISOString();

      // Create categories with proper IDs
      const categories: Category[] = [
        ...DEFAULT_EXPENSE_CATEGORIES,
        ...DEFAULT_INCOME_CATEGORIES,
      ].map(cat => ({
        ...cat,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      }));

      // Create accounts with user's currency
      const accounts: Account[] = DEFAULT_ACCOUNTS.map(acc => ({
        ...acc,
        id: uuidv4(),
        currencyCode: userCurrency,
        createdAt: now,
        updatedAt: now,
      }));

      // Create default database
      const defaultDb: AppDatabase = {
        accounts,
        categories,
        transactions: [],
        budgets: [],
        attachments: [],
        recurringRules: [],
        transactionTemplates: [],
        version: '1.0.0',
        createdAt: now,
        updatedAt: now,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.APP_DB, JSON.stringify(defaultDb));
      console.info('Database initialized successfully');

      return defaultDb;
    } catch (error) {
      console.error('Error initializing database:', error);
      throw new Error('Failed to initialize app database');
    }
  }

  /**
   * Get the current database
   */
  async getDatabase(): Promise<AppDatabase | null> {
    try {
      const dbJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_DB);
      return dbJson ? JSON.parse(dbJson) : null;
    } catch (error) {
      console.error('Error getting database:', error);
      return null;
    }
  }

  /**
   * Update the database
   */
  async updateDatabase(updates: Partial<AppDatabase>): Promise<void> {
    try {
      const currentDb = await this.getDatabase();
      if (!currentDb) {
        throw new Error('Database not found');
      }

      const updatedDb: AppDatabase = {
        ...currentDb,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.APP_DB, JSON.stringify(updatedDb));
    } catch (error) {
      console.error('Error updating database:', error);
      throw error;
    }
  }

  /**
   * Check if onboarding is complete
   */
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as complete
   */
  async completeOnboarding(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  /**
   * Get app settings
   */
  async getAppSettings(): Promise<any> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Error getting app settings:', error);
      return {};
    }
  }

  /**
   * Update app settings
   */
  async updateAppSettings(settings: any): Promise<void> {
    try {
      const currentSettings = await this.getAppSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error updating app settings:', error);
      throw error;
    }
  }

  /**
   * Reset all app data (for settings/debugging)
   */
  async resetAppData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
      console.info('App data reset successfully');
    } catch (error) {
      console.error('Error resetting app data:', error);
      throw error;
    }
  }

  /**
   * Get database stats for debugging
   */
  async getDatabaseStats(): Promise<{
    accounts: number;
    categories: number;
    transactions: number;
    budgets: number;
    databaseSize: string;
  }> {
    try {
      const db = await this.getDatabase();
      if (!db) {
        return {
          accounts: 0,
          categories: 0,
          transactions: 0,
          budgets: 0,
          databaseSize: '0 KB',
        };
      }

      const dbString = JSON.stringify(db);
      const sizeInBytes = new Blob([dbString]).size;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);

      return {
        accounts: db.accounts.length,
        categories: db.categories.length,
        transactions: db.transactions.length,
        budgets: db.budgets.length,
        databaseSize: `${sizeInKB} KB`,
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  /**
   * Migrate database if needed (for future versions)
   */
  async migrateDatabase(targetVersion: string = '1.0.0'): Promise<void> {
    try {
      const db = await this.getDatabase();
      if (!db) return;

      if (db.version !== targetVersion) {
        console.info(`Migrating database from ${db.version} to ${targetVersion}`);

        // Add migration logic here for future versions
        const migratedDb: AppDatabase = {
          ...db,
          version: targetVersion,
          updatedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(STORAGE_KEYS.APP_DB, JSON.stringify(migratedDb));
        console.info('Database migration completed');
      }
    } catch (error) {
      console.error('Error migrating database:', error);
      throw error;
    }
  }

  /**
   * Create backup of current database
   */
  async createBackup(): Promise<string> {
    try {
      const db = await this.getDatabase();
      if (!db) {
        throw new Error('No database found to backup');
      }

      const backupData = {
        ...db,
        backupTimestamp: new Date().toISOString(),
        backupVersion: '1.0.0',
      };

      const backupString = JSON.stringify(backupData, null, 2);

      // Update backup timestamp
      await AsyncStorage.setItem(STORAGE_KEYS.BACKUP_TIMESTAMP, new Date().toISOString());

      return backupString;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  async restoreFromBackup(backupString: string): Promise<void> {
    try {
      const backupData = JSON.parse(backupString);

      // Validate backup data structure
      if (!backupData.accounts || !backupData.categories || !backupData.transactions) {
        throw new Error('Invalid backup data structure');
      }

      const restoredDb: AppDatabase = {
        accounts: backupData.accounts,
        categories: backupData.categories,
        transactions: backupData.transactions,
        budgets: backupData.budgets || [],
        attachments: backupData.attachments || [],
        recurringRules: backupData.recurringRules || [],
        transactionTemplates: backupData.transactionTemplates || [],
        version: '1.0.0',
        createdAt: backupData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.APP_DB, JSON.stringify(restoredDb));
      console.info('Database restored from backup successfully');
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }
}

const appInit = AppInitializationService.getInstance();

/**
 * Initialize the app - called from App.tsx on startup
 */
export const initializeApp = async (): Promise<void> => {
  try {
    console.info('Initializing app...');

    // Check if onboarding is complete
    const isOnboardingComplete = await appInit.isOnboardingComplete();

    if (!isOnboardingComplete) {
      console.info('First time app launch - will show onboarding');
      // Don't initialize database yet - wait for onboarding
      return;
    }

    // Initialize/migrate database if needed
    await appInit.migrateDatabase();

    // Get database to ensure it's initialized
    let db = await appInit.getDatabase();
    if (!db) {
      console.info('Database not found, initializing with defaults...');
      db = await appInit.initializeDatabase();
    }

    console.info('App initialization complete');
  } catch (error) {
    console.error('App initialization failed:', error);
    // Don't throw - app should still be usable
  }
};

export default AppInitializationService;
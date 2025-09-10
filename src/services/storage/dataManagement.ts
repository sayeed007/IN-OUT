// src/services/storage/dataManagement.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNFS from 'react-native-fs';
import Share from 'react-native-share';
import * as DocumentPicker from '@react-native-documents/picker';
import { Platform } from 'react-native';
import type { Account, Category, Transaction, Budget } from '../../types/global';

// Import the actual storage keys used by the app
import { STORAGE_KEYS } from '../../utils/env';

interface AppData {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  metadata: {
    exportDate: string;
    version: string;
    totalRecords: number;
  };
}

export class DataManagementService {
  /**
   * Check if there's any data to export
   */
  static async checkDataExists(): Promise<boolean> {
    try {
      const data = await this.getAllAppData();
      return (
        data.accounts.length > 0 ||
        data.categories.length > 0 ||
        data.transactions.length > 0 ||
        data.budgets.length > 0
      );
    } catch (error) {
      console.error('Error checking data existence:', error);
      return false;
    }
  }

  /**
   * Export all app data to CSV format
   */
  static async exportDataToCSV(): Promise<{ filePath: string; fileName: string }> {
    try {
      const data = await this.getAllAppData();

      // Check if there's data to export
      const hasData = data.accounts.length > 0 || data.categories.length > 0 ||
        data.transactions.length > 0 || data.budgets.length > 0;

      if (!hasData) {
        throw new Error('No data available to export');
      }

      const exportDate = new Date().toISOString().split('T')[0];

      // For now, let's just export transactions as it's the most important data
      const transactionsCSV = this.convertTransactionsToCSV(data.transactions);

      // Use Downloads directory on Android, Documents on iOS
      const exportPath = Platform.OS === 'android'
        ? RNFS.DownloadDirectoryPath
        : RNFS.DocumentDirectoryPath;

      const fileName = `transactions_export_${exportDate}.csv`;
      const filePath = `${exportPath}/${fileName}`;

      // Write the CSV file
      await RNFS.writeFile(filePath, transactionsCSV, 'utf8');

      // Verify file was created
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        throw new Error('Failed to create export file');
      }

      console.log('File created at:', filePath);

      // Return the file details - export is complete
      return {
        filePath,
        fileName
      };

    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Share an exported file
   */
  static async shareExportedFile(filePath: string, fileName: string): Promise<{ shared: boolean; cancelled: boolean }> {
    try {
      const shareOptions = {
        title: 'Financial Data Export',
        message: `Your transaction data export - ${fileName}`,
        url: `file://${filePath}`,
        type: 'text/csv',
      };

      await Share.open(shareOptions);
      return { shared: true, cancelled: false };
    } catch (shareError: any) {
      console.log('Sharing result:', shareError);

      // Check if user cancelled the share
      const errorMessage = shareError?.message?.toLowerCase() || '';
      const isCancelled = errorMessage.includes('cancel') ||
        errorMessage.includes('dismiss') ||
        errorMessage.includes('user did not share');

      if (isCancelled) {
        return { shared: false, cancelled: true };
      }

      // If sharing failed for other reasons, try fallback
      try {
        // Read the file content for fallback sharing
        const csvContent = await RNFS.readFile(filePath, 'utf8');
        const truncatedContent = csvContent.length > 2000
          ? csvContent.substring(0, 2000) + '\n\n... (content truncated)'
          : csvContent;

        await Share.open({
          title: 'Financial Data Export',
          message: `Your transaction data:\n\n${truncatedContent}`,
        });

        return { shared: true, cancelled: false };
      } catch (fallbackError) {
        console.error('Fallback sharing also failed:', fallbackError);
        throw new Error('Unable to share the file. The file was exported successfully to your device.');
      }
    }
  }

  /**
   * Import transactions from CSV file
   */
  static async importDataFromCSV(): Promise<{ count: number } | null> {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.csv, DocumentPicker.types.plainText],
        allowMultiSelection: false,
      });

      const file = result[0];
      const csvContent = await RNFS.readFile(file.uri, 'utf8');

      // Parse CSV and convert to transactions
      const transactions = this.parseTransactionsFromCSV(csvContent);

      if (transactions.length === 0) {
        return null;
      }

      // Store the imported transactions in the main app database
      const dbData = await AsyncStorage.getItem(STORAGE_KEYS.APP_DB);
      const db = dbData ? JSON.parse(dbData) : { accounts: [], categories: [], transactions: [], budgets: [] };

      const existingTransactions = db.transactions || [];
      const updatedTransactions = [...existingTransactions, ...transactions];

      db.transactions = updatedTransactions;
      await AsyncStorage.setItem(STORAGE_KEYS.APP_DB, JSON.stringify(db));

      return { count: transactions.length };
    } catch (error) {
      console.error('Import failed:', error);
      // Check if error message indicates user cancellation
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message?.toLowerCase();
        if (errorMessage?.includes('cancel') || errorMessage?.includes('dismissed')) {
          return null;
        }
      }
      throw error;
    }
  }

  /**
   * Create a complete backup of all app data
   */
  static async backupAllData(): Promise<{ filePath: string; fileName: string }> {
    try {
      const data = await this.getAllAppData();
      const backupData = {
        ...data,
        metadata: {
          ...data.metadata,
          backupDate: new Date().toISOString(),
          version: '1.0.0',
        },
      };

      const backupJson = JSON.stringify(backupData, null, 2);
      const backupDate = new Date().toISOString().split('T')[0];
      const fileName = `financial_backup_${backupDate}.json`;

      // Use Downloads directory on Android, Documents on iOS  
      const backupPath = Platform.OS === 'android'
        ? RNFS.DownloadDirectoryPath
        : RNFS.DocumentDirectoryPath;

      const filePath = `${backupPath}/${fileName}`;

      await RNFS.writeFile(filePath, backupJson, 'utf8');

      // Verify file was created
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        throw new Error('Failed to create backup file');
      }

      console.log('Backup file created at:', filePath);

      // Return the file details - backup is complete
      return {
        filePath,
        fileName
      };

    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }

  /**
   * Share a backup file
   */
  static async shareBackupFile(filePath: string, fileName: string): Promise<{ shared: boolean; cancelled: boolean }> {
    try {
      const shareOptions = {
        title: 'Financial Data Backup',
        message: `Complete backup of your financial data - ${fileName}`,
        url: `file://${filePath}`,
        type: 'application/json',
      };

      await Share.open(shareOptions);
      return { shared: true, cancelled: false };
    } catch (shareError: any) {
      console.log('Backup sharing result:', shareError);

      // Check if user cancelled the share
      const errorMessage = shareError?.message?.toLowerCase() || '';
      const isCancelled = errorMessage.includes('cancel') ||
        errorMessage.includes('dismiss') ||
        errorMessage.includes('user did not share');

      if (isCancelled) {
        return { shared: false, cancelled: true };
      }

      // For backup files, we don't want to share the content as text (too large)
      // So just throw an error if file sharing fails
      throw new Error('Unable to share the backup file. The backup was created successfully on your device.');
    }
  }

  /**
   * Restore data from backup file
   */
  static async restoreFromBackup(): Promise<boolean> {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.json],
        allowMultiSelection: false,
      });

      const file = result[0];
      const backupContent = await RNFS.readFile(file.uri, 'utf8');
      const backupData: AppData = JSON.parse(backupContent);

      // Validate backup data structure
      if (!this.validateBackupData(backupData)) {
        return false;
      }

      // Perform the restore
      await this.performRestore(backupData);
      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      // Check if error message indicates user cancellation
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message?.toLowerCase();
        if (errorMessage?.includes('cancel') || errorMessage?.includes('dismissed')) {
          return false;
        }
      }
      throw error;
    }
  }

  // Helper methods

  private static async getAllAppData(): Promise<AppData> {
    try {
      // Get the main database object that your app actually uses
      const dbData = await AsyncStorage.getItem(STORAGE_KEYS.APP_DB);
      const db = dbData ? JSON.parse(dbData) : null;

      const accounts = db?.accounts || [];
      const categories = db?.categories || [];
      const transactions = db?.transactions || [];
      const budgets = db?.budgets || [];

      return {
        accounts,
        categories,
        transactions,
        budgets,
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          totalRecords: accounts.length + categories.length + transactions.length + budgets.length,
        },
      };
    } catch (error) {
      console.error('Error getting app data:', error);
      // Return empty data structure if there's an error
      return {
        accounts: [],
        categories: [],
        transactions: [],
        budgets: [],
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          totalRecords: 0,
        },
      };
    }
  }

  private static async getStoredData<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting stored data for key ${key}:`, error);
      return null;
    }
  }

  private static convertTransactionsToCSV(transactions: Transaction[]): string {
    const headers = ['ID', 'Date', 'Type', 'Amount', 'Currency', 'Category', 'Account', 'AccountTo', 'Note', 'Tags'];
    const csvRows = [headers.join(',')];

    transactions.forEach(transaction => {
      const row = [
        transaction.id,
        new Date(transaction.date).toISOString().split('T')[0],
        transaction.type,
        transaction.amount.toString(),
        transaction.currencyCode || 'USD',
        transaction.categoryId || '',
        transaction.accountId || '',
        transaction.accountIdTo || '',
        `"${(transaction.note || '').replace(/"/g, '""')}"`,
        `"${transaction.tags.join(',').replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  private static convertAccountsToCSV(accounts: Account[]): string {
    const headers = ['ID', 'Name', 'Type', 'Balance', 'Currency', 'Color', 'Created'];
    const csvRows = [headers.join(',')];

    accounts.forEach(account => {
      const row = [
        account.id,
        `"${account.name.replace(/"/g, '""')}"`,
        account.type,
        ((account as any).balance?.toString() || '0'),
        account.currencyCode || 'USD',
        ((account as any).color || ''),
        new Date(account.createdAt).toISOString().split('T')[0],
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  private static convertCategoriesToCSV(categories: Category[]): string {
    const headers = ['ID', 'Name', 'Type', 'Color', 'Icon', 'Parent', 'Created'];
    const csvRows = [headers.join(',')];

    categories.forEach(category => {
      const row = [
        category.id,
        `"${category.name.replace(/"/g, '""')}"`,
        category.type,
        category.color || '',
        category.icon || '',
        category.parentId || '',
        new Date(category.createdAt).toISOString().split('T')[0],
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  private static convertBudgetsToCSV(budgets: Budget[]): string {
    const headers = ['ID', 'Name', 'Amount', 'Period', 'Category', 'Start Date', 'End Date'];
    const csvRows = [headers.join(',')];

    budgets.forEach(budget => {
      const row = [
        budget.id,
        `"${((budget as any).name || '').replace(/"/g, '""')}"`,
        budget.amount.toString(),
        ((budget as any).period || ''),
        budget.categoryId || '',
        new Date((budget as any).startDate || new Date()).toISOString().split('T')[0],
        new Date((budget as any).endDate || new Date()).toISOString().split('T')[0],
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  private static parseTransactionsFromCSV(csvContent: string): Transaction[] {
    const lines = csvContent.split('\n');
    // const headers = lines[0].split(',');
    const transactions: Transaction[] = [];

    // Simple CSV parser - in production, you'd want a more robust parser
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = this.parseCSVLine(line);
        if (values.length < 4) continue;

        const transaction: Transaction = {
          id: values[0] || `imported_${Date.now()}_${i}`,
          date: values[1] || new Date().toISOString(),
          type: (values[2] as 'income' | 'expense' | 'transfer') || 'expense',
          amount: parseFloat(values[3]) || 0,
          currencyCode: values[4] || 'USD',
          categoryId: values[5] || null,
          accountId: values[6] || '',
          accountIdTo: values[7] || null,
          note: values[8] || undefined,
          tags: values[9] ? values[9].split(',').map(tag => tag.trim()).filter(Boolean) : [],
          attachmentIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        transactions.push(transaction);
      } catch (error) {
        console.warn(`Error parsing CSV line ${i}:`, error);
      }
    }

    return transactions;
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  private static validateBackupData(data: any): data is AppData {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.accounts) &&
      Array.isArray(data.categories) &&
      Array.isArray(data.transactions) &&
      Array.isArray(data.budgets) &&
      data.metadata &&
      typeof data.metadata === 'object'
    );
  }

  private static async performRestore(backupData: AppData): Promise<void> {
    try {
      // Store all backup data in the main app database structure
      const restoredDb = {
        accounts: backupData.accounts,
        categories: backupData.categories,
        transactions: backupData.transactions,
        budgets: backupData.budgets,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.APP_DB, JSON.stringify(restoredDb));

      // In a real app, you might want to reload the app or refresh the data
    } catch (error) {
      console.error('Restore operation failed:', error);
      throw error;
    }
  }
}
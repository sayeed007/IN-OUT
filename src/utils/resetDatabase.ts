// src/utils/resetDatabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './env';

export const resetDatabase = async (): Promise<void> => {
  try {
    console.log('Clearing AsyncStorage database...');
    await AsyncStorage.removeItem(STORAGE_KEYS.APP_DB);
    console.log('Database cleared successfully. App will use fresh seed data on next load.');
  } catch (error) {
    console.error('Failed to reset database:', error);
  }
};

export const debugDatabase = async (): Promise<void> => {
  try {
    const dbJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_DB);
    const data = dbJson ? JSON.parse(dbJson) : null;
    console.log('=== DATABASE DEBUG ===');
    if (data) {
      console.log('Accounts:', data.accounts?.length || 0);
      console.log('Categories:', data.categories?.length || 0);
      console.log('Category icons:', data.categories?.map((c: any) => ({ name: c.name, icon: c.icon })) || []);
      console.log('Transactions:', data.transactions?.length || 0);
    } else {
      console.log('No database found in storage');
    }
    console.log('====================');
  } catch (error) {
    console.error('Failed to debug database:', error);
  }
};

// Helper function to call from React DevTools or console
// Note: This is primarily for web debugging. In React Native, use the debugger console.
// Export these functions so they can be called from the debugger
export { resetDatabase as resetDB, debugDatabase as debugDB };
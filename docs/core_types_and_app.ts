// src/types/global.ts
export type UUID = string;

// Base entity interface
export interface BaseEntity {
  id: UUID;
  createdAt: string;
  updatedAt: string;
}

// Account types
export interface Account extends BaseEntity {
  name: string;
  type: 'cash' | 'bank' | 'wallet' | 'card' | 'other';
  openingBalance: number;
  currencyCode: string;
  isArchived: boolean;
}

// Category types  
export interface Category extends BaseEntity {
  name: string;
  type: 'income' | 'expense';
  parentId: UUID | null;
  color: string;
  icon: string;
  isArchived: boolean;
}

// Transaction types
export interface Transaction extends BaseEntity {
  type: 'income' | 'expense' | 'transfer';
  accountId: UUID;
  accountIdTo: UUID | null; // For transfers
  categoryId: UUID | null; // Null for transfers
  amount: number;
  currencyCode: string;
  date: string;
  note?: string;
  tags: string[];
  attachmentIds: UUID[];
}

// Budget types
export interface Budget extends BaseEntity {
  categoryId: UUID;
  month: string; // YYYY-MM format
  amount: number;
  rollover: boolean;
}

// Attachment types
export interface Attachment extends BaseEntity {
  transactionId: UUID;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

// UI State types
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface FilterState {
  type?: TransactionType;
  accountIds: UUID[];
  categoryIds: UUID[];
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  searchQuery: string;
}

export interface AppPreferences {
  currencyCode: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  firstDayOfWeek: 0 | 1; // 0 = Saturday, 1 = Sunday
  budgetStartDay: number; // 1-28
  theme: 'light' | 'dark' | 'system';
  enableAppLock: boolean;
  lockTimeout: number; // minutes
  enableNotifications: boolean;
  includeTransfersInTotals: boolean;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface MonthlyReportData {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  categoryBreakdown: ChartDataPoint[];
  dailyTrend: ChartDataPoint[];
}

// src/types/navigation.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Root Stack (handles auth flow)
export type RootStackParamList = {
  Onboarding: undefined;
  Lock: undefined;
  Main: undefined;
};

// Tab Navigator
export type TabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Add: undefined;
  Reports: undefined;
  Settings: undefined;
};

// Main Stack (authenticated screens)
export type MainStackParamList = {
  TransactionDetail: { transactionId: UUID };
  AccountManager: undefined;
  CategoryManager: undefined;
  Budget: undefined;
};

// Combined navigation types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type MainStackScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;

// src/app/providers/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, StatusBar } from 'react-native';
import { Theme, lightTheme, darkTheme } from '../../theme';
import { useAppSelector } from '../../state/hooks';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themePreference = useAppSelector(state => state.preferences.theme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const getThemeMode = () => {
      if (themePreference === 'system') {
        return Appearance.getColorScheme() === 'dark';
      }
      return themePreference === 'dark';
    };

    setIsDark(getThemeMode());

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themePreference === 'system') {
        setIsDark(colorScheme === 'dark');
      }
    });

    return () => subscription.remove();
  }, [themePreference]);

  // Update status bar style when theme changes
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
  }, [isDark]);

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    // This would dispatch an action to update preferences
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value= {{ theme, isDark, toggleTheme }
}>
  { children }
  </ThemeContext.Provider>
  );
};

// src/app/providers/StoreProvider.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../state/store';

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return <Provider store={ store }> { children } </Provider>;
};

// src/utils/env.ts
import { Platform } from 'react-native';

export const IS_DEV = __DEV__;
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';

// API Configuration
export const API_CONFIG = {
  BASE_URL: IS_DEV
    ? (IS_ANDROID ? 'http://10.0.2.2:3001' : 'http://localhost:3001')
    : '', // Empty for production (uses local storage)
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// App Configuration
export const APP_CONFIG = {
  DEFAULT_CURRENCY: 'BDT',
  MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB
  LOCK_TIMEOUT_DEFAULT: 5, // minutes
  BUDGET_ALERT_THRESHOLDS: [0.8, 1.0], // 80%, 100%
  MAX_TAGS_PER_TRANSACTION: 10,
  TRANSACTION_PAGINATION_SIZE: 50,
  CHART_COLORS_COUNT: 10,
};

// Storage Keys
export const STORAGE_KEYS = {
  APP_DB: 'appDb',
  USER_PREFERENCES: 'userPreferences',
  PIN_HASH: 'pinHash',
  BIOMETRIC_ENABLED: 'biometricEnabled',
  LAST_BACKUP_DATE: 'lastBackupDate',
} as const;

// src/utils/constants/colors.ts
export const CATEGORY_COLORS = [
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#F59E0B', // Orange
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Deep Orange
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F43F5E', // Rose
] as const;

export const CATEGORY_ICONS = [
  'shopping-cart', 'utensils', 'car', 'home', 'heart', 'briefcase',
  'gift', 'music', 'book', 'coffee', 'plane', 'shield', 'zap',
  'dollar-sign', 'credit-card', 'smartphone', 'laptop', 'gamepad-2'
] as const;

// src/app/App.tsx
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from './providers/StoreProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { AppNavigator } from './navigation/AppNavigator';
import { initializeApp } from '../services/storage/appInitialization';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize app data and preferences
    initializeApp();
  }, []);

  return (
    <StoreProvider>
    <SafeAreaProvider>
    <ThemeProvider>
    <StatusBar backgroundColor= "transparent" translucent />
      <NavigationContainer>
      <AppNavigator />
      </NavigationContainer>
      </ThemeProvider>
      </SafeAreaProvider>
      </StoreProvider>
  );
};

export default App;
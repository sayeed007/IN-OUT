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
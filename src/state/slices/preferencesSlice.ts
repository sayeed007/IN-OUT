// src/state/slices/preferencesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppPreferences } from '../../types/global';
import { APP_CONFIG } from '../../utils/env';

const initialState: AppPreferences = {
  currencyCode: APP_CONFIG.DEFAULT_CURRENCY,
  dateFormat: 'MM/DD/YYYY',
  firstDayOfWeek: 1, // Sunday
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
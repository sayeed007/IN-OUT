// src/state/slices/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getCurrentPeriodId } from '../../utils/helpers/dateUtils';

interface AppState {
  isInitialized: boolean;
  isLocked: boolean;
  currentPeriod: string; // YYYY-MM-DD format (period start date)
  currentYear: string; // YYYY format
  lastActiveTimestamp: number;
}

/**
 * Get current period ID with default start day of 1 (calendar month)
 * This is used for initial state. The actual periodStartDay from preferences
 * will be used when components render.
 */
const getInitialPeriod = () => {
  return getCurrentPeriodId(1); // Default to calendar month
};

const getCurrentYear = () => {
  return new Date().getFullYear().toString();
};

const initialState: AppState = {
  isInitialized: false,
  isLocked: false,
  currentPeriod: getInitialPeriod(),
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
    /**
     * Set the current period ID
     * @param action.payload - Period ID in YYYY-MM-DD format
     */
    setCurrentPeriod: (state, action: PayloadAction<string>) => {
      state.currentPeriod = action.payload;
    },
    /**
     * Set the current period using a periodStartDay
     * This is useful when components need to update the period with a specific start day
     */
    setCurrentPeriodWithStartDay: (state, action: PayloadAction<{ periodId: string; periodStartDay: number }>) => {
      state.currentPeriod = action.payload.periodId;
    },
    setCurrentYear: (state, action: PayloadAction<string>) => {
      state.currentYear = action.payload;
    },
    updateLastActive: (state) => {
      state.lastActiveTimestamp = Date.now();
    },
    /**
     * Reset to current period based on today's date
     * @param action.payload - Optional periodStartDay (defaults to 1)
     */
    resetToCurrentPeriod: (state, action: PayloadAction<number | undefined>) => {
      const periodStartDay = action.payload || 1;
      state.currentPeriod = getCurrentPeriodId(periodStartDay);
      state.currentYear = getCurrentYear();
    },
  },
});

export const {
  setInitialized,
  setLocked,
  setCurrentPeriod,
  setCurrentPeriodWithStartDay,
  setCurrentYear,
  updateLastActive,
  resetToCurrentPeriod,
} = appSlice.actions;

export default appSlice.reducer;
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
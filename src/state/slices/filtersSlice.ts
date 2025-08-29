// src/state/slices/filtersSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FilterState, UUID } from '../../types/global';

const initialState: FilterState = {
  type: undefined,
  accountIds: [],
  categoryIds: [],
  tags: [],
  dateRange: {},
  searchQuery: '',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setTransactionType: (state, action: PayloadAction<typeof state.type>) => {
      state.type = action.payload;
    },
    toggleAccount: (state, action: PayloadAction<UUID>) => {
      const id = action.payload;
      const index = state.accountIds.indexOf(id);
      if (index >= 0) {
        state.accountIds.splice(index, 1);
      } else {
        state.accountIds.push(id);
      }
    },
    toggleCategory: (state, action: PayloadAction<UUID>) => {
      const id = action.payload;
      const index = state.categoryIds.indexOf(id);
      if (index >= 0) {
        state.categoryIds.splice(index, 1);
      } else {
        state.categoryIds.push(id);
      }
    },
    setDateRange: (state, action: PayloadAction<{ start?: string; end?: string }>) => {
      state.dateRange = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addTag: (state, action: PayloadAction<string>) => {
      if (!state.tags.includes(action.payload)) {
        state.tags.push(action.payload);
      }
    },
    removeTag: (state, action: PayloadAction<string>) => {
      const index = state.tags.indexOf(action.payload);
      if (index >= 0) {
        state.tags.splice(index, 1);
      }
    },
    clearFilters: () => initialState,
    resetToDefault: (state) => {
      state.type = undefined;
      state.accountIds = [];
      state.categoryIds = [];
      state.tags = [];
      state.dateRange = {};
      state.searchQuery = '';
    },
  },
});

export const {
  setTransactionType,
  toggleAccount,
  toggleCategory,
  setDateRange,
  setSearchQuery,
  addTag,
  removeTag,
  clearFilters,
  resetToDefault,
} = filtersSlice.actions;

export default filtersSlice.reducer;
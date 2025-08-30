// src/state/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import { api } from './api';
import appSlice from './slices/appSlice';
import filtersSlice from './slices/filtersSlice';
import preferencesSlice from './slices/preferencesSlice';
import uiSlice from './slices/uiSlice';

// Redux Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['preferences', 'app'], // Only persist specific slices
  blacklist: [api.reducerPath, 'ui'], // Don't persist API cache and UI state
};

// Combine reducers
const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  app: appSlice,
  filters: filtersSlice,
  preferences: preferencesSlice,
  ui: uiSlice,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, api.util.resetApiState.type],
      },
    }).concat(api.middleware),
});

// Create persistor
export const persistor = persistStore(store);

// Enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authSlice from './slices/authSlice';
import expenseSlice from './slices/expenseSlice';
import earningSlice from './slices/earningSlice';
import receiptSlice from './slices/receiptSlice';
import settingsSlice from './slices/settingsSlice';
import uiSlice from './slices/uiSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings'], // Only persist auth and settings
  blacklist: ['ui'], // Don't persist UI state
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  expenses: expenseSlice,
  earnings: earningSlice,
  receipts: receiptSlice,
  settings: settingsSlice,
  ui: uiSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
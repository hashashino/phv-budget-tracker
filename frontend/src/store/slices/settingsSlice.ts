import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'zh' | 'ms';
  currency: string;
  notifications: {
    enabled: boolean;
    expenseReminders: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
  privacy: {
    biometricAuth: boolean;
    dataSync: boolean;
    analytics: boolean;
  };
  banking: {
    autoSync: boolean;
    syncFrequency: 'daily' | 'weekly' | 'manual';
  };
}

const initialState: SettingsState = {
  theme: 'system',
  language: 'en',
  currency: 'SGD',
  notifications: {
    enabled: true,
    expenseReminders: true,
    weeklyReports: true,
    monthlyReports: true,
  },
  privacy: {
    biometricAuth: false,
    dataSync: true,
    analytics: true,
  },
  banking: {
    autoSync: false,
    syncFrequency: 'daily',
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'en' | 'zh' | 'ms'>) => {
      state.language = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    updateNotifications: (state, action: PayloadAction<Partial<SettingsState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    updatePrivacy: (state, action: PayloadAction<Partial<SettingsState['privacy']>>) => {
      state.privacy = { ...state.privacy, ...action.payload };
    },
    updateBanking: (state, action: PayloadAction<Partial<SettingsState['banking']>>) => {
      state.banking = { ...state.banking, ...action.payload };
    },
    resetSettings: (state) => {
      return initialState;
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setCurrency,
  updateNotifications,
  updatePrivacy,
  updateBanking,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
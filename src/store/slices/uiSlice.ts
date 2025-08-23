import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isOnboarding: boolean;
  activeTab: string;
  modals: {
    expenseForm: boolean;
    earningForm: boolean;
    receiptCapture: boolean;
    settings: boolean;
  };
  loading: {
    global: boolean;
    expenses: boolean;
    earnings: boolean;
    receipts: boolean;
    reports: boolean;
  };
  errors: {
    global: string | null;
    expenses: string | null;
    earnings: string | null;
    receipts: string | null;
    reports: string | null;
  };
}

const initialState: UiState = {
  isOnboarding: true,
  activeTab: 'Dashboard',
  modals: {
    expenseForm: false,
    earningForm: false,
    receiptCapture: false,
    settings: false,
  },
  loading: {
    global: false,
    expenses: false,
    earnings: false,
    receipts: false,
    reports: false,
  },
  errors: {
    global: null,
    expenses: null,
    earnings: null,
    receipts: null,
    reports: null,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setOnboarding: (state, action: PayloadAction<boolean>) => {
      state.isOnboarding = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setModal: (state, action: PayloadAction<{ modal: keyof UiState['modals']; visible: boolean }>) => {
      state.modals[action.payload.modal] = action.payload.visible;
    },
    setLoading: (state, action: PayloadAction<{ section: keyof UiState['loading']; loading: boolean }>) => {
      state.loading[action.payload.section] = action.payload.loading;
    },
    setError: (state, action: PayloadAction<{ section: keyof UiState['errors']; error: string | null }>) => {
      state.errors[action.payload.section] = action.payload.error;
    },
    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach(key => {
        state.errors[key as keyof UiState['errors']] = null;
      });
    },
    clearAllLoading: (state) => {
      Object.keys(state.loading).forEach(key => {
        state.loading[key as keyof UiState['loading']] = false;
      });
    },
  },
});

export const {
  setOnboarding,
  setActiveTab,
  setModal,
  setLoading,
  setError,
  clearAllErrors,
  clearAllLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Expense, ExpenseFormData } from '@types/index';
import { apiClient } from '@services/api/apiClient';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  filters: {
    category?: string;
    dateRange?: { start: string; end: string };
    searchTerm?: string;
  };
  totalExpenses: number;
  monthlyTotal: number;
  selectedExpense: Expense | null;
}

const initialState: ExpenseState = {
  expenses: [],
  isLoading: false,
  error: null,
  filters: {},
  totalExpenses: 0,
  monthlyTotal: 0,
  selectedExpense: null,
};

// Async thunks
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (params?: { page?: number; limit?: number; filters?: any }) => {
    const response = await apiClient.get('/expenses', { params });
    return response.data;
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData: ExpenseFormData) => {
    const response = await apiClient.post('/expenses', expenseData);
    return response.data;
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, data }: { id: string; data: Partial<ExpenseFormData> }) => {
    const response = await apiClient.put(`/expenses/${id}`, data);
    return response.data;
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string) => {
    await apiClient.delete(`/expenses/${id}`);
    return id;
  }
);

export const uploadReceipt = createAsyncThunk(
  'expenses/uploadReceipt',
  async ({ expenseId, image }: { expenseId: string; image: string }) => {
    const formData = new FormData();
    formData.append('receipt', {
      uri: image,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    } as any);
    
    const response = await apiClient.post(`/expenses/${expenseId}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload;
      state.totalExpenses = action.payload.reduce((sum, exp) => sum + exp.amount, 0);
    },
    addExpenseLocal: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload);
      state.totalExpenses += action.payload.amount;
    },
    updateExpenseLocal: (state, action: PayloadAction<Expense>) => {
      const index = state.expenses.findIndex(exp => exp.id === action.payload.id);
      if (index !== -1) {
        const oldAmount = state.expenses[index].amount;
        state.expenses[index] = action.payload;
        state.totalExpenses = state.totalExpenses - oldAmount + action.payload.amount;
      }
    },
    deleteExpenseLocal: (state, action: PayloadAction<string>) => {
      const expense = state.expenses.find(exp => exp.id === action.payload);
      if (expense) {
        state.totalExpenses -= expense.amount;
      }
      state.expenses = state.expenses.filter(exp => exp.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ExpenseState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedExpense: (state, action: PayloadAction<Expense | null>) => {
      state.selectedExpense = action.payload;
    },
    calculateMonthlyTotal: (state) => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      state.monthlyTotal = state.expenses
        .filter(exp => {
          const expenseDate = new Date(exp.date);
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload.data || action.payload;
        state.totalExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch expenses';
      })
      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses.unshift(action.payload);
        state.totalExpenses += action.payload.amount;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create expense';
      })
      // Update expense
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(exp => exp.id === action.payload.id);
        if (index !== -1) {
          const oldAmount = state.expenses[index].amount;
          state.expenses[index] = action.payload;
          state.totalExpenses = state.totalExpenses - oldAmount + action.payload.amount;
        }
      })
      // Delete expense
      .addCase(deleteExpense.fulfilled, (state, action) => {
        const expense = state.expenses.find(exp => exp.id === action.payload);
        if (expense) {
          state.totalExpenses -= expense.amount;
        }
        state.expenses = state.expenses.filter(exp => exp.id !== action.payload);
      })
      // Upload receipt
      .addCase(uploadReceipt.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(exp => exp.id === action.payload.expenseId);
        if (index !== -1) {
          state.expenses[index].receiptUrl = action.payload.receiptUrl;
        }
      });
  },
});

export const {
  setExpenses,
  addExpenseLocal,
  updateExpenseLocal,
  deleteExpenseLocal,
  setLoading,
  setError,
  setFilters,
  clearFilters,
  setSelectedExpense,
  calculateMonthlyTotal,
} = expenseSlice.actions;

export default expenseSlice.reducer;
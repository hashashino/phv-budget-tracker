import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Earning, EarningFormData } from '@types/index';
import { apiClient } from '@services/api/apiClient';

interface EarningState {
  earnings: Earning[];
  isLoading: boolean;
  error: string | null;
  filters: {
    platform?: string;
    source?: string;
    dateRange?: { start: string; end: string };
  };
  totalEarnings: number;
  monthlyTotal: number;
  selectedEarning: Earning | null;
  platformStats: Record<string, { total: number; count: number }>;
}

const initialState: EarningState = {
  earnings: [],
  isLoading: false,
  error: null,
  filters: {},
  totalEarnings: 0,
  monthlyTotal: 0,
  selectedEarning: null,
  platformStats: {},
};

// Async thunks
export const fetchEarnings = createAsyncThunk(
  'earnings/fetchEarnings',
  async (params?: { page?: number; limit?: number; filters?: any }) => {
    const response = await apiClient.get('/earnings', { params });
    return response.data;
  }
);

export const createEarning = createAsyncThunk(
  'earnings/createEarning',
  async (earningData: EarningFormData) => {
    const response = await apiClient.post('/earnings', earningData);
    return response.data;
  }
);

export const updateEarning = createAsyncThunk(
  'earnings/updateEarning',
  async ({ id, data }: { id: string; data: Partial<EarningFormData> }) => {
    const response = await apiClient.put(`/earnings/${id}`, data);
    return response.data;
  }
);

export const deleteEarning = createAsyncThunk(
  'earnings/deleteEarning',
  async (id: string) => {
    await apiClient.delete(`/earnings/${id}`);
    return id;
  }
);

export const processScreenshot = createAsyncThunk(
  'earnings/processScreenshot',
  async ({ image, platform }: { image: string; platform: string }) => {
    const formData = new FormData();
    formData.append('screenshot', {
      uri: image,
      type: 'image/jpeg',
      name: 'earnings_screenshot.jpg',
    } as any);
    formData.append('platform', platform);
    
    const response = await apiClient.post('/earnings/process-screenshot', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
);

const earningSlice = createSlice({
  name: 'earnings',
  initialState,
  reducers: {
    setEarnings: (state, action: PayloadAction<Earning[]>) => {
      state.earnings = action.payload;
      state.totalEarnings = action.payload.reduce((sum, earn) => sum + earn.amount, 0);
      // Calculate platform stats
      state.platformStats = action.payload.reduce((stats, earning) => {
        const platform = earning.platform;
        if (!stats[platform]) {
          stats[platform] = { total: 0, count: 0 };
        }
        stats[platform].total += earning.amount;
        stats[platform].count += 1;
        return stats;
      }, {} as Record<string, { total: number; count: number }>);
    },
    addEarningLocal: (state, action: PayloadAction<Earning>) => {
      state.earnings.unshift(action.payload);
      state.totalEarnings += action.payload.amount;
      
      // Update platform stats
      const platform = action.payload.platform;
      if (!state.platformStats[platform]) {
        state.platformStats[platform] = { total: 0, count: 0 };
      }
      state.platformStats[platform].total += action.payload.amount;
      state.platformStats[platform].count += 1;
    },
    updateEarningLocal: (state, action: PayloadAction<Earning>) => {
      const index = state.earnings.findIndex(earn => earn.id === action.payload.id);
      if (index !== -1) {
        const oldEarning = state.earnings[index];
        const oldAmount = oldEarning.amount;
        const oldPlatform = oldEarning.platform;
        
        state.earnings[index] = action.payload;
        state.totalEarnings = state.totalEarnings - oldAmount + action.payload.amount;
        
        // Update platform stats
        state.platformStats[oldPlatform].total -= oldAmount;
        state.platformStats[oldPlatform].count -= 1;
        
        const newPlatform = action.payload.platform;
        if (!state.platformStats[newPlatform]) {
          state.platformStats[newPlatform] = { total: 0, count: 0 };
        }
        state.platformStats[newPlatform].total += action.payload.amount;
        state.platformStats[newPlatform].count += 1;
      }
    },
    deleteEarningLocal: (state, action: PayloadAction<string>) => {
      const earning = state.earnings.find(earn => earn.id === action.payload);
      if (earning) {
        state.totalEarnings -= earning.amount;
        
        // Update platform stats
        const platform = earning.platform;
        if (state.platformStats[platform]) {
          state.platformStats[platform].total -= earning.amount;
          state.platformStats[platform].count -= 1;
        }
      }
      state.earnings = state.earnings.filter(earn => earn.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<EarningState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedEarning: (state, action: PayloadAction<Earning | null>) => {
      state.selectedEarning = action.payload;
    },
    calculateMonthlyTotal: (state) => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      state.monthlyTotal = state.earnings
        .filter(earn => {
          const earningDate = new Date(earn.date);
          return earningDate.getMonth() === currentMonth && earningDate.getFullYear() === currentYear;
        })
        .reduce((sum, earn) => sum + earn.amount, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch earnings
      .addCase(fetchEarnings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEarnings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.earnings = action.payload.data || action.payload;
        state.totalEarnings = state.earnings.reduce((sum, earn) => sum + earn.amount, 0);
      })
      .addCase(fetchEarnings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch earnings';
      })
      // Create earning
      .addCase(createEarning.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEarning.fulfilled, (state, action) => {
        state.isLoading = false;
        state.earnings.unshift(action.payload);
        state.totalEarnings += action.payload.amount;
      })
      .addCase(createEarning.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create earning';
      })
      // Update earning
      .addCase(updateEarning.fulfilled, (state, action) => {
        const index = state.earnings.findIndex(earn => earn.id === action.payload.id);
        if (index !== -1) {
          const oldAmount = state.earnings[index].amount;
          state.earnings[index] = action.payload;
          state.totalEarnings = state.totalEarnings - oldAmount + action.payload.amount;
        }
      })
      // Delete earning
      .addCase(deleteEarning.fulfilled, (state, action) => {
        const earning = state.earnings.find(earn => earn.id === action.payload);
        if (earning) {
          state.totalEarnings -= earning.amount;
        }
        state.earnings = state.earnings.filter(earn => earn.id !== action.payload);
      })
      // Process screenshot
      .addCase(processScreenshot.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processScreenshot.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add processed earnings to the list
        if (action.payload.earnings && Array.isArray(action.payload.earnings)) {
          action.payload.earnings.forEach((earning: Earning) => {
            state.earnings.unshift(earning);
            state.totalEarnings += earning.amount;
          });
        }
      })
      .addCase(processScreenshot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to process screenshot';
      });
  },
});

export const {
  setEarnings,
  addEarningLocal,
  updateEarningLocal,
  deleteEarningLocal,
  setLoading,
  setError,
  setFilters,
  clearFilters,
  setSelectedEarning,
  calculateMonthlyTotal,
} = earningSlice.actions;

export default earningSlice.reducer;
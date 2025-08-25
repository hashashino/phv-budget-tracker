import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Receipt } from '@types/index';
import { apiClient } from '@services/api/apiClient';

interface ReceiptState {
  receipts: Receipt[];
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
  selectedReceipt: Receipt | null;
  unprocessedCount: number;
}

const initialState: ReceiptState = {
  receipts: [],
  isLoading: false,
  error: null,
  isProcessing: false,
  selectedReceipt: null,
  unprocessedCount: 0,
};

// Async thunks
export const fetchReceipts = createAsyncThunk(
  'receipts/fetchReceipts',
  async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/receipts', { params });
    return response.data;
  }
);

export const uploadReceipt = createAsyncThunk(
  'receipts/uploadReceipt',
  async ({ image, expenseId }: { image: string; expenseId?: string }) => {
    const formData = new FormData();
    formData.append('receipt', {
      uri: image,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    } as any);
    
    if (expenseId) {
      formData.append('expenseId', expenseId);
    }
    
    const response = await apiClient.post('/receipts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
);

export const processOCR = createAsyncThunk(
  'receipts/processOCR',
  async (receiptId: string) => {
    const response = await apiClient.post(`/receipts/${receiptId}/ocr`);
    return response.data;
  }
);

export const deleteReceipt = createAsyncThunk(
  'receipts/deleteReceipt',
  async (id: string) => {
    await apiClient.delete(`/receipts/${id}`);
    return id;
  }
);

const receiptSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    setReceipts: (state, action: PayloadAction<Receipt[]>) => {
      state.receipts = action.payload;
      state.unprocessedCount = action.payload.filter(r => !r.isProcessed).length;
    },
    addReceiptLocal: (state, action: PayloadAction<Receipt>) => {
      state.receipts.unshift(action.payload);
      if (!action.payload.isProcessed) {
        state.unprocessedCount += 1;
      }
    },
    updateReceiptLocal: (state, action: PayloadAction<Receipt>) => {
      const index = state.receipts.findIndex(receipt => receipt.id === action.payload.id);
      if (index !== -1) {
        const wasUnprocessed = !state.receipts[index].isProcessed;
        const isNowProcessed = action.payload.isProcessed;
        
        state.receipts[index] = action.payload;
        
        if (wasUnprocessed && isNowProcessed) {
          state.unprocessedCount -= 1;
        } else if (!wasUnprocessed && !isNowProcessed) {
          state.unprocessedCount += 1;
        }
      }
    },
    deleteReceiptLocal: (state, action: PayloadAction<string>) => {
      const receipt = state.receipts.find(r => r.id === action.payload);
      if (receipt && !receipt.isProcessed) {
        state.unprocessedCount -= 1;
      }
      state.receipts = state.receipts.filter(receipt => receipt.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedReceipt: (state, action: PayloadAction<Receipt | null>) => {
      state.selectedReceipt = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch receipts
      .addCase(fetchReceipts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.receipts = action.payload.data || action.payload;
        state.unprocessedCount = state.receipts.filter(r => !r.isProcessed).length;
      })
      .addCase(fetchReceipts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch receipts';
      })
      // Upload receipt
      .addCase(uploadReceipt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadReceipt.fulfilled, (state, action) => {
        state.isLoading = false;
        state.receipts.unshift(action.payload);
        if (!action.payload.isProcessed) {
          state.unprocessedCount += 1;
        }
      })
      .addCase(uploadReceipt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to upload receipt';
      })
      // Process OCR
      .addCase(processOCR.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(processOCR.fulfilled, (state, action) => {
        state.isProcessing = false;
        const index = state.receipts.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          const wasUnprocessed = !state.receipts[index].isProcessed;
          state.receipts[index] = action.payload;
          if (wasUnprocessed && action.payload.isProcessed) {
            state.unprocessedCount -= 1;
          }
        }
      })
      .addCase(processOCR.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.error.message || 'Failed to process receipt';
      })
      // Delete receipt
      .addCase(deleteReceipt.fulfilled, (state, action) => {
        const receipt = state.receipts.find(r => r.id === action.payload);
        if (receipt && !receipt.isProcessed) {
          state.unprocessedCount -= 1;
        }
        state.receipts = state.receipts.filter(receipt => receipt.id !== action.payload);
      });
  },
});

export const {
  setReceipts,
  addReceiptLocal,
  updateReceiptLocal,
  deleteReceiptLocal,
  setLoading,
  setProcessing,
  setError,
  setSelectedReceipt,
} = receiptSlice.actions;

export default receiptSlice.reducer;
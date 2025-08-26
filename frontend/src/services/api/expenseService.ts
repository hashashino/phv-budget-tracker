import apiClient from './apiClient';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  location?: string;
  notes?: string;
  receiptId?: string;
  includeGst: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  location?: string;
  notes?: string;
  receiptId?: string;
  includeGst?: boolean;
}

export const expenseService = {
  // Get all user expenses
  async getExpenses(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const response = await apiClient.get('/api/expenses', { params });
    return response.data;
  },

  // Get single expense
  async getExpense(id: string) {
    const response = await apiClient.get(`/api/expenses/${id}`);
    return response.data;
  },

  // Create new expense
  async createExpense(data: CreateExpenseData) {
    const response = await apiClient.post('/api/expenses', data);
    return response.data;
  },

  // Update expense
  async updateExpense(id: string, data: Partial<CreateExpenseData>) {
    const response = await apiClient.put(`/api/expenses/${id}`, data);
    return response.data;
  },

  // Delete expense
  async deleteExpense(id: string) {
    const response = await apiClient.delete(`/api/expenses/${id}`);
    return response.data;
  },

  // Get expense statistics
  async getExpenseStats(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const response = await apiClient.get('/api/expenses/stats', { params });
    return response.data;
  },

  // Get expense categories
  async getExpenseCategories() {
    const response = await apiClient.get('/api/expenses/categories');
    return response.data;
  }
};
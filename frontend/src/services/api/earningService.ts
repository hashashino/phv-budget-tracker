import apiClient from './apiClient';

export interface Earning {
  id: string;
  amount: number;
  grossAmount: number;
  netAmount: number;
  date: string;
  platformId: string;
  platform?: {
    id: string;
    name: string;
  };
  commission?: number;
  incentive?: number;
  tips?: number;
  startTime?: string;
  endTime?: string;
  distance?: number;
  trips?: number;
  workingHours?: number;
  fuelCost?: number;
  vehicleId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEarningData {
  amount: number;
  grossAmount: number;
  netAmount: number;
  date: string;
  platformId: string;
  commission?: number;
  incentive?: number;
  tips?: number;
  startTime?: string;
  endTime?: string;
  distance?: number;
  trips?: number;
  workingHours?: number;
  fuelCost?: number;
  vehicleId?: string;
  notes?: string;
}

export const earningService = {
  // Get all user earnings
  async getEarnings(params?: {
    page?: number;
    limit?: number;
    platformId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const response = await apiClient.get('/api/earnings', { params });
    return response.data;
  },

  // Get single earning
  async getEarning(id: string) {
    const response = await apiClient.get(`/api/earnings/${id}`);
    return response.data;
  },

  // Create new earning
  async createEarning(data: CreateEarningData) {
    const response = await apiClient.post('/api/earnings', data);
    return response.data;
  },

  // Update earning
  async updateEarning(id: string, data: Partial<CreateEarningData>) {
    const response = await apiClient.put(`/api/earnings/${id}`, data);
    return response.data;
  },

  // Delete earning
  async deleteEarning(id: string) {
    const response = await apiClient.delete(`/api/earnings/${id}`);
    return response.data;
  },

  // Get earning statistics
  async getEarningStats(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const response = await apiClient.get('/api/earnings/stats', { params });
    return response.data;
  },

  // Get PHV platforms
  async getPlatforms() {
    const response = await apiClient.get('/api/earnings/platforms');
    return response.data;
  }
};
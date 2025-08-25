import apiClient from './apiClient';
import { User } from '@/types';

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
  };
}

const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<ApiResponse>('/users');
      return response.data.data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
};

export default adminService;

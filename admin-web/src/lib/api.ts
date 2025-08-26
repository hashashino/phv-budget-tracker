const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    console.log('API Request:', { url, config });

    try {
      const response = await fetch(url, config);
      
      console.log('API Response:', { status: response.status, statusText: response.statusText });
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Data:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request<{ success: boolean; data: { token: string; user: any } }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    await this.request('/api/admin/logout', { method: 'POST' });
    this.clearToken();
  }

  // Admin methods
  async getStats() {
    return this.request<{ success: boolean; data: any }>('/api/admin/stats');
  }

  async getUsers(params?: { page?: number; limit?: number; role?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.role) searchParams.set('role', params.role);
    
    const query = searchParams.toString();
    return this.request<{ 
      success: boolean; 
      data: { 
        users: any[]; 
        pagination: any 
      } 
    }>(`/api/admin/users${query ? `?${query}` : ''}`);
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async toggleUserStatus(userId: string, isActive: boolean) {
    return this.request(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
    licenseNumber?: string;
    vehicleNumber?: string;
    phvCompany?: string;
  }) {
    return this.request<{ success: boolean; data: any; message: string }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Expense methods
  async getExpenses(params?: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    
    const query = searchParams.toString();
    return this.request<{ 
      success: boolean; 
      data: { 
        expenses: any[]; 
        pagination: any 
      } 
    }>(`/api/expenses${query ? `?${query}` : ''}`);
  }

  async deleteExpense(expenseId: string) {
    return this.request(`/api/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  }

  async getExpenseStats(params?: { startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    
    const query = searchParams.toString();
    return this.request<{ success: boolean; data: any }>(`/api/expenses/stats${query ? `?${query}` : ''}`);
  }

  // Earnings methods
  async getEarnings(params?: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    
    const query = searchParams.toString();
    return this.request<{ 
      success: boolean; 
      data: { 
        earnings: any[]; 
        pagination: any 
      } 
    }>(`/api/earnings${query ? `?${query}` : ''}`);
  }

  async deleteEarning(earningId: string) {
    return this.request(`/api/earnings/${earningId}`, {
      method: 'DELETE',
    });
  }

  async getEarningStats(params?: { startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    
    const query = searchParams.toString();
    return this.request<{ success: boolean; data: any }>(`/api/earnings/stats${query ? `?${query}` : ''}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
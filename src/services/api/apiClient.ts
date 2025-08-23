import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@constants/index';

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
}

interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request(endpoint: string, config: RequestConfig = {}) {
    const url = `${this.config.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const requestConfig = {
      method: config.method || 'GET',
      headers: { ...headers, ...config.headers },
      ...(config.body && { body: JSON.stringify(config.body) }),
    };

    try {
      const response = await fetch(url, requestConfig);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, { method: 'POST', body: data });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, { method: 'PUT', body: data });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Create and export API client instance
const apiClient = new ApiClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
});

export default apiClient;
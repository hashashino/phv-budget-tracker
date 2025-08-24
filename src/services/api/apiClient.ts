import axios from 'axios';
import { API_BASE_URL } from '@env';
import { Store } from 'redux'; // Import Store type from redux
import { clearAuth } from '@/store/slices/authSlice';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let storeInstance: Store; // Declare a variable to hold the store instance

export const setupInterceptors = (store: Store) => {
  storeInstance = store;

  // Request interceptor to add the auth token
  apiClient.interceptors.request.use(
    (config) => {
      const state = storeInstance.getState() as any; // Cast to any for now
      const token = state.auth.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle 401 errors
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // If 401 Unauthorized, clear auth state and redirect to login
        storeInstance.dispatch(clearAuth());
      }
      return Promise.reject(error);
    }
  );
};

export default apiClient;
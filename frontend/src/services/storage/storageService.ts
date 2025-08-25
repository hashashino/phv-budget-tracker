import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@constants/index';
import { User } from '@types/index';

export interface StorageItem {
  key: string;
  value: any;
  secure?: boolean;
  expiresAt?: Date;
}

class StorageService {
  /**
   * Store data in regular AsyncStorage
   */
  async setItem(key: string, value: any): Promise<void> {
    try {
      const serialized = JSON.stringify({
        data: value,
        timestamp: new Date().toISOString(),
      });
      await AsyncStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to store item ${key}:`, error);
      throw new Error(`Storage operation failed: ${error}`);
    }
  }

  /**
   * Get data from regular AsyncStorage
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const serialized = await AsyncStorage.getItem(key);
      if (!serialized) {
        return null;
      }

      const parsed = JSON.parse(serialized);
      return parsed.data;
    } catch (error) {
      console.error(`Failed to retrieve item ${key}:`, error);
      return null;
    }
  }

  /**
   * Store sensitive data in SecureStore
   */
  async setSecureItem(key: string, value: any): Promise<void> {
    try {
      const serialized = JSON.stringify({
        data: value,
        timestamp: new Date().toISOString(),
      });
      await SecureStore.setItemAsync(key, serialized);
    } catch (error) {
      console.error(`Failed to store secure item ${key}:`, error);
      throw new Error(`Secure storage operation failed: ${error}`);
    }
  }

  /**
   * Get sensitive data from SecureStore
   */
  async getSecureItem<T = any>(key: string): Promise<T | null> {
    try {
      const serialized = await SecureStore.getItemAsync(key);
      if (!serialized) {
        return null;
      }

      const parsed = JSON.parse(serialized);
      return parsed.data;
    } catch (error) {
      console.error(`Failed to retrieve secure item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key: string, secure: boolean = false): Promise<void> {
    try {
      if (secure) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
    }
  }

  /**
   * Store multiple items
   */
  async setMultipleItems(items: StorageItem[]): Promise<void> {
    const operations = items.map(async (item) => {
      if (item.secure) {
        await this.setSecureItem(item.key, item.value);
      } else {
        await this.setItem(item.key, item.value);
      }
    });

    await Promise.all(operations);
  }

  /**
   * Get multiple items
   */
  async getMultipleItems(keys: string[]): Promise<Record<string, any>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};

      pairs.forEach(([key, value]) => {
        if (value) {
          try {
            const parsed = JSON.parse(value);
            result[key] = parsed.data;
          } catch {
            result[key] = value;
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to get multiple items:', error);
      return {};
    }
  }

  /**
   * Clear all storage
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      // Note: SecureStore doesn't have a clear all method
      // We need to remove items individually if needed
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Get storage size info
   */
  async getStorageInfo(): Promise<{
    totalKeys: number;
    estimatedSize: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet(keys);
      
      let estimatedSize = 0;
      pairs.forEach(([, value]) => {
        if (value) {
          estimatedSize += value.length;
        }
      });

      return {
        totalKeys: keys.length,
        estimatedSize: estimatedSize,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { totalKeys: 0, estimatedSize: 0 };
    }
  }

  // User-specific methods
  async storeUserData(user: User): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_DATA, user);
  }

  async getUserData(): Promise<User | null> {
    return this.getItem<User>(STORAGE_KEYS.USER_DATA);
  }

  async storeAuthToken(token: string): Promise<void> {
    await this.setSecureItem(STORAGE_KEYS.USER_TOKEN, token);
  }

  async getAuthToken(): Promise<string | null> {
    return this.getSecureItem<string>(STORAGE_KEYS.USER_TOKEN);
  }

  async clearUserData(): Promise<void> {
    await Promise.all([
      this.removeItem(STORAGE_KEYS.USER_DATA),
      this.removeItem(STORAGE_KEYS.USER_TOKEN, true),
    ]);
  }

  // Settings methods
  async storeAppSettings(settings: any): Promise<void> {
    await this.setItem('app_settings', settings);
  }

  async getAppSettings(): Promise<any> {
    return this.getItem('app_settings');
  }

  // Cache methods with expiration
  async setCacheItem(key: string, value: any, expirationMinutes: number = 60): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    const cacheData = {
      data: value,
      expiresAt: expiresAt.toISOString(),
      timestamp: new Date().toISOString(),
    };

    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
  }

  async getCacheItem<T = any>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) {
        return null;
      }

      const parsed = JSON.parse(cached);
      const expiresAt = new Date(parsed.expiresAt);
      
      if (new Date() > expiresAt) {
        // Cache expired, remove it
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error(`Failed to get cache item ${key}:`, error);
      return null;
    }
  }

  async clearExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      const expiredKeys: string[] = [];
      
      for (const key of cacheKeys) {
        try {
          const cached = await AsyncStorage.getItem(key);
          if (cached) {
            const parsed = JSON.parse(cached);
            const expiresAt = new Date(parsed.expiresAt);
            if (new Date() > expiresAt) {
              expiredKeys.push(key);
            }
          }
        } catch {
          // If we can't parse it, consider it expired
          expiredKeys.push(key);
        }
      }

      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys);
      }
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }
}

export const storageService = new StorageService();
export default StorageService;
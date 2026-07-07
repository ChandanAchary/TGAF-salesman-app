// tokenManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from "@/constants/AppConfig";

let memoryToken: string | null = null;

export const tokenManager = {
  async getToken(): Promise<string | null> {
    if (memoryToken !== null) return memoryToken;

    const stored = await AsyncStorage.getItem(AppConfig.AUTH_TOKEN_NAME);
    const parsed = stored ? JSON.parse(stored) : null;
    memoryToken = parsed?.token || null;
    return memoryToken;
  },

  async setToken(token: string) {
    memoryToken = token;
    await AsyncStorage.setItem(AppConfig.AUTH_TOKEN_NAME, JSON.stringify({ token }));
  },

  async clearToken() {
    memoryToken = null;
    await AsyncStorage.removeItem(AppConfig.AUTH_TOKEN_NAME);
  },

  async getRefreshToken(): Promise<string | null> {
    const stored = await AsyncStorage.getItem(AppConfig.AUTH_REFRESH_TOKEN_NAME);
    const parsed = stored ? JSON.parse(stored) : null;
    return parsed?.token || null;
  },

  async setRefreshToken(token: string) {
    await AsyncStorage.setItem(AppConfig.AUTH_REFRESH_TOKEN_NAME, JSON.stringify({ token }));
  },

  async clearRefreshToken() {
    await AsyncStorage.removeItem(AppConfig.AUTH_REFRESH_TOKEN_NAME);
  },
};

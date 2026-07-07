// storageManager.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

type Primitive = string | number | boolean | null;
type StorageValue = Primitive | Record<string, unknown> | Array<unknown>;

class StorageManager {
  private memoryCache = new Map<string, StorageValue>();

  async get<T extends StorageValue = StorageValue>(key: string): Promise<T | null> {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key) as T;
    }

    const stored = await AsyncStorage.getItem(key);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored) as T;
      this.memoryCache.set(key, parsed);
      return parsed;
    } catch (e) {
      console.error(`Error parsing value for key "${key}":`, e);
      return null;
    }
  }

  async set<T extends StorageValue = StorageValue>(key: string, value: T): Promise<void> {
    this.memoryCache.set(key, value);
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    await AsyncStorage.clear();
  }

  hasInMemory(key: string): boolean {
    return this.memoryCache.has(key);
  }

  getFromMemory<T extends StorageValue = StorageValue>(key: string): T | null {
    return this.memoryCache.get(key) as T | null;
  }
}

export const storageManager = new StorageManager();



// Usage example:
// type UserProfile = { name: string; age: number };

// await storageManager.set<UserProfile>("user", { name: "Amitanshu", age: 24 });

// const profile = await storageManager.get<UserProfile>("user");
// if (profile) console.log(profile.name); // ✅ "Amitanshu"

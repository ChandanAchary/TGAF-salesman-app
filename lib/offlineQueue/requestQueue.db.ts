type QueuedRequest = {
  id: number;
  method: string;
  url: string;
  body: string;
  headers: string;
  created_at: number;
};

let memoryQueue: QueuedRequest[] = [];
let nextId = 1;

export const db = {
  async runAsync(query: string, params: any[] = []): Promise<void> {
    if (query.startsWith("INSERT INTO")) {
      const [method, url, body, headers, created_at] = params;
      memoryQueue.push({
        id: nextId++,
        method,
        url,
        body,
        headers,
        created_at,
      });
    } else if (query.startsWith("DELETE FROM")) {
      const [id] = params;
      memoryQueue = memoryQueue.filter((r) => r.id !== id);
    }
  },

  async getAllAsync<T>(query: string): Promise<T[]> {
    return memoryQueue as unknown as T[];
  },
};

export const initQueueDB = () => {
  // No-op for in-memory queue fallback
};

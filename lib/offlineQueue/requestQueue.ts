import { db } from "./requestQueue.db";
import { AxiosInstance } from "axios";

export const queueRequest = async (
  method: string,
  url: string,
  body: any,
  headers: Record<string, string>
) => {
  await db.runAsync(
    `INSERT INTO requests (method, url, body, headers, created_at) VALUES (?, ?, ?, ?, ?);`,
    [method, url, JSON.stringify(body), JSON.stringify(headers), Date.now()]
  );
};

type QueuedRequest = {
  id: number;
  method: string;
  url: string;
  body: string;
  headers: string;
  created_at: number;
};

export const flushOfflineRequestQueue = async (axiosInstance: AxiosInstance) => {
  const result = await db.getAllAsync<QueuedRequest>(`SELECT * FROM requests;`);

  for (const req of result) {
    try {
      const res = await axiosInstance.request({
        method: req.method,
        url: req.url,
        data: JSON.parse(req.body),
        headers: JSON.parse(req.headers),
      });

      if (res.status >= 200 && res.status < 300) {
        await db.runAsync(`DELETE FROM requests WHERE id = ?;`, [req.id]);
      }
    } catch (err: any) {
      console.warn(`Failed to replay queued request to ${req.url}`, err.message);
    }
  }
};

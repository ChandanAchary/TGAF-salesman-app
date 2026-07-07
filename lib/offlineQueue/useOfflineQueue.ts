import { useEffect } from "react";
import * as Network from "expo-network";
import { AxiosInstance } from "axios";
import { queueRequest, flushOfflineRequestQueue } from "./requestQueue";
import { initQueueDB } from "./requestQueue.db";

export const useOfflineQueue = (axiosInstance: AxiosInstance) => {
  useEffect(() => {
    initQueueDB();

    const replayIfOnline = async () => {
      const net = await Network.getNetworkStateAsync();
      if (net.isConnected) {
        await flushOfflineRequestQueue(axiosInstance);
      }
    };

    // First check
    replayIfOnline();

    // Subscribe to network events
    const sub = Network.addNetworkStateListener((state) => {
      if (state.isConnected) {
        flushOfflineRequestQueue(axiosInstance);
      }
    });

    return () => sub.remove();
  }, [axiosInstance]);

  const safeRequest = async (
    url: string,
    data?: any,
    headers: Record<string, string> = {}
  ) => {
    const method = 'POST';
    try {
      const res = await axiosInstance.request({ method, url, data, headers });
      return res;
    } catch (err: any) {
      if (err.message?.includes("Network")) {
        console.log("Offline – queuing request");
        await queueRequest(method, url, data, headers);
      } else {
        throw err;
      }
    }
  };

  return { safeRequest };
};

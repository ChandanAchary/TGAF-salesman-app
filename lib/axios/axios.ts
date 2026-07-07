// axios.ts
import axios from "axios";
import { tokenManager } from "./tokenManager";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { User } from "../user/util";
import { LoginRefreshSalesmanParams } from "@/shared/zod";
import { Response } from "../types/types";

export const api = axios.create({
  withCredentials: true,
  headers: { 'Accept': 'application/json', 'User-Agent': 'ExpoApp/1.0' },
});

const plainAxios = axios.create();

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await tokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;


interface RefreshResponse extends Response {
  data: {
    token: string;
    refresh: string;
  }
}

async function refreshAuthToken(data: LoginRefreshSalesmanParams) {
  const res = await plainAxios.post<RefreshResponse>(API_ROUTES.AUTH.REFRESH, data);
  return res.data;
}

async function setAuthToken() {
  try {
    // get salesman details
    const salesman = await User.getUserDetails()
    // get refresh token
    const refreshtoken = await tokenManager.getRefreshToken();
    if (!salesman || !refreshtoken) {
      // Expected when logged out — use log(), not error(), so it doesn't
      // trigger the red dev overlay.
      console.log("Auth tokens missing; skipping refresh.");
      // Perform logout action
      await tokenManager.clearToken();
      await tokenManager.clearRefreshToken();
      return;
    }

    // post to refresh token endpoint
    const data = await refreshAuthToken({
      id: salesman.id,
      phone: salesman.phone,
      refreshToken: refreshtoken,
    });

    if (!data || !data.data || !data.data.token || !data.data.refresh) {
      await tokenManager.clearToken();
      await tokenManager.clearRefreshToken();
      return;
    }


    // set new access token
    await tokenManager.setToken(data.data.token);
    // set new refresh token
    await tokenManager.setRefreshToken(data.data.refresh);

  } catch (error) {
    console.error('Error setting auth token:', error);
  }
}

// Handle 401 Unauthorized errors globally
api.interceptors.response.use(undefined, async (error) => {
  const originalRequest = error.config;

  // Only attempt a token refresh for genuine "session expired" 401s:
  //  - not the login/refresh endpoints (their 401s are the caller's concern)
  //  - only when a refresh token actually exists (i.e. the user IS logged in)
  // Otherwise a logged-out 401 would spam errors and force a pointless logout.
  const isAuthEndpoint =
    originalRequest?.url?.includes("/refresh") ||
    originalRequest?.url?.includes("/login");

  if (
    error.response?.status === 401 &&
    !originalRequest._retry &&
    !isAuthEndpoint
  ) {
    const hasRefreshToken = await tokenManager.getRefreshToken();
    if (!hasRefreshToken) {
      return Promise.reject(error); // logged out — let the caller handle it
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = setAuthToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    await refreshPromise;
    originalRequest.headers.Authorization = `Bearer ${await tokenManager.getToken()}`;
    return api(originalRequest);
  }

  return Promise.reject(error);
});

import axios, { AxiosError } from "axios";
import {
  getToken,
  getRefreshToken,
  saveAuthData,
  getAuthData,
  clearAuthData,
  decodeTokenExpiry,
  type AuthData,
} from "@/lib/auth-storage";

const apiAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_AUTH_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

apiAuth.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiAuth.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as any; /* eslint-disable-line @typescript-eslint/no-explicit-any */

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshTokenValue = getRefreshToken();
        if (!refreshTokenValue) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_AUTH_URL || "http://localhost:8000"}/api/auth/refresh`,
          {
            refresh_token: refreshTokenValue,
          },
        );

        if (response.data.success && response.data.data) {
          const currentAuthData = getAuthData();
          if (currentAuthData) {
            const newExpiresAt = decodeTokenExpiry(
              response.data.data.access_token,
            );
            const updatedAuthData: AuthData = {
              ...currentAuthData,
              token: response.data.data.access_token,
              refreshToken: response.data.data.refresh_token,
              expiresAt: newExpiresAt || undefined,
            };
            saveAuthData(updatedAuthData);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.data.access_token}`;
          }
          return apiAuth(originalRequest);
        }
      } catch (refreshError) {
        clearAuthData();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiAuth;

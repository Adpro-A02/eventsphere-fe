import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TokenPair,
  UpdateProfileRequest,
  UserResponse,
} from "@/lib/types";
import {
  saveAuthData,
  clearAuthData,
  decodeTokenExpiry,
  type AuthData,
} from "@/lib/auth-storage";
import apiAuth from "@/libs/axios/apiAuth";
import { AxiosResponse } from "axios";

function handleApiResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
  const { data } = response;

  if (!data.success) {
    throw new Error(data.message || "An error occurred");
  }

  if (!data.data) {
    throw new Error("No data received");
  }

  return data.data;
}

// Save auth response to storage
function saveAuthResponse(authResponse: AuthResponse): void {
  const expiresAt = decodeTokenExpiry(authResponse.token);

  const authData: AuthData = {
    token: authResponse.token,
    refreshToken: authResponse.refresh_token,
    user: {
      id: authResponse.user_id,
      name: authResponse.name,
      email: authResponse.email,
      role: authResponse.role,
    },
    expiresAt: expiresAt || undefined,
  };

  saveAuthData(authData);
}

// Register a new user
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiAuth.post<ApiResponse<AuthResponse>>(
    "/api/auth/register",
    data,
  );
  const authResponse = handleApiResponse(response);
  saveAuthResponse(authResponse);
  return authResponse;
}

// Login user
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiAuth.post<ApiResponse<AuthResponse>>(
    "/api/auth/login",
    data,
  );
  const authResponse = handleApiResponse(response);
  saveAuthResponse(authResponse);
  return authResponse;
}

// Get current user profile
export async function getCurrentUser(): Promise<UserResponse> {
  const response = await apiAuth.get<ApiResponse<UserResponse>>("/api/auth/me");
  return handleApiResponse(response);
}

// Get user by ID
export async function getUserById(userId: string): Promise<UserResponse> {
  const response = await apiAuth.get<ApiResponse<UserResponse>>(
    `/api/auth/user/${userId}`,
  );
  return handleApiResponse(response);
}

// Update user profile
export async function updateProfile(
  userId: string,
  data: UpdateProfileRequest,
): Promise<UserResponse> {
  const response = await apiAuth.put<ApiResponse<UserResponse>>(
    `/api/auth/profile/${userId}`,
    data,
  );
  return handleApiResponse(response);
}

// Refresh access token
export async function refreshToken(): Promise<TokenPair> {
  if (typeof window === "undefined") {
    throw new Error("Cannot refresh token during server-side rendering");
  }

  const { getRefreshToken, getAuthData, saveAuthData } = await import(
    "@/lib/auth-storage"
  );
  const refreshTokenValue = getRefreshToken();

  if (!refreshTokenValue) {
    throw new Error("No refresh token available");
  }

  const response = await apiAuth.post<ApiResponse<TokenPair>>(
    "/api/auth/refresh",
    {
      refresh_token: refreshTokenValue,
    },
  );

  const tokenPair = handleApiResponse(response);

  const currentAuthData = getAuthData();
  if (currentAuthData) {
    const newExpiresAt = decodeTokenExpiry(tokenPair.access_token);
    const updatedAuthData: AuthData = {
      ...currentAuthData,
      token: tokenPair.access_token,
      refreshToken: tokenPair.refresh_token,
      expiresAt: newExpiresAt || undefined,
    };
    saveAuthData(updatedAuthData);
  }

  return tokenPair;
}

// Logout user (client-side only)
export function logout(): void {
  clearAuthData();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

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
  getAuthData,
  clearAuthData,
  getToken,
  getRefreshToken,
  decodeTokenExpiry,
  type AuthData,
} from "@/lib/auth-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }

  return data as ApiResponse<T>;
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
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await handleResponse<AuthResponse>(response);

  if (result.success && result.data) {
    saveAuthResponse(result.data);
    return result.data;
  }

  throw new Error(result.message);
}

// Login user
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await handleResponse<AuthResponse>(response);

  if (result.success && result.data) {
    saveAuthResponse(result.data);
    return result.data;
  }

  throw new Error(result.message);
}

// Get current user profile
export async function getCurrentUser(): Promise<UserResponse> {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await handleResponse<UserResponse>(response);

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.message);
}

// Get user by ID
export async function getUserById(userId: string): Promise<UserResponse> {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await handleResponse<UserResponse>(response);

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.message);
}

// Update user profile
export async function updateProfile(
  userId: string,
  data: UpdateProfileRequest,
): Promise<UserResponse> {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/profile/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await handleResponse<UserResponse>(response);

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.message);
}

// Refresh access token
export async function refreshToken(): Promise<TokenPair> {
  if (typeof window === "undefined") {
    throw new Error("Cannot refresh token during server-side rendering");
  }

  const refreshTokenValue = getRefreshToken();

  if (!refreshTokenValue) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshTokenValue }),
  });

  const result = await handleResponse<TokenPair>(response);

  if (result.success && result.data) {
    // Update stored auth data with new tokens
    const currentAuthData = getAuthData();
    if (currentAuthData) {
      const newExpiresAt = decodeTokenExpiry(result.data.access_token);
      const updatedAuthData: AuthData = {
        ...currentAuthData,
        token: result.data.access_token,
        refreshToken: result.data.refresh_token,
        expiresAt: newExpiresAt || undefined,
      };
      saveAuthData(updatedAuthData);
    }

    return result.data;
  }

  throw new Error(result.message);
}

// Logout user (client-side only)
export function logout(): void {
  clearAuthData();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

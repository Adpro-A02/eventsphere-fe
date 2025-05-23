import { z } from "zod";

// User role enum to match backend
export enum UserRole {
  Admin = "Admin",
  Organizer = "Organizer",
  Attendee = "Attendee",
}

// API response schema
export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data?: T;
}

// Auth response from backend
export interface AuthResponse {
  token: string;
  refresh_token: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
}

// User profile response
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

// Token pair from refresh
export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

// Validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(UserRole).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Please enter a valid email").optional(),
  })
  .refine((data) => data.name || data.email, {
    message: "At least one field must be provided",
    path: ["name"],
  });

export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

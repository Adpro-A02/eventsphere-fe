import { z } from "zod";

// User role enum to match backend - tambah Guest
export enum UserRole {
  Admin = "Admin",
  Organizer = "Organizer",
  Attendee = "Attendee",
  Guest = "Guest", // Role untuk user yang tidak login
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

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  basePrice: number;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  event_date: string;
  user_id: string;

  organizer_name?: string;
  capacity?: number;
  registered_count?: number;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  time?: string;
  date?: string;
}

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function isUserRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

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

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  event_date: z.union([z.string(), z.date()]).transform((val) => {
    const date = typeof val === "string" ? new Date(val) : val;
    return date.toISOString().slice(0, 19);
  }),
  basePrice: z
    .number({ invalid_type_error: "Base price must be a number" })
    .nonnegative("Base price cannot be negative")
    .optional(),
});

export interface AddFundsRequest {
  user_id: string;
  amount: number;
  payment_method: string;
}

export interface WithdrawFundsRequest {
  user_id: string;
  amount: number;
  description: string;
}

export interface BalanceResponse {
  id: string;
  user_id: string;
  amount: number;
  updated_at: string;
}

export const addFundsSchema = z.object({
  user_id: z.string().uuid("Please provide a valid user ID"),
  amount: z.number().positive("Amount must be positive"),
  payment_method: z.string().min(1, "Payment method is required"),
});

export const withdrawFundsSchema = z.object({
  user_id: z.string().uuid("Please provide a valid user ID"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
});

export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
export type EventRequest = z.infer<typeof eventSchema>;
export type AddFundsRequestValidated = z.infer<typeof addFundsSchema>;
export type WithdrawFundsRequestValidated = z.infer<typeof withdrawFundsSchema>;

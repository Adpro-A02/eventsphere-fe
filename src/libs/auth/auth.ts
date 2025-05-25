import { getAuthData, clearAuthData } from "@/lib/auth-storage";

// Check if the current user has admin role
export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;

  const authData = getAuthData();
  return authData?.user?.role === "Admin";
}

// Handle user logout
export function handleLogout(): void {
  clearAuthData();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

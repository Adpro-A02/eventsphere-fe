"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { UserResponse, UserRole } from "@/lib/types";
import { getCurrentUser, refreshToken } from "@/lib/api";
import { getAuthData, clearAuthData } from "@/lib/auth-storage";

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  userRole: UserRole;
  setUser: (user: UserResponse | null) => void;
  refreshUserData: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isOrganizer: () => boolean;
  isAttendee: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isAuthenticated = !!user;
  const isGuest = !isAuthenticated;
  const userRole = user?.role || ("Guest" as UserRole);

  // Role checking functions
  const hasRole = (role: string): boolean => {
    if (isGuest) return role === "Guest";
    return userRole === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (isGuest) return roles.includes("Guest");
    return userRole ? roles.includes(userRole) : false;
  };

  const isAdmin = (): boolean => hasRole("Admin");
  const isOrganizer = (): boolean => hasRole("Organizer");
  const isAttendee = (): boolean => hasRole("Attendee");

  const refreshUserData = async () => {
    if (!mounted) return;

    try {
      const userData = await getCurrentUser();
      setUser(userData);

      // Update stored auth data with latest user info
      const authData = getAuthData();
      if (authData) {
        authData.user = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        };
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      // Try to refresh the token if the error might be due to expired token
      try {
        await refreshToken();
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        clearAuthData();
        setUser(null);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const initAuth = async () => {
      setIsLoading(true);

      // Check if we have stored auth data
      const authData = getAuthData();

      if (authData) {
        setUser({
          id: authData.user.id,
          name: authData.user.name,
          email: authData.user.email,
          role: authData.user
            .role as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Then refresh from server to get latest data
        try {
          await refreshUserData();
        } catch (error) {
          console.error("Authentication failed:", error);
          clearAuthData();
          setUser(null);
        }
      }
      // If no auth data, user remains null (guest mode)

      setIsLoading(false);
    };

    initAuth();
  }, [mounted]);

  // Create a safe version of the context that doesn't cause hydration mismatches
  const safeContext: AuthContextType = {
    user: mounted ? user : null,
    isLoading: mounted ? isLoading : true,
    isAuthenticated: mounted ? isAuthenticated : false,
    isGuest: mounted ? isGuest : true,
    userRole: mounted ? userRole : ("Guest" as UserRole),
    setUser,
    refreshUserData,
    hasRole,
    hasAnyRole,
    isAdmin,
    isOrganizer,
    isAttendee,
  };

  return (
    <AuthContext.Provider value={safeContext}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

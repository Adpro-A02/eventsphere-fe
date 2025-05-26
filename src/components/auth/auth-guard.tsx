"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/types";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  allowedRoles,
  redirectTo = "/login",
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Skip during initial loading
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(`${redirectTo}?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // If roles are specified, check if user has required role
    if (allowedRoles && allowedRoles.length > 0 && user) {
      if (!allowedRoles.includes(user.role)) {
        router.push("/unauthorized");
      }
    }
  }, [
    mounted,
    isLoading,
    isAuthenticated,
    user,
    router,
    pathname,
    allowedRoles,
    redirectTo,
  ]);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated or doesn't have required role, don't render children
  if (
    !isAuthenticated ||
    (allowedRoles &&
      allowedRoles.length > 0 &&
      user &&
      !allowedRoles.includes(user.role))
  ) {
    return null;
  }

  return <>{children}</>;
}

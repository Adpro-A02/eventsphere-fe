"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user has admin role
      if (user.role !== "Admin") {
        // Redirect non-admin users to unauthorized page
        router.push("/unathorized");
        return;
      }
    }
  }, [isAuthenticated, user, router]);

  // Show loading while checking authentication
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">
            Checking authentication status
          </p>
        </div>
      </div>
    );
  }

  // Show unauthorized if not admin
  if (user.role !== "Admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have permission to access this page
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="py-12 w-full min-h-screen px-4 sm:px-8 lg:px-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users and system administration
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}

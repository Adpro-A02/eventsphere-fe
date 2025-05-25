"use client";

import { useAuth } from "@/lib/auth-context";
import { logout } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AuthGuard from "@/components/auth/auth-guard";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <AuthGuard>
      <div className="container max-w-6xl py-12">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Button variant="outline" asChild>
              <Link href="/profile">Profile</Link>
            </Button>
            <Button asChild>
              <Link href="/event">Lihat Event</Link>
            </Button>

            {/* Tombol untuk Admin */}
            {user?.role === "Admin" && (
              <Button asChild variant="destructive">
                <Link href="/review/flagged">Flagged Reviews</Link>
              </Button>
            )}

            {/* Tombol untuk Organizer, pastikan user.eventId ada */}
          {user?.role === "Organizer" && (
        <Button asChild variant="secondary">
          <Link href="/review/organizer">Manage My Event Reviews</Link>
        </Button>
      )}

            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Role:</span>
                  <span>{user?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Member since:</span>
                  <span>
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Last login:</span>
                  <span>
                    {user?.last_login
                      ? new Date(user.last_login).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional dashboard cards can be added here */}
        </div>
      </div>
    </AuthGuard>
  );
}

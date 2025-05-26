"use client";

import { useAuth } from "@/lib/auth-context";
import { logout } from "@/lib/api/api-auth";
import { getUserBalance } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AuthGuard from "@/components/auth/auth-guard";
import TopUpModal from "@/components/cores/top-up-modal";
import WithdrawModal from "@/components/cores/withdraw-modal";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const { user } = useAuth();

  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    error: balanceError,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ["userBalance", user?.id],
    queryFn: async () => {
      const balance = await getUserBalance(user!.id);
      return balance;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <AuthGuard>
      <div className="py-12 w-full min-h-screen px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center max-md:gap-4 mb-8">
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
          <Card className="h-max w-full">
            <CardHeader>
              <CardTitle>Account Balance</CardTitle>
              <CardDescription>Your current wallet balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Balance:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {isLoadingBalance ? (
                      <span className="text-muted-foreground">Loading...</span>
                    ) : balanceError ? (
                      <span className="text-red-500 text-sm">
                        Error loading balance
                      </span>
                    ) : (
                      `$${balanceData?.amount?.toLocaleString() || "0"}`
                    )}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <TopUpModal />
                  <WithdrawModal currentBalance={balanceData?.amount || 0} />
                </div>
                {balanceError && (
                  <div className="space-y-1">
                    <p className="text-sm text-red-500">
                      {balanceError instanceof Error
                        ? balanceError.message
                        : "Failed to load balance"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchBalance()}
                      className="w-full"
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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

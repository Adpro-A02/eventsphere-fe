"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EventDetailErrorProps {
  error: string | null;
  eventId: string;
}

export default function EventDetailError({
  error,
  eventId,
}: EventDetailErrorProps) {
  const router = useRouter();
  const { isGuest } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link
          href="/event"
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
      </div>
      <Card className="max-w-3xl mx-auto text-center py-10">
        <CardContent>
          <p className="text-red-500 mb-4">{error || "Event not found"}</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => router.push("/event")}>
              Return to Events
            </Button>
            {isGuest && (
              <Button
                onClick={() =>
                  router.push(
                    `/login?returnUrl=${encodeURIComponent(`/event/${eventId}`)}`,
                  )
                }
              >
                Login to Access More Events
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditEventForm } from "@/components/event/edit-event-form";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthError } from "@/components/auth-error";
import { useAuth } from "@/lib/auth-context";
import { getEventById } from "@/lib/event-api";
import type { Event } from "@/lib/types";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const { user, isAuthenticated, isAdmin } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(eventId);
        setEvent(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error fetching event details. Please try again later.",
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const canEditEvent = () => {
    if (!isAuthenticated || !user || !event) return false;

    // Admin can edit any event
    if (isAdmin()) return true;

    return user.id === event.user_id;
  };

  const userCanEditEvent = canEditEvent();
  const errorMessage = !isAuthenticated
    ? "You need to be logged in to edit events."
    : "You can only edit events that you created.";

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link
          href={`/event/${eventId}`}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Event Details
        </Link>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>Update the details of your event</CardDescription>
        </CardHeader>
        <CardContent>
          {!userCanEditEvent ? (
            <AuthError message={errorMessage} />
          ) : loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="flex justify-end gap-4 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : event ? (
            <EditEventForm initialData={event} />
          ) : (
            <div className="text-center py-6">
              <p className="text-red-500 mb-4">Event not found</p>
              <Link href="/event">
                <Button variant="outline">Return to Events</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

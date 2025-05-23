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
import { EventForm } from "@/components/event-form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Event,
  type EventApiResponse,
  mapApiResponseToEvent,
} from "@/types/event";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/api/events/${eventId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch event details");
        }

        const data = (await response.json()) as EventApiResponse;
        // Map API response to frontend format
        const mappedEvent = mapApiResponseToEvent(data);
        setEvent(mappedEvent);
      } catch (err) {
        setError("Error fetching event details. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

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
          {loading ? (
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
            <EventForm
              initialData={{
                id: event.id,
                title: event.title,
                description: event.description,
                event_date: event.eventDate ?? "",

                location: event.location,
                basePrice: event.basePrice,
              }}
              isEditing={true}
            />
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

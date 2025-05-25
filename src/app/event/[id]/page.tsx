"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getEventById } from "@/lib/event-api";

import type { Event } from "@/lib/types";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  EditIcon,
  TrashIcon,
  TagIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { StatusBadge } from "@/components/status-badge";
import { EventActions } from "@/components/event-actions";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    user,
    hasRole,
    isAuthenticated,
    isGuest,
    isLoading: authLoading,
  } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const eventId = params.id as string;

  const isOrganizer =
    user && event && (user.id === event.user_id || hasRole("Admin"));

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching event:", {
          eventId,
          isGuest,
          authLoading,
          user: user?.id,
        });

        const eventData = await getEventById(eventId);

        console.log("Event fetched:", {
          eventId: eventData.id,
          status: eventData.status,
          userId: eventData.user_id,
          isGuest,
          UserId: user?.id,
        });

        if (isGuest && eventData.status !== "PUBLISHED") {
          console.log("Guest trying to access non-published event");
          setError("This event is not available for public viewing");
          return;
        }

        if (isAuthenticated && !isGuest && eventData.status === "DRAFT") {
          const userIsOrganizer =
            user && (user.id === eventData.user_id || hasRole("Admin"));
          if (!userIsOrganizer) {
            console.log("Non-organizer trying to access draft event");
            setError("This event is not available");
            return;
          }
        }

        setEvent(eventData);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    if (eventId && !authLoading) {
      fetchEvent();
    }
  }, [eventId, authLoading, isGuest, isAuthenticated, user, hasRole]);

  const handleDeleteEvent = async () => {
    if (!event) return;

    setIsActionLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8081/api/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully.",
      });

      router.push("/event");
    } catch (err) {
      console.error("Error deleting event:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to delete event. Please try again.",
        variant: "destructive",
      });
      setIsActionLoading(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null || price === 0) return "Free";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link
            href="/events"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </div>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link
            href="/events"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </div>
        <Card className="max-w-3xl mx-auto text-center py-10">
          <CardContent>
            <p className="text-red-500 mb-4">{error || "Event not found"}</p>
            <Button variant="outline" onClick={() => router.push("/events")}>
              Return to Events
            </Button>
            {isGuest && (
              <div className="mt-4">
                <Button
                  onClick={() =>
                    router.push(
                      `/login?returnUrl=${encodeURIComponent(`/event/${eventId}`)}`,
                    )
                  }
                >
                  Login to Access More Events
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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

      <Card className="max-w-3xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            <StatusBadge status={event.status} className="mt-2" />
          </div>

          {/* Organizer Actions - hanya tampil untuk organizer */}
          {isOrganizer && !isGuest && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/event/edit/${event.id}`)}
              >
                <EditIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the event.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteEvent}
                      disabled={isActionLoading}
                    >
                      {isActionLoading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {event.description && (
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-700">{event.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <CalendarIcon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Date</h4>
                <p>{format(new Date(event.event_date), "PPP")}</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPinIcon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Location</h4>
                <p>{event.location}</p>
              </div>
            </div>

            <div className="flex items-start">
              <TagIcon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Price</h4>
                <p>{formatPrice(event.basePrice)}</p>
              </div>
            </div>

            <div className="flex items-start">
              <UserIcon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Organizer</h4>
                <p className="truncate max-w-[200px]">
                  {event.user_id || "Unknown Organizer"}
                </p>
              </div>
            </div>
          </div>

          {!isOrganizer && event.status === "PUBLISHED" && (
            <div className="border-t pt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  Register Become Atendee
                </h3>
                <p className="text-gray-600 mb-4">
                  {event.capacity && event.registered_count !== undefined
                    ? `${event.capacity - event.registered_count} spots remaining`
                    : "Registration available"}
                </p>

                {isAuthenticated && !isGuest ? (
                  <Button
                    variant="outline"
                    onClick={() => router.push("/register")}
                  >
                    Sign Up
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Please login to register for this event
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/register")}
                      >
                        Sign Up
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 justify-end">
          {/* EventActions hanya untuk organizer */}
          {isOrganizer && !isGuest && (
            <EventActions eventId={event.id} status={event.status} />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

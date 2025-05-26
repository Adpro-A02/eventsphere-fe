"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { deleteEvent } from "@/lib/event-api";

interface EventDetailOrganizerProps {
  event: Event;
  onEventUpdate: (event: Event) => void;
}

export default function EventDetailOrganizer({
  event,
}: EventDetailOrganizerProps) {
  const router = useRouter();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleDeleteEvent = async () => {
    setIsActionLoading(true);

    try {
      await deleteEvent(event.id);

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
    } finally {
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
            <p className="text-sm text-muted-foreground mt-1">
              You are the organizer of this event
            </p>
          </div>

          {/* Organizer Controls */}
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
                  {event.organizer_name || "You"}
                </p>
              </div>
            </div>
          </div>

          {/* Kalo ada yang kelebihan kurangin */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Quota</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/event/${event.id}/attendees`)}
              >
                View Attendees
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/event/${event.id}/analytics`)}
              >
                Analytics
              </Button>
              <Button variant="outline">Export Data</Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 justify-end">
          <EventActions eventId={event.id} status={event.status} />
        </CardFooter>
      </Card>
    </div>
  );
}

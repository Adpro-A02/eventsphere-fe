"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getAllEvents } from "@/lib/event-api";
import Link from "next/link";
import {
  CalendarIcon,
  MapPinIcon,
  PlusCircleIcon,
  TagIcon,
} from "lucide-react";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event } from "@/lib/types";

export default function EventsPage() {
  const { hasRole, isGuest } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreateEvents = hasRole("Organizer");

  const sortEventsByStatus = (events: Event[]) => {
    const statusPriority = {
      PUBLISHED: 1,
      DRAFT: 2,
      CANCELLED: 3,
      COMPLETED: 4,
    };

    return events.sort((a, b) => {
      const priorityA =
        statusPriority[a.status as keyof typeof statusPriority] || 4;
      const priorityB =
        statusPriority[b.status as keyof typeof statusPriority] || 4;

      if (priorityA === priorityB) {
        return (
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
        );
      }

      return priorityA - priorityB;
    });
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        let data: Event[];

        if (isGuest) {
          data = await getAllEvents();
        } else if (hasRole("Admin") || hasRole("Organizer")) {
          data = await getAllEvents();
        } else {
          data = await getAllEvents();
        }

        const sortedEvents = sortEventsByStatus(data);
        setEvents(sortedEvents);
      } catch (err) {
        setError("Error fetching events. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [isGuest, hasRole]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500";
      case "DRAFT":
      case "CREATED":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500";
      case "COMPLETED":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  function formatPrice(basePrice: number): React.ReactNode {
    if (basePrice === 0) return "Free";
    return basePrice.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            {isGuest
              ? "Discover upcoming events"
              : canCreateEvents
                ? "Manage and discover events"
                : "Discover events to attend"}
          </p>
        </div>

        {canCreateEvents && !isGuest && (
          <Link href="/event/create">
            <Button>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No events found</p>
          {canCreateEvents && !isGuest ? (
            <Link href="/event/create">
              <Button>Create Your First Event</Button>
            </Link>
          ) : isGuest ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Want to create events?
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Contact an organizer to create events
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link href={`/event/${event.id}`} key={event.id}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-1">
                      {event.title}
                    </CardTitle>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center mt-2">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {format(
                      parseISO(event.event_date),
                      "MMMM d, yyyy 'at' h:mm a",
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {event.description || "No description provided"}
                  </p>
                  <div className="flex items-center mt-4 text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <TagIcon className="h-4 w-4 mr-1" />
                    <span>{formatPrice(event.basePrice)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {isGuest && events.some((event) => event.status === "PUBLISHED") && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-800">
                Ready to join events?
              </h3>
              <p className="text-sm text-blue-600">
                Login or sign up to purchase tickets and register for events
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

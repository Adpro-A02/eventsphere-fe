"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getEventById } from "@/lib/event-api";
import type { Event } from "@/lib/types";

import EventDetailOrganizer from "@/components/event/event-detail-organizer";
import EventDetailViewer from "@/components/event/event-detail-viewer";
import EventDetailLoading from "@/components/event/event-detail-loading";
import EventDetailError from "@/components/event/event-detail-error";
import EventDetailLoginRequired from "@/components/event/event-detail-login-required";

export default function EventDetailPage() {
  const params = useParams();
  const {
    user,
    hasRole,
    isAuthenticated,
    isGuest,
    isLoading: authLoading,
  } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventId = params.id as string;

  const isOrganizer =
    user && event && (user.id === event.user_id || hasRole("Admin"));

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const eventData = await getEventById(eventId);

        if (isGuest && eventData.status === "PUBLISHED") {
          setEvent(eventData);
          return;
        }

        if (isGuest && eventData.status !== "PUBLISHED") {
          setError("This event is not available for public viewing");
          return;
        }

        if (isAuthenticated && !isGuest && eventData.status === "DRAFT") {
          const userIsOrganizer =
            user && (user.id === eventData.user_id || hasRole("Admin"));
          if (!userIsOrganizer) {
            setError("This event is not available");
            return;
          }
        }

        setEvent(eventData);
      } catch (err) {
        setError("Error fetching event details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId && !authLoading) {
      fetchEvent();
    }
  }, [eventId, authLoading, isGuest, isAuthenticated, user, hasRole]);

  if (authLoading || isLoading) {
    return <EventDetailLoading />;
  }

  if (error || !event) {
    return <EventDetailError error={error} eventId={eventId} />;
  }

  if (isGuest && event.status === "PUBLISHED") {
    return <EventDetailLoginRequired event={event} eventId={eventId} />;
  }

  if (isOrganizer && !isGuest) {
    return <EventDetailOrganizer event={event} onEventUpdate={setEvent} />;
  }

  return (
    <EventDetailViewer
      event={event}
      eventId={eventId}
      onEventUpdate={setEvent}
    />
  );
}

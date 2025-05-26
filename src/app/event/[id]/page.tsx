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

  // Check if current user is the organizer of this event
  const isOrganizer =
    user && event && (user.id === event.user_id || hasRole("Admin"));

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const eventData = await getEventById(eventId);

        // Jika user adalah guest dan event adalah PUBLISHED, require login
        if (isGuest && eventData.status === "PUBLISHED") {
          setEvent(eventData);
          return;
        }

        // Jika user adalah guest dan event bukan PUBLISHED, tampilkan error
        if (isGuest && eventData.status !== "PUBLISHED") {
          setError("This event is not available for public viewing");
          return;
        }

        // Jika user authenticated tapi bukan organizer dan event adalah DRAFT, cek role
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
        console.error("Error fetching event:", err);
        setError("Error fetching event details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    // Hanya fetch jika ada eventId dan auth sudah selesai loading
    if (eventId && !authLoading) {
      fetchEvent();
    }
  }, [eventId, authLoading, isGuest, isAuthenticated, user, hasRole]);

  // Show loading while auth is loading or event is loading
  if (authLoading || isLoading) {
    return <EventDetailLoading />;
  }

  // Show error
  if (error || !event) {
    return <EventDetailError error={error} eventId={eventId} />;
  }

  // If guest user trying to access published event
  if (isGuest && event.status === "PUBLISHED") {
    return <EventDetailLoginRequired event={event} eventId={eventId} />;
  }

  // Route to appropriate component based on role
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

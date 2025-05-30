"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Event, Transaction } from "@/lib/types";
import Link from "next/link";
import { format } from "date-fns";

import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  TagIcon,
  TicketIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { TicketPurchaseModal } from "@/components/event/ticket-purchase-modal";

interface EventDetailViewerProps {
  event: Event;
  eventId: string;
  onEventUpdate: (event: Event) => void;
}

export default function EventDetailViewer({
  event,
  eventId,
  onEventUpdate,
}: EventDetailViewerProps) {
  const { isAuthenticated, isGuest } = useAuth();
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);

  const handleTransactionSuccess = (transaction: Transaction) => {
    setTransactionComplete(true);

    const ticketQuantity = calculateTicketQuantity(transaction);

    if (onEventUpdate) {
      const updatedEvent = {
        ...event,
        registered_count: (event.registered_count || 0) + ticketQuantity,
      };
      onEventUpdate(updatedEvent);
    }
  };

  const calculateTicketQuantity = (transaction: Transaction): number => {
    const descriptionMatch =
      transaction.description.match(/\((\d+) tickets?\)/);
    if (descriptionMatch) {
      return parseInt(descriptionMatch[1], 10);
    }

    if (event.basePrice && event.basePrice > 0) {
      return Math.round(transaction.amount / event.basePrice);
    }

    // Default fallback
    return 1;
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null || price === 0) return "Free";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isEventFull =
    event.capacity &&
    event.registered_count !== undefined &&
    event.registered_count >= event.capacity;

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
        <CardHeader>
          <div>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            <StatusBadge status={event.status} className="mt-2" />
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
                  {event.user_id || "Unknown Organizer"}
                </p>
              </div>
            </div>
          </div>

          {/* View Tickets Button */}
          {event.status === "PUBLISHED" && (
            <div className="border-t pt-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TicketIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-700">
                      Event Tickets
                    </h3>
                  </div>
                  <Link href={`/event/${eventId}/tickets`}>
                    <Button>
                      <TicketIcon className="h-4 w-4 mr-2" />
                      View Tickets
                    </Button>
                  </Link>
                </div>
                <p className="mt-2 text-gray-600">
                  View available tickets and purchase options for this event
                </p>
              </div>
            </div>
          )}

          {/* Legacy Quick Purchase - keep for backward compatibility */}
          {event.status === "PUBLISHED" && isAuthenticated && !isGuest && (
            <div className="border-t pt-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Quick Purchase</h3>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(event.basePrice)}
                    </p>
                    <p className="text-gray-600">
                      {event.capacity && event.registered_count !== undefined
                        ? `${event.capacity - event.registered_count} spots remaining`
                        : "Quota available"}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => setShowTicketModal(true)}
                    disabled={!!isEventFull || transactionComplete}
                    className="min-w-[120px]"
                  >
                    {isEventFull
                      ? "Event Full"
                      : transactionComplete
                        ? "Purchased"
                        : "Buy Now"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {(event.status as string) === "COMPLETED" && (
            <div className="border-t pt-6 max-w-3xl mx-auto">
              <Link href={`/review/${eventId}`}>
                <Button variant="outline" size="lg" className="w-full">
                  Lihat Review
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Purchase Modal */}
      {showTicketModal && (
        <TicketPurchaseModal
          event={event}
          eventId={eventId}
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          onSuccess={handleTransactionSuccess}
        />
      )}
    </div>
  );
}

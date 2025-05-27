"use client";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import { Ticket, getTicketsByEventId } from "@/lib/api/api-tickets";
import { Event } from "@/lib/types";
import { getAllEvents } from "@/lib/api/api-events";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketList } from "@/components/ticket/ticket-list";
import { CreateTicketModal } from "@/components/event/create-ticket-modal";
import { PlusIcon, TicketIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function TicketPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const eventParam = searchParams.get("event");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(
    eventParam || "",
  );
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Check user roles
  // const isAdmin = user?.role === UserRole.Admin; // Used for reference
  const isOrganizer = user?.role === UserRole.Organizer;
  const canCreateTicket = isOrganizer;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await getAllEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        toast({
          title: "Error",
          description: "Failed to load events. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchEvents();
  }, [toast]);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!selectedEventId) {
        setTickets([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedTickets = await getTicketsByEventId(selectedEventId);
        setTickets(fetchedTickets);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
        toast({
          title: "Error",
          description: "Failed to load tickets. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [selectedEventId, toast]);

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleTicketCreated = () => {
    // Refetch tickets after a new one is created
    if (selectedEventId) {
      getTicketsByEventId(selectedEventId)
        .then(setTickets)
        .catch(console.error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TicketIcon className="h-8 w-8" />
          Tickets Management
        </h1>

        {canCreateTicket && selectedEventId && (
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        )}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Event
              </label>
              <Select onValueChange={handleEventChange} value={selectedEventId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedEventId ? (
        <TicketList
          tickets={tickets}
          loading={loading}
          onTicketChange={handleTicketCreated}
          selectedEvent={events.find((e) => e.id === selectedEventId)}
        />
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500">
              Please select an event to view tickets
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          eventId={selectedEventId}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onTicketCreated={handleTicketCreated}
        />
      )}
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<div>Loading tickets...</div>}>
      <TicketPageContent />
    </Suspense>
  );
}

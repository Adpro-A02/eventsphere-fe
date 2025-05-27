"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import {
  Ticket,
  getTicketsByEventId,
  createTicket,
} from "@/lib/api/api-tickets";
import { getEventById } from "@/lib/api/api-events";
import type { Event } from "@/lib/api/api-events";
import { useParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TicketList } from "@/components/ticket/ticket-list";
import { PlusIcon, TicketIcon, ArrowLeftIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Ticket creation form schema
const ticketFormSchema = z.object({
  type: z.string().min(1, "Type is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  quota: z.coerce.number().min(1, "Quota must be at least 1"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  saleStart: z.coerce.number().min(1, "Sale start date is required"),
  saleEnd: z.coerce
    .number()
    .min(1, "Sale end date is required")
    .refine((val) => val > Date.now(), "Sale end must be in the future"),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

export default function EventTicketsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const eventId = params.id as string;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check user roles
  const isAdmin = user?.role === UserRole.Admin;
  const isOrganizer = user?.role === UserRole.Organizer;
  const canCreateTicket = isAdmin || isOrganizer;

  // Form setup
  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      type: "",
      price: 0,
      quota: 1,
      description: "",
      saleStart: Date.now(),
      saleEnd: Date.now() + 7 * 24 * 60 * 60 * 1000, // One week in the future
    },
  });

  // Fetch event details and tickets
  useEffect(() => {
    const fetchEventAndTickets = async () => {
      try {
        setLoading(true);
        setError(null);

        // Only fetch the specific event by ID
        const eventData = await getEventById(eventId);
        console.log("Event data:", eventData);
        setEvent(eventData);

        // Fetch tickets for this event
        const ticketsData = await getTicketsByEventId(eventId);
        console.log("Tickets data:", ticketsData);
        setTickets(ticketsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load data for this event. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load tickets for this event.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventAndTickets();
    }
  }, [eventId, toast]);

  // Handle ticket creation
  const handleTicketCreation = async (data: TicketFormData) => {
    if (!eventId) return;

    // Check if user is logged in and is an organizer
    if (!user) {
      setError("You must be logged in to create tickets");
      toast({
        title: "Authentication Error",
        description: "Please log in to create tickets",
        variant: "destructive",
      });
      return;
    }

    if (!isOrganizer && !isAdmin) {
      setError("Only organizers can create tickets");
      toast({
        title: "Permission Error",
        description: "You don't have permission to create tickets",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      console.log("Creating ticket with data:", { ...data, eventId });

      const newTicket = await createTicket({
        eventId,
        type: data.type,
        price: data.price,
        quota: data.quota,
        description: data.description,
        saleStart: data.saleStart,
        saleEnd: data.saleEnd,
        status: "AVAILABLE",
        remainingQuota: data.quota,
      });

      console.log("Created ticket:", newTicket);

      // Update the tickets list
      setTickets((prev) => [...prev, newTicket]);

      toast({
        title: "Success",
        description: "Ticket created successfully",
      });

      setShowCreateModal(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create ticket:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create ticket. Please check your inputs and try again.";

      // If session expired, redirect to login
      if (
        errorMessage.includes("session has expired") ||
        errorMessage.includes("Authentication required")
      ) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });

        // Optional: Redirect to login page
        // router.push('/login');
      } else {
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Handle date input changes
  const handleDateChange = (name: "saleStart" | "saleEnd", value: string) => {
    const timestamp = new Date(value).getTime();
    form.setValue(name, timestamp);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link
          href={`/event/${eventId}`}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Event
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TicketIcon className="h-8 w-8" />
          {event ? `Tickets for ${event.title}` : "Event Tickets"}
        </h1>

        {canCreateTicket && (
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <TicketList
        tickets={tickets}
        loading={loading}
        onTicketChange={() => getTicketsByEventId(eventId).then(setTickets)}
        selectedEvent={event ?? undefined}
      />

      {/* Create Ticket Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>
              Create a new ticket for this event. Attendees will be able to view
              and purchase it.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleTicketCreation)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a ticket type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="REGULAR">Regular</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quota</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the ticket benefits"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="saleStart"
                  render={() => (
                    <FormItem>
                      <FormLabel>Sale Start</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          defaultValue={new Date().toISOString().slice(0, 16)}
                          onChange={(e) =>
                            handleDateChange("saleStart", e.target.value)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="saleEnd"
                  render={() => (
                    <FormItem>
                      <FormLabel>Sale End</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          defaultValue={new Date(
                            Date.now() + 7 * 24 * 60 * 60 * 1000,
                          )
                            .toISOString()
                            .slice(0, 16)}
                          onChange={(e) =>
                            handleDateChange("saleEnd", e.target.value)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Ticket"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

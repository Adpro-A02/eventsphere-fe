"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Ticket,
  getTicketsByEventId,
  deleteTicket,
  validateTicket,
} from "@/lib/api/api-tickets";
import { UserRole } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  TicketIcon,
  Trash2Icon,
  CheckSquareIcon,
  PlusIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateTicketModal } from "./create-ticket-modal";

interface EventTicketsListProps {
  eventId: string;
  onTicketChange?: () => void;
}

export function EventTicketsList({
  eventId,
  onTicketChange,
}: EventTicketsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [ticketToValidate, setTicketToValidate] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Check user roles
  const isAdmin = user?.role === UserRole.Admin;
  const isOrganizer = user?.role === UserRole.Organizer;
  const canCreateTicket = isOrganizer;
  const canDeleteTicket = isAdmin || isOrganizer;
  const canValidateTicket = isAdmin || isOrganizer;

  // Wrap fetchTickets in useCallback to prevent it from changing on every render
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTicketsByEventId(eventId);
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Failed to load tickets. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load tickets. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, toast, setLoading, setError, setTickets]);

  useEffect(() => {
    if (eventId) {
      fetchTickets();
    }
  }, [eventId, fetchTickets]);

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    try {
      await deleteTicket(ticketToDelete);
      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      });
      fetchTickets();
      if (onTicketChange) onTicketChange();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete ticket";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTicketToDelete(null);
    }
  };

  const handleValidateTicket = async () => {
    if (!ticketToValidate) return;

    try {
      await validateTicket(ticketToValidate);
      toast({
        title: "Success",
        description: "Ticket validated successfully",
      });
      fetchTickets();
      if (onTicketChange) onTicketChange();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to validate ticket";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTicketToValidate(null);
    }
  };

  const handleTicketCreated = () => {
    fetchTickets();
    if (onTicketChange) onTicketChange();
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          {canCreateTicket && <Skeleton className="h-9 w-32" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <TicketIcon size={20} />
          Event Tickets
        </h3>

        {canCreateTicket && (
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        )}
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              No tickets available for this event yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {ticket.type} Ticket
                  </CardTitle>
                  <Badge
                    variant={
                      ticket.status === "AVAILABLE" ? "default" : "outline"
                    }
                  >
                    {ticket.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Price:</span>
                      <span className="font-medium">
                        {formatPrice(ticket.price)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available:</span>
                      <span className="font-medium">
                        {ticket.remainingQuota} / {ticket.quota}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sale period:</span>
                      <span className="font-medium">
                        {formatDate(ticket.saleStart)} -{" "}
                        {formatDate(ticket.saleEnd)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {canValidateTicket && ticket.status !== "USED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTicketToValidate(ticket.id)}
                      >
                        <CheckSquareIcon className="h-4 w-4 mr-1" />
                        Validate
                      </Button>
                    )}

                    {canDeleteTicket &&
                      ticket.remainingQuota === ticket.quota && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setTicketToDelete(ticket.id)}
                        >
                          <Trash2Icon className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!ticketToDelete}
        onOpenChange={() => setTicketToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              ticket.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTicket}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Validate Confirmation Dialog */}
      <AlertDialog
        open={!!ticketToValidate}
        onOpenChange={() => setTicketToValidate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Validate Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the ticket as USED. Are you sure you want to
              continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleValidateTicket}>
              Validate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          eventId={eventId}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onTicketCreated={handleTicketCreated}
        />
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Ticket, deleteTicket, validateTicket } from "@/lib/api/api-tickets";
import { UserRole, Event } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trash2Icon,
  CheckSquareIcon,
  CalendarIcon,
  UserIcon,
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
import { format } from "date-fns";

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  onTicketChange: () => void;
  selectedEvent?: Event;
}

export function TicketList({
  tickets,
  loading,
  onTicketChange,
  selectedEvent,
}: TicketListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [ticketToValidate, setTicketToValidate] = useState<string | null>(null);

  // Check user roles
  const isAdmin = user?.role === UserRole.Admin;
  const isOrganizer = user?.role === UserRole.Organizer;
  const canDeleteTicket = isAdmin || isOrganizer;
  const canValidateTicket = isAdmin || isOrganizer;

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    try {
      await deleteTicket(ticketToDelete);
      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      });
      onTicketChange();
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
      onTicketChange();
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-gray-500">No tickets found for this event</p>
          {isOrganizer && (
            <p className="text-gray-500 mt-2">
              As an organizer, you can create tickets for this event using the
              &quot;Create Ticket&quot; button above.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {selectedEvent && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h2 className="text-xl font-semibold">{selectedEvent.title}</h2>
          <div className="flex items-center mt-2 text-gray-600 gap-4">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{format(new Date(selectedEvent.event_date), "PPP")}</span>
            </div>
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              <span>{selectedEvent.organizer_name || "Unknown Organizer"}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{ticket.type} Ticket</CardTitle>
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
                  <p className="text-sm text-gray-500">{ticket.description}</p>
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
                      title="Mark ticket as USED"
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
                        title="Delete ticket"
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
    </div>
  );
}

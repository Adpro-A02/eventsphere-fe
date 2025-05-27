"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  ticketPurchaseSchema,
  type TicketPurchaseRequest,
  type Event,
  type BalanceResponse,
  type Transaction,
} from "@/lib/types";
import {
  getUserBalance,
  createTransaction,
  processPayment,
  withdrawFunds,
} from "@/lib/api/api-transactions";
import { useAuth } from "@/lib/auth-context";

interface TicketPurchaseModalProps {
  event: Event;
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
}

export function TicketPurchaseModal({
  event,
  eventId,
  isOpen,
  onClose,
  onSuccess,
}: TicketPurchaseModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<BalanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const form = useForm<TicketPurchaseRequest>({
    resolver: zodResolver(ticketPurchaseSchema),
    defaultValues: {
      quantity: 1,
      eventId: eventId,
      userId: user?.id || "",
    },
  });

  useEffect(() => {
    if (user?.id) {
      form.setValue("userId", user.id);
    }
  }, [user?.id, form]);

  const quantity = form.watch("quantity");
  const totalPrice = quantity * (event.basePrice || 0);
  const remainingSpots =
    event.capacity && event.registered_count !== undefined
      ? event.capacity - event.registered_count
      : undefined;
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchUserBalance(user.id);
    }
    if (isOpen) {
      setError(null);
      setBalanceError(null);
    }
  }, [isOpen, user?.id, fetchUserBalance]);

  const fetchUserBalance = async (userId: string) => {
    setBalanceLoading(true);
    setBalanceError(null);
    try {
      const balance = await getUserBalance(userId);
      setUserBalance(balance);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch your account balance";
      setBalanceError(errorMessage);

      toast({
        title: "Balance Error",
        description:
          "Unable to fetch your current balance. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setBalanceLoading(false);
    }
  };
  const handleSubmit: SubmitHandler<TicketPurchaseRequest> = async (data) => {
    if (!user?.id) {
      setError("You must be logged in to purchase tickets");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (balanceError) {
        setError(
          "Cannot proceed without balance information. Please refresh and try again.",
        );
        setIsLoading(false);
        return;
      }

      if (userBalance === null) {
        setError("Unable to verify your balance. Please try again.");
        setIsLoading(false);
        return;
      }

      if (userBalance.amount < totalPrice) {
        setError("Insufficient balance. Please top up your account.");
        setIsLoading(false);
        return;
      }

      if (remainingSpots !== undefined && data.quantity > remainingSpots) {
        setError(`Only ${remainingSpots} spots remaining for this event.`);
        setIsLoading(false);
        return;
      }

      const transaction = await createTransaction({
        user_id: user.id,
        ticket_id: eventId,
        amount: totalPrice,
        description: `Ticket purchase for ${event.title} (${data.quantity} tickets)`,
        payment_method: "Balance",
      });

      const processedTransaction = await processPayment(transaction.id);

      try {
        const updatedBalance = await withdrawFunds({
          user_id: user.id,
          amount: totalPrice,
          description: `Ticket purchase for ${event.title} (${data.quantity} tickets)`,
        });

        setUserBalance(updatedBalance);
      } catch (error) {
        console.error("Failed to deduct balance:", error);
        toast({
          title: "Balance Update Warning",
          description:
            "Tickets purchased successfully, but balance deduction failed. Please check your balance.",
          variant: "destructive",
        });

        if (user?.id) {
          try {
            await fetchUserBalance(user.id);
          } catch (balanceError) {
            console.error("Failed to refresh balance:", balanceError);
          }
        }
      }

      toast({
        title: "Tickets purchased successfully!",
        description: `You have purchased ${data.quantity} ticket(s) for ${event.title}`,
      });

      onSuccess(processedTransaction);
      onClose();
    } catch (error) {
      console.error("Failed to purchase tickets:", error);
      setError("Failed to process your payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase Tickets</DialogTitle>
          <DialogDescription>
            {event.title} - {new Date(event.event_date).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Tickets</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={remainingSpots}
                      {...field}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Price per ticket:</span>
                <span className="font-medium">
                  {event.basePrice === 0 || !event.basePrice
                    ? "Free"
                    : new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(event.basePrice)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quantity:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total:</span>
                <span>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(totalPrice)}
                </span>
              </div>{" "}
              {userBalance && !balanceLoading && (
                <div className="flex justify-between text-sm">
                  <span>Your balance:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(userBalance.amount)}
                  </span>
                </div>
              )}
              {balanceLoading && (
                <div className="flex justify-between text-sm">
                  <span>Your balance:</span>
                  <span className="font-medium text-gray-400">Loading...</span>
                </div>
              )}
              {balanceError && (
                <div className="flex justify-between text-sm">
                  <span>Your balance:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-red-500">
                      Error loading
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-xs"
                      onClick={() => user?.id && fetchUserBalance(user.id)}
                      disabled={balanceLoading}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}
              {remainingSpots !== undefined && (
                <div className="flex justify-between text-sm">
                  <span>Remaining spots:</span>
                  <span className="font-medium">{remainingSpots}</span>
                </div>
              )}
            </div>{" "}
            {balanceError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {balanceError}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-1"
                    onClick={() => user?.id && fetchUserBalance(user.id)}
                    disabled={balanceLoading}
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>{" "}
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  balanceLoading ||
                  balanceError !== null ||
                  (userBalance !== null && userBalance.amount < totalPrice)
                }
              >
                {isLoading
                  ? "Processing..."
                  : balanceLoading
                    ? "Loading Balance..."
                    : balanceError
                      ? "Balance Error"
                      : "Purchase Tickets"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

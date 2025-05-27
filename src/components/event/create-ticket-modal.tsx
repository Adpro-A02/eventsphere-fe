"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTicket } from "@/lib/api/api-tickets";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Validation schema for ticket creation
const ticketCreationSchema = z.object({
  type: z.string().min(1, "Ticket type is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  quota: z.coerce.number().min(1, "Quota must be at least 1"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  saleStart: z.coerce.number().min(1, "Sale start date is required"),
  saleEnd: z.coerce
    .number()
    .min(1, "Sale end date is required")
    .refine((val) => val > Date.now(), "Sale end must be in the future"),
});

type TicketCreationFormData = z.infer<typeof ticketCreationSchema>;

interface CreateTicketModalProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: () => void;
}

export function CreateTicketModal({
  eventId,
  isOpen,
  onClose,
  onTicketCreated,
}: CreateTicketModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current date in ISO format for the input fields
  const currentDate = new Date().toISOString().slice(0, 16);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().slice(0, 16);

  const form = useForm<TicketCreationFormData>({
    resolver: zodResolver(ticketCreationSchema),
    defaultValues: {
      type: "",
      price: 0,
      quota: 1,
      description: "",
      saleStart: Date.now(),
      saleEnd: tomorrow.getTime(),
    },
  });

  const onSubmit = async (data: TicketCreationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await createTicket({
        eventId,
        ...data,
      });

      toast({
        title: "Success",
        description: "Ticket created successfully",
      });

      onTicketCreated();
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create ticket";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (name: "saleStart" | "saleEnd", value: string) => {
    const timestamp = new Date(value).getTime();
    form.setValue(name, timestamp);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Create a new ticket for this event. Attendees will be able to view
            and purchase it.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        defaultValue={currentDate}
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
                        defaultValue={tomorrowString}
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
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Ticket"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

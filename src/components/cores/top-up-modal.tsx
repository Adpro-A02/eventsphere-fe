"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { addFunds } from "@/lib/api/api-transactions";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const topUpSchema = z.object({
  amount: z
    .number()
    .min(1, "Amount must be at least $1")
    .max(10000, "Maximum amount is $10,000"),
  payment_method: z.string().min(1, "Please select a payment method"),
});

type TopUpFormData = z.infer<typeof topUpSchema>;

const paymentMethods = [
  "Bank Transfer",
  "Credit Card",
  "Debit Card",
  "PayPal",
  "Digital Wallet",
];

export default function TopUpModal() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TopUpFormData>({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      amount: 0,
      payment_method: "",
    },
  });

  const addFundsMutation = useMutation({
    mutationFn: addFunds,
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Funds have been added to your account successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["userBalance", user?.id] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add funds",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TopUpFormData) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    addFundsMutation.mutate({
      user_id: user.id,
      amount: data.amount,
      payment_method: data.payment_method,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="">
          <Plus className="h-4 w-4 mr-2" />
          Top Up Balance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Top Up Balance</DialogTitle>
          <DialogDescription>
            Add funds to your account balance. Choose your preferred payment
            method.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      min="1"
                      max="10000"
                      step="1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={addFundsMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addFundsMutation.isPending}>
                {addFundsMutation.isPending ? "Processing..." : "Add Funds"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

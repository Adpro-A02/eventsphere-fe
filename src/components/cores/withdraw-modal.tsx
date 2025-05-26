"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Minus } from "lucide-react";
import { withdrawFunds } from "@/lib/api/api-transactions";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const withdrawSchema = z.object({
  amount: z
    .number()
    .min(1, "Amount must be at least Rp 1")
    .max(5000000, "Maximum amount is Rp 5,000,000"),
  description: z
    .string()
    .min(1, "Please provide a description")
    .max(200, "Description too long"),
});

type WithdrawFormData = z.infer<typeof withdrawSchema>;

interface WithdrawModalProps {
  currentBalance?: number;
}

export default function WithdrawModal({
  currentBalance = 0,
}: WithdrawModalProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
      description: "",
    },
  });

  const withdrawFundsMutation = useMutation({
    mutationFn: withdrawFunds,
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Withdrawal request has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["userBalance", user?.id] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WithdrawFormData) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    if (data.amount > currentBalance) {
      toast({
        title: "Error",
        description: "Insufficient balance for this withdrawal.",
        variant: "destructive",
      });
      return;
    }

    withdrawFundsMutation.mutate({
      user_id: user.id,
      amount: data.amount,
      description: data.description,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="">
          <Minus className="h-4 w-4 mr-2" />
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Withdraw funds from your account balance. Available balance: Rp
            {currentBalance.toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      min="1"
                      max={currentBalance}
                      step="1"
                    />
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
                      placeholder="Enter withdrawal description (e.g., Withdrawal to bank account)"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={withdrawFundsMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  withdrawFundsMutation.isPending || currentBalance === 0
                }
                variant="destructive"
              >
                {withdrawFundsMutation.isPending ? "Processing..." : "Withdraw"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

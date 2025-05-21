"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface EventActionsProps {
  eventId: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
}

export function EventActions({ eventId, status }: EventActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (
    action: "publish" | "cancel" | "complete",
  ) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8081/api/events/${eventId}/${action}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            //AUTH
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} event`);
      }

      toast({
        title: "Success",
        description: `Event has been ${action}ed successfully.`,
      });

      // Refresh the page to show updated status
      router.refresh();
    } catch (err) {
      console.error(`Error ${action}ing event:`, err);
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : `Failed to ${action} event. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {status === "DRAFT" && (
        <Button
          onClick={() => handleStatusChange("publish")}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircleIcon className="h-4 w-4 mr-2" />
          {isLoading ? "Publishing..." : "Publish Event"}
        </Button>
      )}

      {status === "PUBLISHED" && (
        <>
          <Button
            onClick={() => handleStatusChange("complete")}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            {isLoading ? "Completing..." : "Mark as Completed"}
          </Button>

          <Button
            onClick={() => handleStatusChange("cancel")}
            disabled={isLoading}
            variant="destructive"
          >
            <XCircleIcon className="h-4 w-4 mr-2" />
            {isLoading ? "Cancelling..." : "Cancel Event"}
          </Button>
        </>
      )}
    </div>
  );
}

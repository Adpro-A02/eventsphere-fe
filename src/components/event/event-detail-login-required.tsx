"use client";

import { useRouter } from "next/navigation";
import type { Event } from "@/lib/types";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  LockIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

interface EventDetailLoginRequiredProps {
  event: Event;
  eventId: string;
}

export default function EventDetailLoginRequired({
  event,
  eventId,
}: EventDetailLoginRequiredProps) {
  const router = useRouter();

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null || price === 0) return "Free";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

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
          {/* Limited Event Preview */}
          <div className="space-y-4">
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
          </div>

          {/* Login Required Section */}
          <div className="border-t pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <LockIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-blue-800 mb-2">
                Login Required
              </h3>
              <p className="text-blue-600 mb-6">
                Please login to purchase tickets
              </p>

              <div className="space-y-2">
                <div className="flex gap-2 justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={() =>
                      router.push(
                        `/login?returnUrl=${encodeURIComponent(`/event/${eventId}`)}`,
                      )
                    }
                  >
                    Login to Purchase
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      router.push(
                        `/register?returnUrl=${encodeURIComponent(`/event/${eventId}`)}`,
                      )
                    }
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

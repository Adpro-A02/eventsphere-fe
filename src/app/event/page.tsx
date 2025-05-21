"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  MapPinIcon,
  PlusCircleIcon,
  TagIcon,
} from "lucide-react";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  userId: string;
  createdAt: string;
  updatedAt: string;
  basePrice: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token =
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmNmJkYWE3OS0yNjEzLTRkYTktYTFlMy0yOWE5Y2JiYmUyZDQiLCJyb2xlIjoiT3JnYW5pemVyIiwiZXhwIjoxNzQ3ODE4Mzc4fQ.JbFVLZvrAfkSO3yQn-kppu8IzBaFBlvvnYd1Pmmodi0";
        // const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8081/api/events", {
          method: "GET",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        console.log(data);
        setEvents(data);
      } catch (err) {
        setError("Error fetching events. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500";
      case "DRAFT":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500";
      case "COMPLETED":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  function formatPrice(basePrice: number): React.ReactNode {
    return basePrice.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link href="/event/create">
          <Button>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No events found</p>
          <Link href="/event/create">
            <Button>Create Your First Event</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link href={`/event/${event.id}`} key={event.id}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-1">
                      {event.title}
                    </CardTitle>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center mt-2">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {format(
                      parseISO(event.event_date),
                      "MMMM d, yyyy 'at' h:mm a",
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {event.description || "No description provided"}
                  </p>
                  <div className="flex items-center mt-4 text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <TagIcon className="h-4 w-4 mr-1" />
                    <span>{formatPrice(event.basePrice)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

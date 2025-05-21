import Link from "next/link";
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, TagIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    eventDate: string;
    location: string;
    basePrice?: number;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  };
}

export function EventCard({ event }: EventCardProps) {
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

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "Free";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link href={`/event/${event.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            <Badge className={getStatusColor(event.status)}>
              {event.status}
            </Badge>
          </div>
          <CardDescription className="flex items-center mt-2">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {format(new Date(event.eventDate), "PPP")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 line-clamp-2">
            {event.description || "No description provided"}
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <TagIcon className="h-4 w-4 mr-1" />
              <span>{formatPrice(event.basePrice)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

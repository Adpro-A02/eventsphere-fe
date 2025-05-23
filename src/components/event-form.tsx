"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface EventFormProps {
  initialData?: {
    id?: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    basePrice?: number;
  };
  isEditing?: boolean;
}

export function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    initialData?.event_date ? new Date(initialData.event_date) : undefined,
  );
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    event_date: initialData?.event_date || "",
    location: initialData?.location || "",
    basePrice: initialData?.basePrice?.toString() || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().slice(0, 19);
      setFormData((prev) => ({ ...prev, event_date: formattedDate }));
      console.log("Selected event date:", formattedDate);

      if (errors.event_date) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.event_date;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.event_date) {
      newErrors.event_date = "Event date is required";
    }

    if (formData.basePrice && isNaN(Number(formData.basePrice))) {
      newErrors.basePrice = "Base price must be a number";
    }

    if (formData.basePrice && Number(formData.basePrice) < 0) {
      newErrors.basePrice = "Base price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Convert basePrice to number for API
    const apiFormData = {
      ...formData,
      basePrice: formData.basePrice ? Number(formData.basePrice) : undefined,
    };

    try {
      const url = isEditing
        ? `http://localhost:8081/api/events/${initialData?.id}`
        : "http://localhost:8081/api/events";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          // "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(apiFormData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Failed to ${isEditing ? "update" : "create"} event`,
        );
      }

      toast({
        title: isEditing ? "Event Updated" : "Event Created",
        description: `Your event has been ${isEditing ? "updated" : "created"} successfully.`,
      });

      router.push("/event");
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} event:`,
        error,
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} event.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          Event Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter event title"
          value={formData.title}
          onChange={handleInputChange}
          className={cn(errors.title && "border-red-500")}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Event Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter event description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event_date">
          Event Date <span className="text-red-500">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
                errors.event_date && "border-red-500",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.event_date && (
          <p className="text-sm text-red-500">{errors.event_date}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">
          Location <span className="text-red-500">*</span>
        </Label>
        <Input
          id="location"
          name="location"
          placeholder="Enter event location"
          value={formData.location}
          onChange={handleInputChange}
          className={cn(errors.location && "border-red-500")}
        />
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="basePrice">Base Price</Label>
        <Input
          id="basePrice"
          name="basePrice"
          type="number"
          placeholder="Enter base price"
          value={formData.basePrice}
          onChange={handleInputChange}
          className={cn(errors.basePrice && "border-red-500")}
        />
        {errors.basePrice && (
          <p className="text-sm text-red-500">{errors.basePrice}</p>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          variant="outline"
          type="button"
          onClick={() => router.push("/event")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
              ? "Update Event"
              : "Create Event"}
        </Button>
      </div>
    </form>
  );
}

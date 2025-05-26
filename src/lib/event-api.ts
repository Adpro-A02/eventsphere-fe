import api from "@/libs/axios/apiEvent";
import axios from "axios";
import { format } from "date-fns";
import type { Event, ApiResponse, EventRequest } from "@/lib/types";

export async function getAllEvents(): Promise<Event[]> {
  const { data } = await api.get<Event[]>("/api/events");

  return data;
}

export async function getPublishedEvents(): Promise<Event[]> {
  const { data } = await api.get<ApiResponse<Event[]>>("/api/events");

  if (data.success && data.data) return data.data;
  throw new Error(data.message);
}

export async function getEventById(eventId: string): Promise<Event> {
  const { data } = await api.get<Event>(`/api/events/${eventId}`);
  return data;
}

export async function updateEvent(
  eventId: string,
  payload: EventRequest,
): Promise<Event> {
  try {
    let eventDate = payload.event_date;

    console.log("Original event_date:", eventDate);

    if (eventDate) {
      const dateObj =
        typeof eventDate === "string" ? new Date(eventDate) : eventDate;

      if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date: ${eventDate}`);
      }

      eventDate = format(dateObj, "yyyy-MM-dd'T'HH:mm:ss");
      console.log("Formatted event_date:", eventDate);
    }

    const formattedPayload = {
      ...payload,
      event_date: eventDate,
    };

    console.log("Final payload being sent:", formattedPayload);

    const { data } = await api.put<Event>(
      `/api/events/${eventId}`,
      formattedPayload,
    );

    return data;
  } catch (error: any) {
    /* eslint-disable-line @typescript-eslint/no-explicit-any */

    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to update event");
  }
}

export async function publishEvent(eventId: string): Promise<Event> {
  try {
    const { data } = await api.patch<Event>(`/api/events/${eventId}/publish`);
    console.log("Publish response:", data);
    return data;
  } catch (error: any) {
    /* eslint-disable-line @typescript-eslint/no-explicit-any */
    if (error.response) {
      const message =
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      throw new Error("Network error: Unable to connect to server");
    } else {
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
}

export async function cancelEvent(eventId: string): Promise<Event> {
  try {
    const { data } = await api.patch<Event>(`/api/events/${eventId}/cancel`);
    return data;
  } catch (error: any) {
    /* eslint-disable-line @typescript-eslint/no-explicit-any */
    if (error.response) {
      const message =
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      throw new Error("Network error: Unable to connect to server");
    } else {
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
}

export async function completeEvent(eventId: string): Promise<Event> {
  try {
    const { data } = await api.patch<Event>(`/api/events/${eventId}/complete`);
    return data;
  } catch (error: any) {
    /* eslint-disable-line @typescript-eslint/no-explicit-any */
    if (error.response) {
      const message =
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      throw new Error("Network error: Unable to connect to server");
    } else {
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
}

export async function createEvent(payload: EventRequest): Promise<Event> {
  try {
    const { data } = await api.post<Event>("/api/events", payload);
    return data;
  } catch (error: unknown) {
    console.error("createEvent error:", error);
    if (axios.isAxiosError(error)) {
      console.log("Axios error response:", error.response?.data);
      const message =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message ||
            `Server error: ${error.response?.status}`;
      throw new Error(message);
    }
    throw new Error(
      error instanceof Error ? error.message : "An unexpected error occurred",
    );
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    await api.delete(`/api/events/${eventId}`);
  } catch (error: any) {
    /* eslint-disable-line @typescript-eslint/no-explicit-any */
    if (error.response) {
      const message =
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      throw new Error("Network error: Unable to connect to server");
    } else {
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
}

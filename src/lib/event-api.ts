import type { Event, ApiResponse, EventRequest } from "@/lib/types";
import { getToken } from "@/lib/auth-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }

  return data as ApiResponse<T>;
}
export async function getAllEvents(): Promise<Event[]> {
  const response = await fetch(`${API_BASE_URL}/api/events`);
  const result = await handleResponse<Event[]>(response);

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.message);
}

export async function getPublishedEvents(): Promise<Event[]> {
  const response = await fetch(`${API_BASE_URL}/api/events`);
  const result = await handleResponse<Event[]>(response);

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.message);
}
// Get event by ID
export async function getEventById(eventId: string): Promise<Event> {
  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.statusText}`);
  }

  const eventData = await response.json();
  return eventData as Event;
}

// Update event (organizer only)
export async function updateEvent(
  eventId: string,
  data: EventRequest,
): Promise<Event> {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await handleResponse<Event>(response);

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.message);
}

// Publish event (organizer only)
export async function publishEvent(eventId: string): Promise<Event> {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/events/${eventId}/publish`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const result = await handleResponse<Event>(response);

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.message);
}

// Cancel event (organizer only)
export async function cancelEvent(eventId: string): Promise<Event> {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await handleResponse<Event>(response);

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.message);
}

// Register for event (attendee)
export async function registerForEvent(eventId: string): Promise<void> {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/events/${eventId}/register`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const result = await handleResponse<void>(response);

  if (!result.success) {
    throw new Error(result.message);
  }
}

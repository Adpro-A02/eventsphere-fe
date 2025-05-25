import api from "@/libs/axios/apiEvent";
import type { Event, ApiResponse, EventRequest } from "@/lib/types";

export async function getAllEvents(): Promise<Event[]> {
  const { data } = await api.get<ApiResponse<Event[]>>("/api/events");

  if (data.success && data.data) return data.data;
  throw new Error(data.message);
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
  const { data } = await api.put<ApiResponse<Event>>(
    `/api/events/${eventId}`,
    payload,
  );
  if (data.success && data.data) return data.data;
  throw new Error(data.message);
}

export async function publishEvent(eventId: string): Promise<Event> {
  const { data } = await api.post<ApiResponse<Event>>(
    `/api/events/${eventId}/publish`,
  );
  if (data.success && data.data) return data.data;
  throw new Error(data.message);
}

export async function cancelEvent(eventId: string): Promise<Event> {
  const { data } = await api.post<ApiResponse<Event>>(
    `/api/events/${eventId}/cancel`,
  );
  if (data.success && data.data) return data.data;
  throw new Error(data.message);
}

// export async function registerForEvent(eventId: string): Promise<void> {
//   const { data } = await api.post<ApiResponse<void>>(
//     `/api/events/${eventId}/register`,
//   );
//   if (!data.success) throw new Error(data.message);
// }

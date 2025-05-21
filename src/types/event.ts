export interface EventApiResponse {
  id: string;
  title: string;
  description: string;
  location: string;
  basePrice: number;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  event_date: string; // snake_case dari API
  user_id: string; // snake_case dari API
  createdAt?: string;
  updatedAt?: string;
}
export type EventApiRequest = {
  id?: string;
  title?: string;
  description?: string;
  location?: string;
  basePrice?: number;
  status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  event_date?: string;
  user_id?: string;
};

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  basePrice: number;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  eventDate: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Fungsi untuk mengkonversi dari API response ke format frontend
export function mapApiResponseToEvent(apiResponse: EventApiResponse): Event {
  return {
    id: apiResponse.id,
    title: apiResponse.title,
    description: apiResponse.description,
    location: apiResponse.location,
    basePrice: apiResponse.basePrice,
    status: apiResponse.status,
    eventDate: apiResponse.event_date,
    userId: apiResponse.user_id,
    createdAt: apiResponse.createdAt,
    updatedAt: apiResponse.updatedAt,
  };
}

// Fungsi untuk mengkonversi dari format frontend ke API request
export function mapEventToApiRequest(event: Partial<Event>): EventApiRequest {
  const apiRequest: EventApiRequest = {};

  if (event.id !== undefined) apiRequest.id = event.id;
  if (event.title !== undefined) apiRequest.title = event.title;
  if (event.description !== undefined)
    apiRequest.description = event.description;
  if (event.location !== undefined) apiRequest.location = event.location;
  if (event.basePrice !== undefined) apiRequest.basePrice = event.basePrice;
  if (event.status !== undefined) apiRequest.status = event.status;
  if (event.eventDate !== undefined) apiRequest.event_date = event.eventDate;
  if (event.userId !== undefined) apiRequest.user_id = event.userId;

  return apiRequest;
}

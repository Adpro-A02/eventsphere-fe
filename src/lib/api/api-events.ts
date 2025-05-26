import { API_BASE_URL } from "./api-config";
import { Event } from "@/lib/types";

// Get all events
export async function getAllEvents(): Promise<Event[]> {
  try {
    console.log("Fetching all events");
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`Failed to fetch events: ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log("Received events data:", data);
    
    // Check if the API returns data in a wrapper object
    if (data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

// Get a single event by ID
export async function getEventById(eventId: string): Promise<Event | null> {
  try {
    console.log(`Fetching event with ID: ${eventId}`);
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`Failed to fetch event: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log("Received event data:", data);
    
    // Check if the API returns data in a wrapper object
    if (data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    return null;
  }
}

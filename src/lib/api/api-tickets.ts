import { API_BASE_URL } from "./api-config";
import { handleApiError } from "./api-error";
import { getToken } from "@/lib/auth-storage";

export interface Ticket {
  id: string;
  eventId: string;
  type: string;
  price: number;
  quota: number;
  remainingQuota: number;
  description: string;
  saleStart: number;
  saleEnd: number;
  status: string;
}

// Get all tickets for an event
export async function getTicketsByEventId(eventId: string): Promise<Ticket[]> {
  try {
    console.log(`Fetching tickets for event: ${eventId}`);
    const response = await fetch(`${API_BASE_URL}/tickets/event/${eventId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch tickets: ${response.status} ${response.statusText}`,
      );
      throw new Error(`Failed to fetch tickets: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Received tickets data:", data);
    return data;
  } catch (error) {
    console.error("Error in getTicketsByEventId:", error);
    return [];
  }
}

// Create a new ticket
export async function createTicket(
  ticket: Omit<Ticket, "id">,
): Promise<Ticket> {
  try {
    console.log("Creating ticket with data:", ticket);

    // Get auth token using the same method as in apiEvent.ts
    const token = getToken();

    if (!token) {
      console.error("No authentication token found");
      throw new Error("Authentication required. Please log in first.");
    }

    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(ticket),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create ticket: ${response.status} ${errorText}`);

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      } else if (response.status === 403) {
        throw new Error("You don't have permission to create tickets.");
      } else {
        throw new Error(
          `Failed to create ticket: ${errorText || response.statusText}`,
        );
      }
    }

    const data = await response.json();
    console.log("Created ticket:", data);
    return data;
  } catch (error) {
    console.error("Error in createTicket:", error);
    throw error;
  }
}

// Delete a ticket
export async function deleteTicket(ticketId: string): Promise<void> {
  try {
    // Get auth token
    const token = getToken();

    if (!token) {
      console.error("No authentication token found");
      throw new Error("Authentication required. Please log in first.");
    }

    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error("Cannot delete tickets that have been purchased");
      } else if (response.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      } else if (response.status === 403) {
        throw new Error("You don't have permission to delete this ticket.");
      }
      throw new Error(`Failed to delete ticket: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return handleApiError(error, "Failed to delete ticket");
  }
}

// Update ticket status (for validation)
export async function validateTicket(ticketId: string): Promise<Ticket> {
  try {
    // Get auth token
    const token = getToken();

    if (!token) {
      console.error("No authentication token found");
      throw new Error("Authentication required. Please log in first.");
    }

    const response = await fetch(
      `${API_BASE_URL}/tickets/${ticketId}/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      } else if (response.status === 403) {
        throw new Error("You don't have permission to validate this ticket.");
      }
      throw new Error(`Failed to validate ticket: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error validating ticket:", error);
    return handleApiError(error, "Failed to validate ticket");
  }
}

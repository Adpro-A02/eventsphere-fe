import axios from "axios";
import { getToken } from "@/lib/auth-storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_TICKET_AUTH_URL || "http://localhost:8001";

const apiTicket = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiTicket.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiTicket.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Ticket API Error:", error);

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Authentication error handling
      console.error("Authentication error in ticket API");
    }

    return Promise.reject(error);
  },
);

export default apiTicket;

import axios from "axios";
import { getToken } from "@/lib/auth-storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_REVIEW_AUTH_URL || "http://localhost:8080";

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

    if (error.response?.status === 401) {
      console.error("Authentication error in review.");
    }

    return Promise.reject(error);
  },
);

export default apiTicket;

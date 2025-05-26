// Simple error handling utility for API calls
export function handleApiError(error: unknown, defaultMessage: string): never {
  console.error("API Error:", error);

  if (error instanceof Error) {
    throw error;
  }

  throw new Error(defaultMessage);
}

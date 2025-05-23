// Centralized authentication storage management
export interface AuthData {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  expiresAt?: number;
}
// If you need a user state, use the type from AuthData['user']
// const [user, setUser] = useState<AuthData['user'] | null>(null);
const AUTH_STORAGE_KEY = "auth_data";
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer before expiry

// Safe localStorage operations
function safeLocalStorage() {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
}

// Save complete auth data
export function saveAuthData(authData: AuthData): void {
  try {
    const storage = safeLocalStorage();
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } catch (error) {
    console.error("Failed to save auth data:", error);
  }
}

// Get complete auth data
export function getAuthData(): AuthData | null {
  try {
    const storage = safeLocalStorage();
    const data = storage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;

    const authData: AuthData = JSON.parse(data);

    // Check if token is expired
    if (
      authData.expiresAt &&
      Date.now() > authData.expiresAt - TOKEN_EXPIRY_BUFFER
    ) {
      console.log("Token is expired or about to expire");
      return null;
    }

    return authData;
  } catch (error) {
    console.error("Failed to get auth data:", error);
    return null;
  }
}

// Clear all auth data
export function clearAuthData(): void {
  try {
    const storage = safeLocalStorage();
    storage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear auth data:", error);
  }
}

// Get just the token
export function getToken(): string | null {
  const authData = getAuthData();
  return authData?.token || null;
}

// Get just the refresh token
export function getRefreshToken(): string | null {
  const authData = getAuthData();
  return authData?.refreshToken || null;
}

// Get user data
export function getUserData(): AuthData["user"] | null {
  const authData = getAuthData();
  return authData?.user || null;
}

// Check if user has specific role
export function hasRole(role: string): boolean {
  const userData = getUserData();
  return userData?.role === role;
}

// Check if user has any of the specified roles
export function hasAnyRole(roles: string[]): boolean {
  const userData = getUserData();
  return userData ? roles.includes(userData.role) : false;
}

// Check if user is admin
export function isAdmin(): boolean {
  return hasRole("Admin");
}

// Check if user is organizer
export function isOrganizer(): boolean {
  return hasRole("Organizer");
}

// Check if user is attendee
export function isAttendee(): boolean {
  return hasRole("Attendee");
}

// Decode JWT token to get expiry (basic implementation)
export function decodeTokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}
// function useState<T>(arg0: null): [any, any] {
//     // throw new Error("Function not implemented.")
// }

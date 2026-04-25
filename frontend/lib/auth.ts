/**
 * Authentication client for FastAPI backend.
 * Handles login, signup, logout, and session management via JWT tokens.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ✅ MUST MATCH api-client & AuthProvider
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Session {
  user: User;
  token: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * Sign in with email and password.
 */
export async function signIn(email: string, password: string): Promise<Session> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Login failed" }));
    throw new Error(error.detail || "Login failed");
  }

  const data: AuthResponse = await response.json();

  if (typeof window !== "undefined") {
    // ✅ THIS WAS MISSING EFFECTIVELY
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return { user: data.user, token: data.access_token };
}

/**
 * Sign up with email and password.
 */
export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<Session> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Registration failed" }));
    throw new Error(error.detail || "Registration failed");
  }

  const data: AuthResponse = await response.json();

  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return { user: data.user, token: data.access_token };
}

/**
 * Sign out - clear stored credentials.
 */
export function signOut(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * Get current session from localStorage.
 */
export function getSession(): Session | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);

  if (!token || !userStr) return null;

  try {
    const user = JSON.parse(userStr) as User;
    return { user, token };
  } catch {
    return null;
  }
}

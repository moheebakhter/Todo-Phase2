/**
 * Typed API client with JWT authentication.
 * Wraps fetch to automatically attach JWT from session.
 */

import type { Task, TaskCreate, TaskUpdate } from "@/types";
import { getSession } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * API error with status code and message.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Redirect to login page (client-side only).
 * Preserves the current path for callback after login.
 */
function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    window.location.href = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
  }
}

/**
 * Make an authenticated API request.
 * Automatically attaches JWT from session to Authorization header.
 * Handles session expiry by redirecting to login on 401.
 *
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws ApiError on non-2xx response (except 401 which redirects)
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getSession();
  const token = session?.session?.token;

  // Check for missing or potentially expired session
  if (!token) {
    redirectToLogin();
    throw new ApiError(401, "Not authenticated - session missing or expired");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }

    // Handle authentication errors by redirecting to login
    if (response.status === 401) {
      redirectToLogin();
      throw new ApiError(401, "Session expired - redirecting to login", details);
    }

    throw new ApiError(response.status, `API request failed: ${response.statusText}`, details);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Tasks API client.
 */
export const tasksApi = {
  /**
   * Get all tasks for the current user.
   */
  async list(): Promise<Task[]> {
    return apiRequest<Task[]>("/api/tasks");
  },

  /**
   * Get a single task by ID.
   */
  async get(id: string): Promise<Task> {
    return apiRequest<Task>(`/api/tasks/${id}`);
  },

  /**
   * Create a new task.
   */
  async create(data: TaskCreate): Promise<Task> {
    return apiRequest<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing task.
   */
  async update(id: string, data: TaskUpdate): Promise<Task> {
    return apiRequest<Task>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Toggle task completion status.
   */
  async toggle(id: string): Promise<Task> {
    return apiRequest<Task>(`/api/tasks/${id}/toggle`, {
      method: "PATCH",
    });
  },

  /**
   * Delete a task.
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Health check API.
 */
export const healthApi = {
  /**
   * Check API health status.
   */
  async check(): Promise<{ status: string }> {
    return apiRequest<{ status: string }>("/api/health");
  },
};

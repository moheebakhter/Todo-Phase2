/**
 * Typed API client with JWT authentication.
 * Wraps fetch to automatically attach JWT from session.
 */

import type { Task, TaskCreate, TaskUpdate } from "@/types";
import { getSession } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
 * Make an authenticated API request.
 * Automatically attaches JWT from session OR localStorage.
 * Throws ApiError on failure — callers handle navigation.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 🔑 FIX: robust token resolution
  const session = getSession();
  const token =
    session?.token ||
    (typeof window !== "undefined"
      ? localStorage.getItem("auth_token")
      : null);

  if (!token) {
    throw new ApiError(401, "Not authenticated");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
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

    if (response.status === 401) {
      throw new ApiError(401, "Session expired", details);
    }

    throw new ApiError(
      response.status,
      `API request failed: ${response.statusText}`,
      details
    );
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
  async list(): Promise<Task[]> {
    return apiRequest<Task[]>("/api/tasks");
  },

  async get(id: string): Promise<Task> {
    return apiRequest<Task>(`/api/tasks/${id}`);
  },

  async create(data: TaskCreate): Promise<Task> {
    return apiRequest<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: TaskUpdate): Promise<Task> {
    return apiRequest<Task>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async toggle(id: string): Promise<Task> {
    return apiRequest<Task>(`/api/tasks/${id}/toggle`, {
      method: "PATCH",
    });
  },

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
  async check(): Promise<{ status: string }> {
    return apiRequest<{ status: string }>("/api/health");
  },
};

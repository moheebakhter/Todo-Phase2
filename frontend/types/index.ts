/**
 * TypeScript type definitions matching backend schemas.
 */

/**
 * Task entity as returned from the API.
 */
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Request body for creating a new task.
 * user_id is extracted from JWT on the backend.
 */
export interface TaskCreate {
  title: string;
  description?: string | null;
}

/**
 * Request body for updating an existing task.
 * All fields are optional - only provided fields are updated.
 */
export interface TaskUpdate {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
}

/**
 * API error response structure.
 */
export interface ApiErrorResponse {
  detail: string | { msg: string; type: string }[];
}

/**
 * Health check response.
 */
export interface HealthResponse {
  status: "ok" | "error";
}

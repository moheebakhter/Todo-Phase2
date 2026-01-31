/**
 * Better Auth API route handlers.
 * Handles all authentication-related API requests.
 */

import { auth } from "@/lib/auth-server";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Export GET and POST handlers for Better Auth.
 * These handle:
 * - GET: Session retrieval, OAuth callbacks
 * - POST: Sign in, sign up, sign out, token refresh
 */
export const { GET, POST } = toNextJsHandler(auth);

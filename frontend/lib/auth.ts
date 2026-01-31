/**
 * Better Auth client configuration.
 * This module provides client-side authentication functions.
 */

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client instance.
 * Provides hooks and functions for authentication in client components.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

/**
 * Export commonly used auth functions and hooks.
 */
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

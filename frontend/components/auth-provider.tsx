"use client";

/**
 * Better Auth session provider wrapper.
 * Provides authentication context to all child components.
 */

import { SessionProvider } from "better-auth/react";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication provider component.
 * Wraps the application with Better Auth session context.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}

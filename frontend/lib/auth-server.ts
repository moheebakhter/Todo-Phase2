/**
 * Better Auth server configuration with JWT plugin.
 * This module configures the server-side authentication.
 */

import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

/**
 * Better Auth server instance with JWT support.
 *
 * Configuration:
 * - Uses PostgreSQL for session storage (via DATABASE_URL)
 * - JWT plugin enabled for stateless token authentication
 * - Secret must match backend JWT_SECRET for verification
 */
export const auth = betterAuth({
  database: {
    type: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    jwt({
      jwt: {
        // JWT configuration for backend verification
        expirationTime: "15m",
      },
    }),
  ],
  session: {
    // Session configuration
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
});

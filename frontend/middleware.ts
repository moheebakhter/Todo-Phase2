/**
 * Next.js middleware for route protection.
 * Redirects unauthenticated users from protected routes to login.
 *
 * SECURITY NOTE: This middleware provides early redirect for UX purposes.
 * Actual authentication is enforced at:
 * 1. API layer (backend JWT verification on every request)
 * 2. Client-side session validation in protected components
 *
 * Even if a user bypasses this middleware with a fake cookie, they will
 * receive 401 errors from the API and be redirected to login.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protected route patterns that require authentication.
 */
const protectedPatterns = ["/dashboard"];

/**
 * Auth route patterns (login, signup) - redirect if already authenticated.
 */
const authPatterns = ["/login", "/signup"];

/**
 * Validate session cookie format.
 * Checks that the cookie value has a valid structure.
 */
function hasValidSessionFormat(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  // Better Auth session tokens should be non-empty strings
  // Additional format validation can be added here
  return cookieValue.length > 20; // Session tokens are typically longer
}

/**
 * Middleware function to protect routes.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the session cookie exists and has valid format
  // Better Auth uses 'better-auth.session_token' cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isAuthenticated = hasValidSessionFormat(sessionCookie?.value);

  // Check if accessing a protected route
  const isProtectedRoute = protectedPatterns.some((pattern) =>
    pathname.startsWith(pattern)
  );

  // Check if accessing an auth route (login/signup)
  const isAuthRoute = authPatterns.some((pattern) =>
    pathname.startsWith(pattern)
  );

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

/**
 * Configure which routes the middleware runs on.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (API routes handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};

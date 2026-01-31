"use client";

/**
 * Landing page that redirects based on authentication status.
 * - Authenticated users → /dashboard
 * - Unauthenticated users → /login
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      if (session) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [session, isPending, router]);

  // Show loading state while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--foreground)] mx-auto" />
        <p className="mt-4 text-[var(--muted)]">Loading...</p>
      </div>
    </div>
  );
}

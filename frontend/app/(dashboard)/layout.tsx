"use client";

/**
 * Dashboard layout with header and sign out functionality.
 * Protected layout for authenticated users only.
 */

import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--secondary)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Todo App</h1>
          <div className="flex items-center gap-4">
            {session?.user?.email && (
              <span className="text-sm text-[var(--muted)] hidden sm:inline">
                {session.user.email}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

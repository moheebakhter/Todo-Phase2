/**
 * Not found page for dashboard routes.
 */

import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="mx-auto h-12 w-12 text-[var(--muted-foreground)]">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
        Page not found
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center h-10 px-4 py-2 font-medium rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

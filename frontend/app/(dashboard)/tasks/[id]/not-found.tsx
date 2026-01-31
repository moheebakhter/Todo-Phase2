/**
 * Not found page for task detail routes.
 */

import Link from "next/link";

export default function TaskNotFound() {
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
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
        Task not found
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        This task may have been deleted or you don&apos;t have access to it.
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

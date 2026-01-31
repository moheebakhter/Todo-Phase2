/**
 * Loading skeleton for dashboard page.
 */

export default function DashboardLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
      {/* Form skeleton */}
      <section>
        <div className="h-6 w-40 bg-[var(--muted)] rounded mb-4" />
        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--secondary)] space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-12 bg-[var(--muted)] rounded" />
            <div className="h-10 bg-[var(--muted)] rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-[var(--muted)] rounded" />
            <div className="h-20 bg-[var(--muted)] rounded" />
          </div>
          <div className="h-10 w-24 bg-[var(--muted)] rounded" />
        </div>
      </section>

      {/* List skeleton */}
      <section>
        <div className="h-6 w-32 bg-[var(--muted)] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-[var(--border)] bg-[var(--secondary)]"
            >
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 bg-[var(--muted)] rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-[var(--muted)] rounded" />
                  <div className="h-4 w-1/2 bg-[var(--muted)] rounded" />
                  <div className="h-3 w-24 bg-[var(--muted)] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

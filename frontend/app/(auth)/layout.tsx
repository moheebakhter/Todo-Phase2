/**
 * Auth layout with centered form container.
 * Used for login and signup pages.
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Todo App
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Manage your tasks efficiently
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

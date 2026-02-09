"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { user, isLoading, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(callbackUrl);
    }
  }, [user, isLoading, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push(callbackUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#010d0a]">
        <div className="w-6 h-6 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010d0a] px-4">
      {/* Center Wrapper */}
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-md shadow-xl">
          <h1 className="text-2xl font-semibold text-white mb-1">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Sign in to continue
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-md bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-md bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-emerald-600 hover:bg-emerald-500 transition rounded-md text-white font-medium"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-400 text-center">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-emerald-400 hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

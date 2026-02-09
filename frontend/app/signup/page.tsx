"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export default function SignupPage() {
  const router = useRouter();
  const { user, isLoading, signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const name = email.split("@")[0];
      await signUp(email, password, name);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
            Create Account
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Get started with TaskFlow
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 px-3 rounded-md bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-11 px-3 rounded-md bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-11 px-3 rounded-md bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-emerald-600 hover:bg-emerald-500 transition rounded-md text-white font-medium"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-400 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

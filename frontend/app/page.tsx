"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[#1cd98e]/30 border-t-[#1cd98e] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading TaskFlow...</p>
      </div>
    </div>
  );
}

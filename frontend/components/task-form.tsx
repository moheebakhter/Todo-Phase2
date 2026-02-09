"use client";

import { useState } from "react";
import type { TaskCreate } from "@/types";

interface TaskFormProps {
  onSubmit: (data: TaskCreate) => Promise<void>;
  loading?: boolean;
}

export function TaskForm({ onSubmit, loading = false }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: null,
      });
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 h-12 px-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
          maxLength={255}
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="h-12 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
          Add
        </button>
      </div>
    </form>
  );
}

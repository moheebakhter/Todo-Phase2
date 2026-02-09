"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { tasksApi } from "@/lib/api-client";
import type { Task } from "@/types";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Fetch task
  useEffect(() => {
    if (user && taskId) {
      fetchTask();
    }
  }, [user, taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.get(taskId);
      setTask(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!task || !title.trim()) return;

    setSaving(true);
    try {
      const updated = await tasksApi.update(task.id, {
        title: title.trim(),
        description: description.trim() || null,
      });
      setTask(updated);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!task) return;

    try {
      const updated = await tasksApi.toggle(task.id);
      setTask(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    setDeleting(true);
    try {
      await tasksApi.delete(task.id);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      setDeleting(false);
    }
  };

  // Show loading while checking auth
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1cd98e]/30 border-t-[#1cd98e] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#031811]/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Tasks
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1cd98e] to-[#15b574] flex items-center justify-center shadow-lg shadow-[#1cd98e]/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">TaskFlow</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#1cd98e]/30 border-t-[#1cd98e] rounded-full animate-spin" />
          </div>
        ) : error && !task ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-400 mb-4 text-lg">{error}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[#1cd98e] hover:text-[#2ee9a0] font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Go back to dashboard
            </Link>
          </div>
        ) : task ? (
          <div className="space-y-6">
            {/* Page Title */}
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-white">Edit Task</h1>
              <p className="text-gray-400 mt-1">Update your task details below</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Main Card */}
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={handleToggle}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    task.is_completed
                      ? "bg-[#1cd98e]/10 text-[#1cd98e] border border-[#1cd98e]/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                    task.is_completed
                      ? "bg-gradient-to-br from-[#1cd98e] to-[#15b574] border-transparent"
                      : "border-amber-400/50"
                  }`}>
                    {task.is_completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {task.is_completed ? "Completed" : "Pending"}
                  </span>
                </button>
              </div>

              {/* Title Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-xl text-white text-lg placeholder:text-gray-500 focus:outline-none focus:border-[#1cd98e]/50 focus:ring-1 focus:ring-[#1cd98e]/50 transition-all"
                />
              </div>

              {/* Description Textarea */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a detailed description..."
                  rows={5}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#1cd98e]/50 focus:ring-1 focus:ring-[#1cd98e]/50 transition-all resize-none"
                />
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-6 mb-8 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created</p>
                  <p className="text-sm text-gray-300">{new Date(task.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                  <p className="text-sm text-gray-300">{new Date(task.updated_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !title.trim()}
                  className="h-12 px-8 bg-gradient-to-r from-[#1cd98e] to-[#15b574] hover:from-[#2ee9a0] hover:to-[#1cd98e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-[#1cd98e]/20 hover:shadow-[#1cd98e]/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </span>
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-12 px-8 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-xl transition-all flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
                >
                  {deleting ? (
                    <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Task
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

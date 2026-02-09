"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { tasksApi, ApiError } from "@/lib/api-client";
import type { Task } from "@/types";

export default function DashboardPage() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">(
    "all"
  );

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  // Fetch tasks on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.list();
      setTasks(data);
      setError("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setCreating(true);
    try {
      const newTask = await tasksApi.create({ title: newTaskTitle.trim() });
      setTasks((prev) => [newTask, ...prev]);
      setNewTaskTitle("");
      setError("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      const updated = await tasksApi.toggle(task.id);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  // ── loading / auth guard ────────────────────────────────────────────
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1cd98e]/30 border-t-[#1cd98e] rounded-full animate-spin" />
      </div>
    );
  }

  // ── derived state ───────────────────────────────────────────────────
  const completedCount = tasks.filter((t) => t.is_completed).length;
  const pendingCount = tasks.filter((t) => !t.is_completed).length;
  const progressPercent =
    tasks.length > 0
      ? Math.round((completedCount / tasks.length) * 100)
      : 0;

  const filteredTasks =
    filter === "all"
      ? tasks
      : tasks.filter((t) =>
          filter === "completed" ? t.is_completed : !t.is_completed
        );

  // ── render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#010d0a]">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#031811]/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1cd98e] to-[#15b574] flex items-center justify-center shadow-lg shadow-[#1cd98e]/20">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">
                TaskFlow
              </span>
            </div>

            {/* User info + sign out */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1cd98e]/20 to-[#15b574]/20 flex items-center justify-center text-[#1cd98e] text-sm font-medium flex-shrink-0">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm text-gray-400 truncate max-w-[180px] hidden sm:inline">
                {user.email}
              </span>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <button
                onClick={signOut}
                className="text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Welcome back<span className="text-[#1cd98e]">!</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Logged in as{" "}
            <span className="text-gray-300">{user.email}</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="rounded-2xl p-4 sm:p-5 bg-white/5 border border-white/5">
            <p className="text-xs sm:text-sm text-gray-400">Total</p>
            <p className="text-2xl font-bold text-white">{tasks.length}</p>
          </div>
          <div className="rounded-2xl p-4 sm:p-5 bg-white/5 border border-white/5">
            <p className="text-xs sm:text-sm text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-[#1cd98e]">
              {completedCount}
            </p>
          </div>
          <div className="rounded-2xl p-4 sm:p-5 bg-white/5 border border-white/5">
            <p className="text-xs sm:text-sm text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-amber-400">
              {pendingCount}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {tasks.length > 0 && (
          <div className="rounded-2xl p-4 sm:p-5 bg-white/5 border border-white/5 mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-300">Overall Progress</span>
              <span className="text-sm text-[#1cd98e]">
                {progressPercent}%
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1cd98e] to-[#15b574] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* New Task Form */}
        <form onSubmit={handleCreateTask} className="mb-6 flex gap-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 h-12 sm:h-14 px-4 sm:px-5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#1cd98e]/40 transition-colors"
          />
          <button
            type="submit"
            disabled={creating || !newTaskTitle.trim()}
            className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-[#1cd98e] to-[#15b574] text-white font-semibold rounded-xl disabled:opacity-40 hover:shadow-lg hover:shadow-[#1cd98e]/20 transition-all"
          >
            {creating ? "..." : "Add"}
          </button>
        </form>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {(["all", "completed", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[#1cd98e] text-black"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {f === "all"
                ? `All (${tasks.length})`
                : f === "completed"
                ? `Completed (${completedCount})`
                : `Pending (${pendingCount})`}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/5">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-[#1cd98e]/30 border-t-[#1cd98e] rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {filter === "all"
                ? "No tasks yet — add one above!"
                : `No ${filter} tasks`}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-white/5 last:border-b-0 group hover:bg-white/[0.02] transition-colors"
              >
                {/* Toggle checkbox */}
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    task.is_completed
                      ? "bg-[#1cd98e] border-[#1cd98e]"
                      : "border-gray-600 hover:border-[#1cd98e]"
                  }`}
                  title={
                    task.is_completed
                      ? "Mark as pending"
                      : "Mark as completed"
                  }
                >
                  {task.is_completed && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                {/* Task title */}
                <span
                  className={`flex-1 text-sm sm:text-base transition-colors ${
                    task.is_completed
                      ? "line-through text-gray-500"
                      : "text-white"
                  }`}
                >
                  {task.title}
                </span>

                {/* Status badge */}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    task.is_completed
                      ? "bg-[#1cd98e]/10 text-[#1cd98e]"
                      : "bg-amber-400/10 text-amber-400"
                  }`}
                >
                  {task.is_completed ? "Done" : "Pending"}
                </span>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-400/60 hover:text-red-400 text-sm opacity-0 group-hover:opacity-100 transition-all ml-1"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    {/* ─── Big Footer ───────────────────────────────────────── */}
<footer className="mt-16 border-t border-white/5 bg-gradient-to-b from-[#031811]/80 to-[#010d0a]">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
    
    {/* Top section */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
      
      {/* Brand */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1cd98e] to-[#15b574] flex items-center justify-center shadow-lg shadow-[#1cd98e]/20">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold text-white">
            TaskFlow
          </span>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed">
          TaskFlow is a modern task management dashboard designed to help
          you stay organized, focused, and productive every single day.
        </p>
      </div>

      {/* Features */}
      <div>
        <h3 className="text-white font-semibold mb-4">
          Features
        </h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>✔ Smart task tracking</li>
          <li>✔ Real-time progress insights</li>
          <li>✔ Clean & minimal interface</li>
          <li>✔ Secure authentication</li>
        </ul>
      </div>

      {/* Info */}
      <div>
        <h3 className="text-white font-semibold mb-4">
          Information
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="#"
              className="text-gray-400 hover:text-[#1cd98e] transition-colors"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <a
              href="#"
              className="text-gray-400 hover:text-[#1cd98e] transition-colors"
            >
              Terms & Conditions
            </a>
          </li>
          <li className="text-gray-500">
            Version 1.0.0
          </li>
        </ul>
      </div>

    </div>

    {/* Bottom section */}
    <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-gray-500 text-center sm:text-left">
        © {new Date().getFullYear()}{" "}
        <span className="text-[#1cd98e] font-medium">TaskFlow</span>.  
        All rights reserved.
      </p>

      <p className="text-sm text-gray-600 text-center">
        Designed & developed for productivity and clarity.
      </p>
    </div>

  </div>
</footer>

    </div>
  );
}

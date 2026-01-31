"use client";

/**
 * Main dashboard page with task list and creation form.
 */

import { useEffect, useState, useCallback } from "react";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { tasksApi, ApiError } from "@/lib/api-client";
import type { Task, TaskCreate } from "@/types";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks on mount
  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const data = await tasksApi.list();
      setTasks(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to load tasks: ${err.message}`);
      } else {
        setError("Failed to load tasks");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create a new task
  const handleCreate = async (data: TaskCreate) => {
    setCreating(true);
    try {
      const newTask = await tasksApi.create(data);
      setTasks((prev) => [newTask, ...prev]);
    } finally {
      setCreating(false);
    }
  };

  // Toggle task completion
  const handleToggle = async (id: string) => {
    const updatedTask = await tasksApi.toggle(id);
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? updatedTask : task))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--foreground)] mx-auto" />
          <p className="mt-4 text-[var(--muted)]">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Task creation form */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--secondary)]">
          <TaskForm onSubmit={handleCreate} loading={creating} />
        </div>
      </section>

      {/* Error display */}
      {error && (
        <div className="p-4 text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 rounded-md">
          {error}
          <button
            onClick={fetchTasks}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Task list */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Your Tasks ({tasks.length})
        </h2>
        <TaskList tasks={tasks} onToggle={handleToggle} />
      </section>
    </div>
  );
}

"use client";

/**
 * Task detail page with edit and delete functionality.
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { tasksApi, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Task, TaskUpdate } from "@/types";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetch task on mount
  const fetchTask = useCallback(async () => {
    try {
      setError(null);
      const data = await tasksApi.get(taskId);
      setTask(data);
      setTitle(data.title);
      setDescription(data.description || "");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Task not found");
      } else {
        setError("Failed to load task");
      }
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setSaving(true);
    try {
      const updateData: TaskUpdate = {};
      if (title !== task.title) updateData.title = title;
      if (description !== (task.description || ""))
        updateData.description = description || null;

      const updatedTask = await tasksApi.update(taskId, updateData);
      setTask(updatedTask);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Delete task
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tasksApi.delete(taskId);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Toggle completion
  const handleToggle = async () => {
    if (!task) return;
    try {
      const updatedTask = await tasksApi.toggle(taskId);
      setTask(updatedTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle task");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--foreground)] mx-auto" />
          <p className="mt-4 text-[var(--muted)]">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error === "Task not found" || !task) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Task not found
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          This task may have been deleted or you don&apos;t have access to it.
        </p>
        <div className="mt-6">
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-6"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to tasks
      </Link>

      {/* Error display */}
      {error && error !== "Task not found" && (
        <div className="mb-6 p-4 text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 rounded-md">
          {error}
        </div>
      )}

      {/* Task form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--secondary)]">
          {/* Completion toggle */}
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={handleToggle}
              className={`
                h-6 w-6 rounded border-2 flex items-center justify-center
                transition-colors cursor-pointer
                ${
                  task.is_completed
                    ? "bg-[var(--primary)] border-[var(--primary)]"
                    : "border-[var(--muted)] hover:border-[var(--foreground)]"
                }
              `}
            >
              {task.is_completed && (
                <svg
                  className="h-4 w-4 text-[var(--primary-foreground)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span
              className={`text-sm ${task.is_completed ? "text-[var(--muted)]" : "text-[var(--foreground)]"}`}
            >
              {task.is_completed ? "Completed" : "Mark as complete"}
            </span>
          </div>

          {/* Title */}
          <Input
            label="Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={255}
          />

          {/* Description */}
          <div className="mt-4 flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="
                flex w-full rounded-md border border-[var(--input)]
                bg-transparent px-3 py-2 text-sm
                placeholder:text-[var(--muted-foreground)]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2
                resize-none
              "
            />
          </div>

          {/* Metadata */}
          <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
            <p>Created: {new Date(task.created_at).toLocaleString()}</p>
            <p>Updated: {new Date(task.updated_at).toLocaleString()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>

          {!showDeleteConfirm ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Task
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--muted)]">Are you sure?</span>
              <Button
                type="button"
                variant="destructive"
                loading={deleting}
                onClick={handleDelete}
              >
                Yes, Delete
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

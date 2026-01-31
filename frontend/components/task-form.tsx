"use client";

/**
 * Task creation form component.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TaskCreate } from "@/types";

interface TaskFormProps {
  onSubmit: (data: TaskCreate) => Promise<void>;
  loading?: boolean;
}

/**
 * Form for creating a new task.
 * Title is required, description is optional.
 */
export function TaskForm({ onSubmit, loading = false }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
        description: description.trim() || null,
      });
      // Clear form on success
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 rounded-md">
          {error}
        </div>
      )}

      <Input
        label="Title"
        name="title"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={255}
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="description"
          className="text-sm font-medium text-[var(--foreground)]"
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Add more details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="
            flex w-full rounded-md border border-[var(--input)]
            bg-transparent px-3 py-2 text-sm
            placeholder:text-[var(--muted-foreground)]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            resize-none
          "
        />
      </div>

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        Add Task
      </Button>
    </form>
  );
}

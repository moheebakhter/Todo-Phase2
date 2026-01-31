"use client";

/**
 * Single task item component with completion toggle.
 */

import { useState } from "react";
import Link from "next/link";
import type { Task } from "@/types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => Promise<void>;
}

/**
 * Displays a single task with checkbox for completion.
 */
export function TaskItem({ task, onToggle }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [optimisticCompleted, setOptimisticCompleted] = useState(task.is_completed);

  const handleToggle = async () => {
    if (isToggling) return;

    // Optimistic update
    setOptimisticCompleted(!optimisticCompleted);
    setIsToggling(true);

    try {
      await onToggle(task.id);
    } catch {
      // Revert on error
      setOptimisticCompleted(task.is_completed);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border border-[var(--border)]
        bg-[var(--secondary)] transition-opacity
        ${optimisticCompleted ? "opacity-60" : ""}
      `}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isToggling}
        className={`
          mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center
          transition-colors cursor-pointer
          ${
            optimisticCompleted
              ? "bg-[var(--primary)] border-[var(--primary)]"
              : "border-[var(--muted)] hover:border-[var(--foreground)]"
          }
        `}
        aria-label={optimisticCompleted ? "Mark as incomplete" : "Mark as complete"}
      >
        {optimisticCompleted && (
          <svg
            className="h-3 w-3 text-[var(--primary-foreground)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Task content */}
      <Link href={`/dashboard/tasks/${task.id}`} className="flex-1 min-w-0">
        <h3
          className={`
            font-medium text-[var(--foreground)] truncate
            ${optimisticCompleted ? "line-through text-[var(--muted)]" : ""}
          `}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">
            {task.description}
          </p>
        )}
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Created {new Date(task.created_at).toLocaleDateString()}
        </p>
      </Link>
    </div>
  );
}

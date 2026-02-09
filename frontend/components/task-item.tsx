"use client";

import { useState } from "react";
import Link from "next/link";
import type { Task } from "@/types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => Promise<void>;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [optimisticCompleted, setOptimisticCompleted] = useState(task.is_completed);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isToggling) return;

    setOptimisticCompleted(!optimisticCompleted);
    setIsToggling(true);

    try {
      await onToggle(task.id);
    } catch {
      setOptimisticCompleted(task.is_completed);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 transition-all hover:border-slate-700 ${optimisticCompleted ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            optimisticCompleted
              ? "bg-emerald-600 border-emerald-600"
              : "border-slate-600 hover:border-indigo-500"
          }`}
        >
          {optimisticCompleted && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <Link href={`/dashboard/tasks/${task.id}`} className="flex-1 min-w-0">
          <p className={`font-medium ${optimisticCompleted ? "text-slate-500 line-through" : "text-white"}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-sm text-slate-500 mt-1 truncate">{task.description}</p>
          )}
        </Link>

        {/* Status Badge */}
        <span className={`px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
          optimisticCompleted
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-amber-500/20 text-amber-400"
        }`}>
          {optimisticCompleted ? "Done" : "Pending"}
        </span>

        {/* View Link */}
        <Link
          href={`/dashboard/tasks/${task.id}`}
          className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

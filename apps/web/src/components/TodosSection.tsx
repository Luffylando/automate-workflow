"use client";

import { FormEvent, useState } from "react";
import {
  DASHBOARD_PANEL_HEIGHT_CLASS,
  DASHBOARD_SCROLL_AREA_CLASS,
} from "@/lib/dashboard-layout";
import {
  EMPTY_STATE_COMPACT_CLASS,
  EMPTY_STATE_DEFAULT_CLASS,
  ERROR_BANNER_CLASS,
  ERROR_BANNER_COMPACT_CLASS,
  INPUT_COMPACT_CLASS,
  INPUT_DEFAULT_CLASS,
  LIST_ITEM_CLASS,
  PANEL_COMPACT_CLASS,
  PANEL_DEFAULT_CLASS,
  PANEL_SECTION_HEADER_CLASS,
  TEXT_HEADING_CLASS,
  TEXT_MUTED_CLASS,
  TEXT_SUBTLE_CLASS,
} from "@/lib/theme-classes";
import type { Todo, TodoPriority, TodoStatus } from "@/lib/types";

interface TodosSectionProps {
  initialTodos: Todo[];
  variant?: "default" | "compact";
  canRate?: boolean;
  fixedHeight?: boolean;
}

const RATING_VALUES = [1, 2, 3, 4, 5] as const;
const PRIORITY_OPTIONS: TodoPriority[] = ["low", "medium", "high"];

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: "Low",
  medium: "Med",
  high: "High",
};

const PRIORITY_CLASSES: Record<TodoPriority, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800/70 dark:text-slate-300",
  medium:
    "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  high: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
};

const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

const STATUS_CLASSES: Record<TodoStatus, string> = {
  todo: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-300",
  in_progress:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  cancelled:
    "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
};

function formatAverageRating(average: number | null | undefined): string | null {
  if (average == null) {
    return null;
  }

  return average.toFixed(1);
}

function formatDueDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function isOverdue(todo: Todo): boolean {
  if (!todo.dueDate || todo.status === "done" || todo.status === "cancelled") {
    return false;
  }

  return new Date(todo.dueDate).getTime() < Date.now();
}

function parseTagsInput(value: string): string[] {
  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))];
}

export function TodosSection({
  initialTodos,
  variant = "default",
  canRate = false,
  fixedHeight = false,
}: TodosSectionProps) {
  const [todos, setTodos] = useState(initialTodos);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<TodoPriority>("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newTags, setNewTags] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ratingTodoId, setRatingTodoId] = useState<string | null>(null);

  const isCompact = variant === "compact";
  const useFixedPanelHeight = isCompact && fixedHeight;

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const tags = parseTagsInput(newTags);
    const payload: Record<string, unknown> = {
      title,
      priority: newPriority,
    };

    if (newDueDate) {
      payload.dueDate = new Date(`${newDueDate}T12:00:00.000Z`).toISOString();
    }

    if (tags.length > 0) {
      payload.tags = tags;
    }

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as Todo | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error : "Failed to create todo",
        );
      }

      setTodos((current) => [data as Todo, ...current]);
      setNewTitle("");
      setNewPriority("medium");
      setNewDueDate("");
      setNewTags("");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create todo",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(todo: Todo) {
    setError(null);

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      const data = (await response.json()) as Todo | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error : "Failed to update todo",
        );
      }

      setTodos((current) =>
        current.map((item) => (item.id === todo.id ? (data as Todo) : item)),
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Failed to update todo",
      );
    }
  }

  function startEditing(todo: Todo) {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
  }

  async function handleUpdate(todoId: string) {
    const title = editTitle.trim();
    if (!title) {
      setError("Title cannot be empty");
      return;
    }

    setError(null);

    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const data = (await response.json()) as Todo | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error : "Failed to update todo",
        );
      }

      setTodos((current) =>
        current.map((item) => (item.id === todoId ? (data as Todo) : item)),
      );
      cancelEditing();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update todo",
      );
    }
  }

  async function handleRate(todoId: string, value: number) {
    setRatingTodoId(todoId);
    setError(null);

    try {
      const response = await fetch(`/api/todos/${todoId}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      const data = (await response.json()) as
        | { value: number }
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error : "Failed to rate todo",
        );
      }

      setTodos((current) =>
        current.map((item) => {
          if (item.id !== todoId) {
            return item;
          }

          const previousCount = item.ratingCount ?? 0;
          const previousAverage = item.averageRating ?? 0;
          const nextCount = previousCount + 1;
          const nextAverage =
            previousCount === 0
              ? value
              : (previousAverage * previousCount + value) / nextCount;

          return {
            ...item,
            myRating: value,
            ratingCount: nextCount,
            averageRating: nextAverage,
          };
        }),
      );
    } catch (rateError) {
      setError(
        rateError instanceof Error ? rateError.message : "Failed to rate todo",
      );
    } finally {
      setRatingTodoId(null);
    }
  }

  async function handleDelete(todoId: string) {
    setError(null);

    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to delete todo");
      }

      setTodos((current) => current.filter((item) => item.id !== todoId));
      if (editingId === todoId) {
        cancelEditing();
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete todo",
      );
    }
  }

  const openCount = todos.filter(
    (todo) => todo.status !== "done" && todo.status !== "cancelled",
  ).length;
  const doneCount = todos.filter((todo) => todo.status === "done").length;
  const inProgressCount = todos.filter(
    (todo) => todo.status === "in_progress",
  ).length;
  const overdueCount = todos.filter((todo) => isOverdue(todo)).length;
  const highPriorityCount = todos.filter(
    (todo) =>
      todo.priority === "high" &&
      todo.status !== "done" &&
      todo.status !== "cancelled",
  ).length;

  const summaryParts = [`${openCount} open`, `${doneCount} done`];
  if (inProgressCount > 0) {
    summaryParts.push(`${inProgressCount} in progress`);
  }
  if (overdueCount > 0) {
    summaryParts.push(`${overdueCount} overdue`);
  }
  if (highPriorityCount > 0) {
    summaryParts.push(`${highPriorityCount} high`);
  }

  return (
    <section
      className={
        isCompact
          ? `${PANEL_COMPACT_CLASS} ${
              useFixedPanelHeight
                ? DASHBOARD_PANEL_HEIGHT_CLASS
                : "h-full"
            }`
          : PANEL_DEFAULT_CLASS
      }
    >
      <div
        className={isCompact ? PANEL_SECTION_HEADER_CLASS : "mb-6"}
      >
        <div>
          {!isCompact ? (
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
              <span
                className="h-2 w-2 rounded-full bg-indigo-500"
                aria-hidden="true"
              />
              Task list
            </div>
          ) : null}
          <h2
            className={
              isCompact
                ? `text-sm ${TEXT_HEADING_CLASS}`
                : "text-2xl font-semibold brand-gradient-text"
            }
          >
            Todos
          </h2>
          {!isCompact ? (
            <p className={`mt-1 ${TEXT_MUTED_CLASS}`}>
              Tasks with priority, due dates, status, and tags.
            </p>
          ) : (
            <p className={`text-xs ${TEXT_SUBTLE_CLASS}`}>
              {summaryParts.join(" · ")}
            </p>
          )}
        </div>
      </div>

      <div
        className={
          isCompact
            ? "flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3"
            : ""
        }
      >
        <form
          onSubmit={handleCreate}
          className={
            isCompact
              ? `flex shrink-0 flex-col gap-2 ${useFixedPanelHeight ? "mb-2" : "mb-3"}`
              : "mb-6 space-y-3"
          }
        >
          <div className={isCompact ? "flex gap-2" : "flex gap-3"}>
            <input
              type="text"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Add a todo..."
              className={
                isCompact
                  ? `min-w-0 flex-1 ${INPUT_COMPACT_CLASS}`
                  : `flex-1 ${INPUT_DEFAULT_CLASS}`
              }
              aria-label="New todo title"
            />
            <button
              type="submit"
              disabled={submitting || !newTitle.trim()}
              className={
                isCompact
                  ? "shrink-0 rounded-lg brand-gradient-bg px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  : "rounded-xl brand-gradient-bg px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-300/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              }
            >
              {submitting ? "..." : "Add"}
            </button>
          </div>
          <div
            className={
              isCompact
                ? "grid grid-cols-3 gap-2"
                : "grid gap-3 sm:grid-cols-3"
            }
          >
            <select
              value={newPriority}
              onChange={(event) =>
                setNewPriority(event.target.value as TodoPriority)
              }
              className={isCompact ? INPUT_COMPACT_CLASS : INPUT_DEFAULT_CLASS}
              aria-label="New todo priority"
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]} priority
                </option>
              ))}
            </select>
            <input
              type="date"
              value={newDueDate}
              onChange={(event) => setNewDueDate(event.target.value)}
              className={isCompact ? INPUT_COMPACT_CLASS : INPUT_DEFAULT_CLASS}
              aria-label="New todo due date"
            />
            <input
              type="text"
              value={newTags}
              onChange={(event) => setNewTags(event.target.value)}
              placeholder="Tags (comma-separated)"
              className={isCompact ? INPUT_COMPACT_CLASS : INPUT_DEFAULT_CLASS}
              aria-label="New todo tags"
            />
          </div>
        </form>

        {error ? (
          <p
            className={
              isCompact ? ERROR_BANNER_COMPACT_CLASS : ERROR_BANNER_CLASS
            }
          >
            {error}
          </p>
        ) : null}

        <div
          className={
            useFixedPanelHeight
              ? DASHBOARD_SCROLL_AREA_CLASS
              : isCompact
                ? "max-h-72 overflow-y-auto pr-0.5"
                : ""
          }
        >
        {todos.length === 0 ? (
          <div
            className={
              isCompact ? EMPTY_STATE_COMPACT_CLASS : EMPTY_STATE_DEFAULT_CLASS
            }
          >
            <p
              className={
                isCompact
                  ? `text-xs font-medium ${TEXT_MUTED_CLASS}`
                  : `text-sm font-medium ${TEXT_MUTED_CLASS}`
              }
            >
              No todos yet.
            </p>
            {!isCompact ? (
              <p className={`mt-1 text-xs ${TEXT_SUBTLE_CLASS}`}>
                Add your first task above to get started.
              </p>
            ) : null}
          </div>
        ) : (
          <ul
            className={
              isCompact ? "space-y-1" : "space-y-2"
            }
          >
            {todos.map((todo) => {
              const dueLabel = formatDueDate(todo.dueDate);
              const overdue = isOverdue(todo);

              return (
              <li
                key={todo.id}
                className={`${LIST_ITEM_CLASS} ${
                  isCompact
                    ? "flex-col items-stretch gap-1.5 px-2.5 py-1.5"
                    : "justify-between gap-4 px-4 py-3"
                } ${todo.completed ? "opacity-70" : ""}`}
              >
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => void handleToggle(todo)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-border text-brand-from focus:ring-brand-via"
                    aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
                  />
                  <div className="min-w-0 flex-1">
                    {editingId === todo.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        className={`min-w-0 w-full ${INPUT_COMPACT_CLASS}`}
                        aria-label="Edit todo title"
                      />
                    ) : (
                      <span
                        className={`block truncate ${
                          isCompact ? "text-xs" : "text-sm"
                        } ${
                          todo.completed
                            ? "text-emerald-600 line-through decoration-emerald-400 dark:text-emerald-400 dark:decoration-emerald-600"
                            : `font-medium ${TEXT_HEADING_CLASS}`
                        }`}
                      >
                        {todo.title}
                      </span>
                    )}
                    <div
                      className={`mt-1 flex flex-wrap items-center gap-1 ${
                        isCompact ? "text-[10px]" : "text-[11px]"
                      }`}
                    >
                      <span
                        className={`rounded px-1.5 py-0.5 font-medium ${PRIORITY_CLASSES[todo.priority]}`}
                      >
                        {PRIORITY_LABELS[todo.priority]}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-medium ${STATUS_CLASSES[todo.status]}`}
                      >
                        {STATUS_LABELS[todo.status]}
                      </span>
                      {dueLabel ? (
                        <span
                          className={`rounded px-1.5 py-0.5 font-medium ${
                            overdue
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                              : "bg-surface-muted text-muted"
                          }`}
                        >
                          {overdue ? "Overdue" : "Due"} {dueLabel}
                        </span>
                      ) : null}
                      {todo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-violet-100 px-1.5 py-0.5 font-medium text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
                  <div className="flex flex-col items-end gap-0.5">
                    {todo.ratingCount ? (
                      <p
                        className={`${TEXT_SUBTLE_CLASS} ${
                          isCompact ? "text-[10px]" : "text-[11px]"
                        }`}
                      >
                        {formatAverageRating(todo.averageRating)} ★
                        <span className="text-subtle">
                          {" "}
                          ({todo.ratingCount})
                        </span>
                      </p>
                    ) : null}
                    {canRate ? (
                      todo.myRating != null ? (
                        <p
                          className={`font-medium text-amber-600 ${
                            isCompact ? "text-[10px]" : "text-[11px]"
                          }`}
                        >
                          You rated {todo.myRating} ★
                        </p>
                      ) : (
                        <div
                          className="flex items-center gap-0.5"
                          role="group"
                          aria-label={`Rate ${todo.title}`}
                        >
                          {RATING_VALUES.map((value) => (
                            <button
                              key={value}
                              type="button"
                              disabled={ratingTodoId === todo.id}
                              onClick={() => void handleRate(todo.id, value)}
                              className={`rounded px-0.5 font-medium text-amber-500 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/50 dark:hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50 ${
                                isCompact ? "text-[11px]" : "text-xs"
                              }`}
                              aria-label={`Rate ${todo.title} ${value} stars`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      )
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1">
                  {editingId === todo.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleUpdate(todo.id)}
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] text-muted hover:bg-surface-muted"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditing(todo)}
                        className="rounded-md border border-transparent px-1.5 py-0.5 text-[11px] font-medium text-brand-via opacity-0 transition group-hover:opacity-100 hover:border-brand-via/30 hover:bg-surface-muted sm:opacity-100"
                        aria-label={`Edit ${todo.title}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(todo.id)}
                        className="rounded-md border border-transparent px-1.5 py-0.5 text-[11px] font-medium text-rose-600 opacity-0 transition group-hover:opacity-100 hover:border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:hover:border-rose-800/50 dark:hover:bg-rose-950/50 sm:opacity-100"
                        aria-label={`Delete ${todo.title}`}
                      >
                        Del
                      </button>
                    </>
                  )}
                  </div>
                </div>
              </li>
            );
            })}
          </ul>
        )}
        </div>
      </div>
    </section>
  );
}

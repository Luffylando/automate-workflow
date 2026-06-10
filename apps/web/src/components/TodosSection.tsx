"use client";

import { FormEvent, useState } from "react";
import type { Todo } from "@/lib/types";

interface TodosSectionProps {
  initialTodos: Todo[];
  variant?: "default" | "compact";
  canRate?: boolean;
}

const RATING_VALUES = [1, 2, 3, 4, 5] as const;

function formatAverageRating(average: number | null | undefined): string | null {
  if (average == null) {
    return null;
  }

  return average.toFixed(1);
}

export function TodosSection({
  initialTodos,
  variant = "default",
  canRate = false,
}: TodosSectionProps) {
  const [todos, setTodos] = useState(initialTodos);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ratingTodoId, setRatingTodoId] = useState<string | null>(null);

  const isCompact = variant === "compact";

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const data = (await response.json()) as Todo | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error : "Failed to create todo",
        );
      }

      setTodos((current) => [data as Todo, ...current]);
      setNewTitle("");
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

  const completedCount = todos.filter((todo) => todo.completed).length;
  const pendingCount = todos.length - completedCount;

  return (
    <section
      className={
        isCompact
          ? "dashboard-panel flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-indigo-200/50 bg-white/95"
          : "card-glow overflow-hidden rounded-2xl border border-indigo-200/60 bg-white/90 p-8 backdrop-blur-sm"
      }
    >
      <div
        className={
          isCompact
            ? "flex items-center justify-between gap-3 border-b border-indigo-100/80 px-4 py-3"
            : "mb-6"
        }
      >
        <div>
          {!isCompact ? (
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
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
                ? "text-sm font-semibold text-indigo-950"
                : "text-2xl font-semibold brand-gradient-text"
            }
          >
            Todos
          </h2>
          {!isCompact ? (
            <p className="mt-1 text-indigo-900/70">
              Tasks stored in the app database.
            </p>
          ) : (
            <p className="text-xs text-indigo-600/70">
              {pendingCount} open · {completedCount} done
            </p>
          )}
        </div>
      </div>

      <div className={isCompact ? "flex min-h-0 flex-1 flex-col px-4 py-3" : ""}>
        <form
          onSubmit={handleCreate}
          className={
            isCompact
              ? "mb-3 flex gap-2"
              : "mb-6 flex gap-3"
          }
        >
          <input
            type="text"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Add a todo..."
            className={
              isCompact
                ? "min-w-0 flex-1 rounded-lg border border-indigo-200/80 bg-indigo-50/30 px-3 py-1.5 text-xs text-indigo-950 outline-none placeholder:text-indigo-400 focus:border-violet-300 focus:ring-1 focus:ring-violet-300/50"
                : "flex-1 rounded-xl border border-indigo-200 bg-indigo-50/40 px-4 py-2.5 text-sm text-indigo-950 outline-none placeholder:text-indigo-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/50"
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
        </form>

        {error ? (
          <p
            className={
              isCompact
                ? "mb-2 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700"
                : "mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            }
          >
            {error}
          </p>
        ) : null}

        {todos.length === 0 ? (
          <div
            className={
              isCompact
                ? "rounded-lg border border-dashed border-indigo-200/80 bg-indigo-50/40 px-4 py-6 text-center"
                : "rounded-xl border border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-violet-50/60 to-fuchsia-50/80 px-6 py-10 text-center"
            }
          >
            <p
              className={
                isCompact
                  ? "text-xs font-medium text-indigo-700"
                  : "text-sm font-medium text-indigo-700"
              }
            >
              No todos yet.
            </p>
            {!isCompact ? (
              <p className="mt-1 text-xs text-indigo-500">
                Add your first task above to get started.
              </p>
            ) : null}
          </div>
        ) : (
          <ul
            className={
              isCompact
                ? "max-h-72 space-y-1 overflow-y-auto pr-0.5"
                : "space-y-2"
            }
          >
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`group flex items-center gap-2 rounded-lg border border-indigo-100/80 bg-indigo-50/20 transition hover:bg-indigo-50/50 ${
                  isCompact ? "px-2.5 py-1.5" : "justify-between gap-4 px-4 py-3"
                } ${todo.completed ? "opacity-70" : ""}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => void handleToggle(todo)}
                    className="h-3.5 w-3.5 shrink-0 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-400"
                    aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
                  />
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      className="min-w-0 flex-1 rounded-md border border-violet-200 bg-white px-2 py-1 text-xs text-indigo-950 outline-none focus:ring-1 focus:ring-violet-300/50"
                      aria-label="Edit todo title"
                    />
                  ) : (
                    <span
                      className={`truncate ${
                        isCompact ? "text-xs" : "text-sm"
                      } ${
                        todo.completed
                          ? "text-emerald-600 line-through decoration-emerald-400"
                          : "font-medium text-indigo-950"
                      }`}
                    >
                      {todo.title}
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
                  <div className="flex flex-col items-end gap-0.5">
                    {todo.ratingCount ? (
                      <p
                        className={`text-indigo-600/80 ${
                          isCompact ? "text-[10px]" : "text-[11px]"
                        }`}
                      >
                        {formatAverageRating(todo.averageRating)} ★
                        <span className="text-indigo-400">
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
                              className={`rounded px-0.5 font-medium text-amber-500 transition hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-50 ${
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
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditing(todo)}
                        className="rounded-md border border-transparent px-1.5 py-0.5 text-[11px] font-medium text-violet-600 opacity-0 transition group-hover:opacity-100 hover:border-violet-200 hover:bg-violet-50 sm:opacity-100"
                        aria-label={`Edit ${todo.title}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(todo.id)}
                        className="rounded-md border border-transparent px-1.5 py-0.5 text-[11px] font-medium text-rose-600 opacity-0 transition group-hover:opacity-100 hover:border-rose-200 hover:bg-rose-50 sm:opacity-100"
                        aria-label={`Delete ${todo.title}`}
                      >
                        Del
                      </button>
                    </>
                  )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

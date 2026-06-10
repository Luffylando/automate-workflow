"use client";

import { FormEvent, useState } from "react";
import type { Todo } from "@/lib/types";

interface TodosSectionProps {
  initialTodos: Todo[];
}

const TODO_ACCENT_CLASSES = [
  "border-l-indigo-400 bg-indigo-50/50",
  "border-l-violet-400 bg-violet-50/50",
  "border-l-fuchsia-400 bg-fuchsia-50/50",
  "border-l-cyan-400 bg-cyan-50/50",
  "border-l-emerald-400 bg-emerald-50/50",
  "border-l-amber-400 bg-amber-50/50",
] as const;

export function TodosSection({ initialTodos }: TodosSectionProps) {
  const [todos, setTodos] = useState(initialTodos);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <section className="card-glow overflow-hidden rounded-2xl border border-indigo-200/60 bg-white/90 p-8 backdrop-blur-sm">
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
          <span className="h-2 w-2 rounded-full bg-indigo-500" aria-hidden="true" />
          Task list
        </div>
        <h2 className="text-2xl font-semibold brand-gradient-text">Todos</h2>
        <p className="mt-1 text-indigo-900/70">
          Tasks stored in the app database.
        </p>
      </div>

      <form onSubmit={handleCreate} className="mb-6 flex gap-3">
        <input
          type="text"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50/40 px-4 py-2.5 text-sm text-indigo-950 outline-none placeholder:text-indigo-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/50"
          aria-label="New todo title"
        />
        <button
          type="submit"
          disabled={submitting || !newTitle.trim()}
          className="rounded-xl brand-gradient-bg px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-300/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
      </form>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {todos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-violet-50/60 to-fuchsia-50/80 px-6 py-10 text-center">
          <p className="text-sm font-medium text-indigo-700">No todos yet.</p>
          <p className="mt-1 text-xs text-indigo-500">
            Add your first task above to get started.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo, index) => {
            const accentClass =
              TODO_ACCENT_CLASSES[index % TODO_ACCENT_CLASSES.length];

            return (
              <li
                key={todo.id}
                className={`flex items-center justify-between gap-4 rounded-xl border border-indigo-100 border-l-4 px-4 py-3 transition hover:shadow-sm ${accentClass} ${
                  todo.completed ? "opacity-75" : ""
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => void handleToggle(todo)}
                    className="h-4 w-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-400"
                    aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
                  />
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm text-indigo-950 outline-none focus:ring-2 focus:ring-violet-300/50"
                      aria-label="Edit todo title"
                    />
                  ) : (
                    <span
                      className={`truncate text-sm ${
                        todo.completed
                          ? "text-emerald-600 line-through decoration-emerald-400"
                          : "font-medium text-indigo-950"
                      }`}
                    >
                      {todo.title}
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {editingId === todo.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleUpdate(todo.id)}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditing(todo)}
                        className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(todo.id)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

"use client";

import { FormEvent, useState } from "react";
import type { Todo } from "@/lib/types";

interface TodosSectionProps {
  initialTodos: Todo[];
}

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
    <section className="rounded-2xl border border-zinc-200 bg-white p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-zinc-900">Todos</h2>
        <p className="mt-1 text-zinc-600">
          Tasks stored in the app database.
        </p>
      </div>

      <form onSubmit={handleCreate} className="mb-6 flex gap-3">
        <input
          type="text"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
          aria-label="New todo title"
        />
        <button
          type="submit"
          disabled={submitting || !newTitle.trim()}
          className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
      </form>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {todos.length === 0 ? (
        <p className="text-sm text-zinc-500">No todos yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => void handleToggle(todo)}
                  className="h-4 w-4 rounded border-zinc-300"
                  aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
                />
                {editingId === todo.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
                    aria-label="Edit todo title"
                  />
                ) : (
                  <span
                    className={`truncate text-sm ${
                      todo.completed
                        ? "text-zinc-400 line-through"
                        : "font-medium text-zinc-900"
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
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startEditing(todo)}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(todo.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

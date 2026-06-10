"use client";

import { FormEvent, useState } from "react";
import {
  DASHBOARD_PANEL_HEIGHT_CLASS,
  DASHBOARD_SCROLL_AREA_CLASS,
} from "@/lib/dashboard-layout";
import type { User, UserRole } from "@/lib/types";

interface UsersSectionProps {
  initialUsers: User[];
  variant?: "default" | "compact";
  fixedHeight?: boolean;
}

const ROLE_OPTIONS: UserRole[] = ["admin", "user"];

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  admin: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
  user: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

export function UsersSection({
  initialUsers,
  variant = "default",
  fixedHeight = false,
}: UsersSectionProps) {
  const [users, setUsers] = useState(initialUsers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const isCompact = variant === "compact";
  const useFixedPanelHeight = isCompact && fixedHeight;

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
          role,
        }),
      });

      const data = (await response.json()) as User | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error : "Failed to create user",
        );
      }

      setUsers((current) => [data as User, ...current]);
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      if (isCompact) {
        setShowForm(false);
      }
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create user",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setUpdatingRoleId(userId);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = (await response.json()) as User | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error : "Failed to update role",
        );
      }

      setUsers((current) =>
        current.map((user) => (user.id === userId ? (data as User) : user)),
      );
    } catch (roleError) {
      setError(
        roleError instanceof Error
          ? roleError.message
          : "Failed to update role",
      );
    } finally {
      setUpdatingRoleId(null);
    }
  }

  const inputClass = isCompact
    ? "rounded-lg border border-indigo-200/80 bg-indigo-50/30 px-3 py-1.5 text-xs text-indigo-950 outline-none placeholder:text-indigo-400 focus:border-violet-300 focus:ring-1 focus:ring-violet-300/50"
    : "rounded-xl border border-indigo-200 bg-indigo-50/40 px-4 py-2.5 text-sm text-indigo-950 outline-none placeholder:text-indigo-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/50";

  return (
    <section
      className={
        isCompact
          ? `dashboard-panel flex min-h-0 flex-col overflow-hidden rounded-xl border border-indigo-200/50 bg-white/95 ${
              useFixedPanelHeight
                ? DASHBOARD_PANEL_HEIGHT_CLASS
                : "h-full"
            }`
          : "card-glow overflow-hidden rounded-2xl border border-indigo-200/60 bg-white/90 p-8 backdrop-blur-sm"
      }
    >
      <div
        className={
          isCompact
            ? "flex shrink-0 items-center justify-between gap-3 border-b border-indigo-100/80 px-4 py-3"
            : "mb-6"
        }
      >
        <div>
          {!isCompact ? (
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-fuchsia-700">
              <span
                className="h-2 w-2 rounded-full bg-fuchsia-500"
                aria-hidden="true"
              />
              Team
            </div>
          ) : null}
          <h2
            className={
              isCompact
                ? "text-sm font-semibold text-indigo-950"
                : "text-2xl font-semibold brand-gradient-text"
            }
          >
            Users
          </h2>
          {!isCompact ? (
            <p className="mt-1 text-indigo-900/70">
              Create users with login credentials and assign roles. Admin-only.
            </p>
          ) : (
            <p className="text-xs text-indigo-600/70">{users.length} members</p>
          )}
        </div>
        {isCompact ? (
          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
            className="shrink-0 rounded-lg border border-indigo-200/80 bg-white px-2.5 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50"
          >
            {showForm ? "Close" : "+ Add"}
          </button>
        ) : null}
      </div>

      <div
        className={
          isCompact
            ? "flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3"
            : ""
        }
      >
        {(!isCompact || showForm) && (
          <form
            onSubmit={handleCreate}
            className={
              isCompact
                ? `shrink-0 space-y-2 ${useFixedPanelHeight ? "mb-2" : "mb-3"}`
                : "mb-6 space-y-3"
            }
          >
            <div
              className={
                isCompact ? "grid gap-2 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-2"
              }
            >
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                className={inputClass}
                aria-label="New user name"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className={inputClass}
                aria-label="New user email"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password (8+ chars)"
                minLength={8}
                autoComplete="new-password"
                className={`${inputClass} sm:col-span-2`}
                aria-label="New user password"
                required
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-indigo-900">
                Role
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className="rounded-lg border border-indigo-200/80 bg-indigo-50/30 px-2 py-1 text-xs text-indigo-950 outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-300/50"
                  aria-label="New user role"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={
                  submitting ||
                  !name.trim() ||
                  !email.trim() ||
                  password.length < 8
                }
                className={
                  isCompact
                    ? "rounded-lg brand-gradient-bg px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    : "rounded-xl brand-gradient-bg px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-300/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                }
              >
                {submitting ? "Creating..." : "Create user"}
              </button>
            </div>
          </form>
        )}

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

        <div
          className={
            useFixedPanelHeight
              ? DASHBOARD_SCROLL_AREA_CLASS
              : isCompact
                ? "max-h-72 overflow-y-auto pr-0.5"
                : ""
          }
        >
        {users.length === 0 ? (
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
              No users yet.
            </p>
            {!isCompact ? (
              <p className="mt-1 text-xs text-indigo-500">
                Create your first user above.
              </p>
            ) : null}
          </div>
        ) : (
          <ul
            className={
              isCompact ? "space-y-1" : "space-y-2"
            }
          >
            {users.map((user) => (
              <li
                key={user.id}
                className={`flex items-center justify-between gap-2 rounded-lg border border-indigo-100/80 bg-fuchsia-50/20 ${
                  isCompact ? "px-2.5 py-1.5" : "flex-wrap gap-4 px-4 py-3"
                }`}
              >
                <div className="min-w-0">
                  <p
                    className={`truncate font-medium text-indigo-950 ${
                      isCompact ? "text-xs" : ""
                    }`}
                  >
                    {user.name}
                  </p>
                  <p
                    className={`truncate text-indigo-600 ${
                      isCompact ? "text-[11px]" : "text-sm"
                    }`}
                  >
                    {user.email}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ROLE_BADGE_CLASSES[user.role]}`}
                  >
                    {user.role}
                  </span>
                  <select
                    value={user.role}
                    disabled={updatingRoleId === user.id}
                    onChange={(event) =>
                      void handleRoleChange(
                        user.id,
                        event.target.value as UserRole,
                      )
                    }
                    className="rounded-md border border-violet-200 bg-white px-1.5 py-0.5 text-[11px] text-indigo-950 outline-none focus:ring-1 focus:ring-violet-300/50 disabled:opacity-60"
                    aria-label={`Role for ${user.name}`}
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </section>
  );
}

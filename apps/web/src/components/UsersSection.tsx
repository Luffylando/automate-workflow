"use client";

import { FormEvent, useState } from "react";
import {
  DASHBOARD_PANEL_HEIGHT_CLASS,
  DASHBOARD_SCROLL_AREA_CLASS,
} from "@/lib/dashboard-layout";
import {
  BTN_SECONDARY_CLASS,
  EMPTY_STATE_COMPACT_CLASS,
  EMPTY_STATE_DEFAULT_CLASS,
  ERROR_BANNER_CLASS,
  ERROR_BANNER_COMPACT_CLASS,
  INPUT_COMPACT_CLASS,
  INPUT_DEFAULT_CLASS,
  PANEL_COMPACT_CLASS,
  PANEL_DEFAULT_CLASS,
  PANEL_SECTION_HEADER_CLASS,
  ROLE_BADGE_CLASSES,
  TEXT_HEADING_CLASS,
  TEXT_MUTED_CLASS,
  TEXT_SUBTLE_CLASS,
} from "@/lib/theme-classes";
import type { User, UserRole } from "@/lib/types";

interface UsersSectionProps {
  initialUsers: User[];
  variant?: "default" | "compact";
  fixedHeight?: boolean;
}

const ROLE_OPTIONS: UserRole[] = ["admin", "user"];

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

  const inputClass = isCompact ? INPUT_COMPACT_CLASS : INPUT_DEFAULT_CLASS;

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
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300">
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
                ? `text-sm ${TEXT_HEADING_CLASS}`
                : "text-2xl font-semibold brand-gradient-text"
            }
          >
            Users
          </h2>
          {!isCompact ? (
            <p className={`mt-1 ${TEXT_MUTED_CLASS}`}>
              Create users with login credentials and assign roles. Admin-only.
            </p>
          ) : (
            <p className={`text-xs ${TEXT_SUBTLE_CLASS}`}>
              {users.length} members
            </p>
          )}
        </div>
        {isCompact ? (
          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
            className={`shrink-0 px-2.5 py-1 text-[11px] ${BTN_SECONDARY_CLASS}`}
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
              <label className={`flex items-center gap-1.5 text-xs font-medium ${TEXT_HEADING_CLASS}`}>
                Role
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className={`px-2 py-1 ${INPUT_COMPACT_CLASS}`}
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
        {users.length === 0 ? (
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
              No users yet.
            </p>
            {!isCompact ? (
              <p className={`mt-1 text-xs ${TEXT_SUBTLE_CLASS}`}>
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
                className={`flex items-center justify-between gap-2 rounded-lg border border-border-muted bg-fuchsia-50/20 dark:bg-fuchsia-950/20 ${
                  isCompact ? "px-2.5 py-1.5" : "flex-wrap gap-4 px-4 py-3"
                }`}
              >
                <div className="min-w-0">
                  <p
                    className={`truncate font-medium text-foreground ${
                      isCompact ? "text-xs" : ""
                    }`}
                  >
                    {user.name}
                  </p>
                  <p
                    className={`truncate text-muted ${
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
                    className={`rounded-md px-1.5 py-0.5 text-[11px] ${INPUT_COMPACT_CLASS} disabled:opacity-60`}
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

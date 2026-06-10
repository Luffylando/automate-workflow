"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ERROR_BANNER_CLASS,
  INPUT_DEFAULT_CLASS,
  PANEL_DEFAULT_CLASS,
  TEXT_HEADING_CLASS,
  TEXT_MUTED_CLASS,
} from "@/lib/theme-classes";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@localhost");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-gradient relative flex min-h-full flex-1 items-center justify-center px-6 py-16">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className={`w-full max-w-md ${PANEL_DEFAULT_CLASS}`}>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300">
          <span
            className="h-2 w-2 rounded-full bg-fuchsia-500"
            aria-hidden="true"
          />
          Admin access
        </div>
        <h1 className="text-2xl font-semibold brand-gradient-text">
          Admin sign in
        </h1>
        <p className={`mt-2 text-sm ${TEXT_MUTED_CLASS}`}>
          Sign in to manage todos, users, and the prompt console.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium ${TEXT_HEADING_CLASS}`}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`mt-1 w-full px-4 py-3 ${INPUT_DEFAULT_CLASS}`}
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className={`block text-sm font-medium ${TEXT_HEADING_CLASS}`}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`mt-1 w-full px-4 py-3 ${INPUT_DEFAULT_CLASS}`}
              required
            />
          </div>
          {error ? <p className={ERROR_BANNER_CLASS}>{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl brand-gradient-bg px-4 py-3 text-sm font-medium text-white shadow-md shadow-indigo-300/40 transition hover:brightness-110 disabled:opacity-60 dark:shadow-black/30"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link
            href="/"
            className="font-medium text-brand-via underline decoration-brand-via/40 underline-offset-2 hover:text-brand-to"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

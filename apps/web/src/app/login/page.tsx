"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
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
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Login failed");
      }

      router.push("/");
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
    <div className="page-gradient flex min-h-full flex-1 items-center justify-center px-6 py-16">
      <div className="card-glow w-full max-w-md rounded-2xl border border-indigo-200/60 bg-white/90 p-8 backdrop-blur-sm">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-fuchsia-700">
          <span className="h-2 w-2 rounded-full bg-fuchsia-500" aria-hidden="true" />
          Admin access
        </div>
        <h1 className="text-2xl font-semibold brand-gradient-text">
          Admin sign in
        </h1>
        <p className="mt-2 text-sm text-indigo-900/70">
          Only admins can access the prompt console.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-indigo-900"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-indigo-200 bg-indigo-50/40 px-4 py-3 text-sm text-indigo-950 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/50"
              required
            />
          </div>
          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl brand-gradient-bg px-4 py-3 text-sm font-medium text-white shadow-md shadow-indigo-300/40 transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link
            href="/"
            className="font-medium text-violet-700 underline decoration-violet-300 underline-offset-2 hover:text-fuchsia-700"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

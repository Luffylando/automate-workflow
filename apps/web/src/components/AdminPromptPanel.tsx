"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Job } from "@/lib/types";

const POLL_INTERVAL_MS = 2000;

export function AdminPromptPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!activeJob || activeJob.status === "done" || activeJob.status === "failed") {
      return;
    }

    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/jobs/${activeJob.id}`);
      if (!response.ok) {
        return;
      }
      const job = (await response.json()) as Job;
      setActiveJob(job);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [activeJob]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = (await response.json()) as {
        jobId?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit prompt");
      }

      const jobResponse = await fetch(`/api/jobs/${data.jobId}`);
      if (!jobResponse.ok) {
        throw new Error("Prompt submitted but job status could not be loaded");
      }

      const job = (await jobResponse.json()) as Job;
      setActiveJob(job);
      setPrompt("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit prompt",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
      {isOpen ? (
        <section className="flex max-h-[min(32rem,calc(100vh-6rem))] w-[min(24rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-fuchsia-200/70 bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 shadow-xl shadow-fuchsia-200/40">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-fuchsia-200/60 bg-white/50 px-4 py-3 backdrop-blur-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700">
                Admin
              </p>
              <h2 className="text-base font-semibold text-indigo-950">
                Prompt console
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/login";
                }}
                className="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
              >
                Sign out
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-fuchsia-200 bg-white px-3 py-1.5 text-sm font-medium text-fuchsia-700 hover:bg-fuchsia-50"
                aria-label="Close prompt console"
              >
                Close
              </button>
            </div>
          </div>

          <div className="overflow-y-auto p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <label
                className="block text-sm font-medium text-zinc-700"
                htmlFor="prompt"
              >
                Describe the change you want
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={4}
                placeholder="Example: Add a filter bar to the todos list."
                className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm text-indigo-950 outline-none focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-300/50"
                required
              />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button
                type="submit"
                disabled={submitting || !prompt.trim()}
                className="w-full rounded-xl brand-gradient-bg px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-fuchsia-300/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit prompt"}
              </button>
            </form>

            {activeJob ? (
              <div className="mt-4 rounded-xl border border-indigo-100 bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Latest job
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-500">Status</dt>
                    <dd className="font-medium capitalize text-zinc-900">
                      {activeJob.status}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-500">Job ID</dt>
                    <dd className="truncate font-mono text-xs text-zinc-700">
                      {activeJob.id}
                    </dd>
                  </div>
                  {activeJob.agentRunId ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-zinc-500">Agent run</dt>
                      <dd className="truncate font-mono text-xs text-zinc-700">
                        {activeJob.agentRunId}
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-zinc-500">Prompt</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-zinc-800">
                      {activeJob.prompt}
                    </dd>
                  </div>
                  {activeJob.prUrl ? (
                    <div>
                      <dt className="text-zinc-500">Pull request</dt>
                      <dd className="mt-1">
                        <a
                          href={activeJob.prUrl}
                          className="font-medium text-fuchsia-700 underline decoration-fuchsia-300 underline-offset-2"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View PR
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {activeJob.error ? (
                    <div>
                      <dt className="text-zinc-500">Error</dt>
                      <dd className="mt-1 text-red-600">{activeJob.error}</dd>
                    </div>
                  ) : null}
                </dl>
                {activeJob.status === "queued" ||
                activeJob.status === "running" ? (
                  <p className="mt-3 text-xs text-zinc-500">
                    {activeJob.status === "queued"
                      ? "Starting Cursor agent..."
                      : "Agent is editing the repo and opening a pull request. This can take several minutes."}
                  </p>
                ) : null}
                {activeJob.status === "done" && !activeJob.prUrl ? (
                  <p className="mt-3 text-xs text-zinc-500">
                    Agent finished. Check the repository for changes if no PR
                    link appears.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-14 w-14 items-center justify-center rounded-full brand-gradient-bg text-white shadow-lg shadow-fuchsia-300/40 transition hover:brightness-110"
        aria-label={isOpen ? "Minimize prompt console" : "Open prompt console"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}

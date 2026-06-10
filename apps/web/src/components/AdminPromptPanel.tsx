"use client";

import { FormEvent, useEffect, useState } from "react";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import {
  BTN_SECONDARY_CLASS,
  INPUT_DEFAULT_CLASS,
  JOB_PANEL_CLASSES,
  TEXT_HEADING_CLASS,
} from "@/lib/theme-classes";
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
        body: JSON.stringify({
          prompt,
          metadata: { source: "prompt-console" },
        }),
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
        <section className="flex max-h-[min(32rem,calc(100vh-6rem))] w-[min(24rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 shadow-xl shadow-fuchsia-200/40 dark:from-slate-900 dark:via-indigo-950 dark:to-fuchsia-950 dark:shadow-black/40">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-surface/50 px-4 py-3 backdrop-blur-sm dark:bg-surface/70">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-to">
                Admin
              </p>
              <h2 className={`text-base ${TEXT_HEADING_CLASS}`}>
                Prompt console
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`px-3 py-1.5 text-sm ${BTN_SECONDARY_CLASS}`}
              aria-label="Close prompt console"
            >
              Close
            </button>
          </div>

          <div className="overflow-y-auto p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <label
                className={`block text-sm font-medium ${TEXT_HEADING_CLASS}`}
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
                className={`w-full px-4 py-3 ${INPUT_DEFAULT_CLASS}`}
                required
              />
              {error ? (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              ) : null}
              <button
                type="submit"
                disabled={submitting || !prompt.trim()}
                className="w-full rounded-xl brand-gradient-bg px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-fuchsia-300/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit prompt"}
              </button>
            </form>

            {activeJob ? (
              <div
                className={`mt-4 rounded-xl border p-4 shadow-sm ${JOB_PANEL_CLASSES[activeJob.status]}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Latest job
                  </p>
                  <JobStatusBadge status={activeJob.status} />
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-subtle">Job ID</dt>
                    <dd className="truncate font-mono text-xs text-muted">
                      {activeJob.id}
                    </dd>
                  </div>
                  {activeJob.agentRunId ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-subtle">Agent run</dt>
                      <dd className="truncate font-mono text-xs text-muted">
                        {activeJob.agentRunId}
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-subtle">Prompt</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-foreground">
                      {activeJob.prompt}
                    </dd>
                  </div>
                  {activeJob.prUrl ? (
                    <div>
                      <dt className="text-subtle">Pull request</dt>
                      <dd className="mt-1">
                        <a
                          href={activeJob.prUrl}
                          className="font-medium text-brand-to underline decoration-brand-to/40 underline-offset-2"
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
                      <dt className="text-subtle">Error</dt>
                      <dd className="mt-1 text-red-600 dark:text-red-400">
                        {activeJob.error}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                {activeJob.status === "queued" ||
                activeJob.status === "running" ? (
                  <p className="mt-3 text-xs text-subtle">
                    {activeJob.status === "queued"
                      ? "Starting Cursor agent..."
                      : "Agent is editing the repo and opening a pull request ready for review. This can take several minutes."}
                  </p>
                ) : null}
                {activeJob.status === "done" && !activeJob.prUrl ? (
                  <p className="mt-3 text-xs text-subtle">
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

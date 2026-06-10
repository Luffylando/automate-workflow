"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Job } from "@/lib/types";

const POLL_INTERVAL_MS = 2000;

export function AdminPromptPanel() {
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
    <section className="w-full max-w-2xl rounded-2xl border border-violet-200 bg-violet-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
            Admin
          </p>
          <h2 className="text-lg font-semibold text-zinc-900">Prompt console</h2>
        </div>
        <form action="/api/auth/logout" method="post">
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm text-violet-800 hover:bg-violet-100"
          >
            Sign out
          </button>
        </form>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-zinc-700" htmlFor="prompt">
          Describe the change you want
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={5}
          placeholder="Example: Add two buttons and a users list backed by the API."
          className="w-full rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-violet-300 focus:ring-2"
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting || !prompt.trim()}
          className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit prompt"}
        </button>
      </form>

      {activeJob ? (
        <div className="mt-6 rounded-xl border border-violet-100 bg-white p-4">
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
                    className="text-violet-700 underline"
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
          {activeJob.status === "queued" || activeJob.status === "running" ? (
            <p className="mt-3 text-xs text-zinc-500">
              {activeJob.status === "queued"
                ? "Starting Cursor agent..."
                : "Agent is editing the repo and opening a pull request. This can take several minutes."}
            </p>
          ) : null}
          {activeJob.status === "done" && !activeJob.prUrl ? (
            <p className="mt-3 text-xs text-zinc-500">
              Agent finished. Check the repository for changes if no PR link
              appears.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

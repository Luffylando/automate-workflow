"use client";

import { useEffect, useState } from "react";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import type { Job } from "@/lib/types";

const POLL_INTERVAL_MS = 3000;
const PROMPT_PREVIEW_LENGTH = 80;

interface JobHistorySectionProps {
  initialJobs: Job[];
}

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function truncatePrompt(prompt: string): string {
  if (prompt.length <= PROMPT_PREVIEW_LENGTH) {
    return prompt;
  }
  return `${prompt.slice(0, PROMPT_PREVIEW_LENGTH).trimEnd()}…`;
}

function hasActiveJobs(jobs: Job[]): boolean {
  return jobs.some(
    (job) => job.status === "queued" || job.status === "running",
  );
}

export function JobHistorySection({ initialJobs }: JobHistorySectionProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasActiveJobs(jobs)) {
      return;
    }

    const interval = window.setInterval(async () => {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { jobs: Job[] };
        setJobs(data.jobs);
        setError(null);
      } catch {
        setError("Failed to refresh job history");
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [jobs]);

  return (
    <section className="dashboard-panel overflow-hidden rounded-xl border border-indigo-200/50 bg-white/95">
      <div className="flex items-center justify-between gap-3 border-b border-indigo-100/80 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-indigo-950">
            Prompt job history
          </h2>
          <p className="text-xs text-indigo-600/70">
            {jobs.length} job{jobs.length === 1 ? "" : "s"} tracked by prompt
            ID
          </p>
        </div>
      </div>

      <div className="px-4 py-3">
        {error ? (
          <p className="mb-2 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
            {error}
          </p>
        ) : null}

        {jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-indigo-200/80 bg-indigo-50/40 px-4 py-6 text-center">
            <p className="text-xs font-medium text-indigo-700">
              No prompt jobs yet.
            </p>
            <p className="mt-1 text-[11px] text-indigo-500">
              Submit a prompt from the home page to start tracking jobs here.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {jobs.map((job) => {
              const isExpanded = expandedId === job.id;

              return (
                <li
                  key={job.id}
                  className="rounded-lg border border-indigo-100/80 bg-violet-50/20"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId((current) =>
                        current === job.id ? null : job.id,
                      )
                    }
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left"
                    aria-expanded={isExpanded}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <JobStatusBadge status={job.status} />
                        <span className="font-mono text-[11px] text-indigo-600">
                          {job.id}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-indigo-950">
                        {truncatePrompt(job.prompt)}
                      </p>
                      <p className="mt-1 text-[11px] text-indigo-500">
                        {formatTimestamp(job.createdAt)}
                        {job.submittedByEmail
                          ? ` · ${job.submittedByEmail}`
                          : null}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-violet-700">
                      {isExpanded ? "Hide" : "Details"}
                    </span>
                  </button>

                  {isExpanded ? (
                    <div className="border-t border-indigo-100/80 px-3 py-3 text-xs">
                      <dl className="space-y-2">
                        <div>
                          <dt className="font-medium text-indigo-600">
                            Prompt ID
                          </dt>
                          <dd className="mt-0.5 font-mono text-[11px] text-indigo-950">
                            {job.id}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-indigo-600">
                            Prompt
                          </dt>
                          <dd className="mt-0.5 whitespace-pre-wrap text-indigo-950">
                            {job.prompt}
                          </dd>
                        </div>
                        {job.submittedByEmail ? (
                          <div>
                            <dt className="font-medium text-indigo-600">
                              Submitted by
                            </dt>
                            <dd className="mt-0.5 text-indigo-950">
                              {job.submittedByEmail}
                            </dd>
                          </div>
                        ) : null}
                        {job.agentId ? (
                          <div>
                            <dt className="font-medium text-indigo-600">
                              Agent ID
                            </dt>
                            <dd className="mt-0.5 font-mono text-[11px] text-indigo-950">
                              {job.agentId}
                            </dd>
                          </div>
                        ) : null}
                        {job.agentRunId ? (
                          <div>
                            <dt className="font-medium text-indigo-600">
                              Agent run ID
                            </dt>
                            <dd className="mt-0.5 font-mono text-[11px] text-indigo-950">
                              {job.agentRunId}
                            </dd>
                          </div>
                        ) : null}
                        {job.metadata && Object.keys(job.metadata).length > 0 ? (
                          <div>
                            <dt className="font-medium text-indigo-600">
                              Metadata
                            </dt>
                            <dd className="mt-0.5">
                              <pre className="overflow-x-auto rounded-md bg-indigo-50/80 p-2 font-mono text-[10px] text-indigo-900">
                                {JSON.stringify(job.metadata, null, 2)}
                              </pre>
                            </dd>
                          </div>
                        ) : null}
                        {job.prUrl ? (
                          <div>
                            <dt className="font-medium text-indigo-600">
                              Pull request
                            </dt>
                            <dd className="mt-0.5">
                              <a
                                href={job.prUrl}
                                className="font-medium text-fuchsia-700 underline decoration-fuchsia-300 underline-offset-2"
                                target="_blank"
                                rel="noreferrer"
                              >
                                View PR
                              </a>
                            </dd>
                          </div>
                        ) : null}
                        {job.error ? (
                          <div>
                            <dt className="font-medium text-indigo-600">
                              Error
                            </dt>
                            <dd className="mt-0.5 text-red-600">{job.error}</dd>
                          </div>
                        ) : null}
                        <div className="flex flex-wrap gap-4 text-[11px] text-indigo-500">
                          <span>Created {formatTimestamp(job.createdAt)}</span>
                          <span>Updated {formatTimestamp(job.updatedAt)}</span>
                        </div>
                      </dl>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

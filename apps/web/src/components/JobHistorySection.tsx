"use client";

import { useCallback, useEffect, useState } from "react";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import type { Job } from "@/lib/types";

const POLL_INTERVAL_MS = 3000;
const PROMPT_PREVIEW_LENGTH = 80;
const HISTORY_MAX_HEIGHT = "max-h-96";

interface JobHistorySectionProps {
  initialJobs: Job[];
}

interface JobFilters {
  prompt: string;
  date: string;
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

function buildJobsQuery(filters: JobFilters): string {
  const params = new URLSearchParams();
  const prompt = filters.prompt.trim();
  const date = filters.date.trim();

  if (prompt) {
    params.set("prompt", prompt);
  }
  if (date) {
    params.set("date", date);
  }

  const query = params.toString();
  return query ? `/api/jobs?${query}` : "/api/jobs";
}

function hasActiveFilters(filters: JobFilters): boolean {
  return Boolean(filters.prompt.trim() || filters.date.trim());
}

export function JobHistorySection({ initialJobs }: JobHistorySectionProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>({ prompt: "", date: "" });
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async (nextFilters: JobFilters) => {
    setLoading(true);
    try {
      const response = await fetch(buildJobsQuery(nextFilters));
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = (await response.json()) as { jobs: Job[] };
      setJobs(data.jobs);
      setError(null);
    } catch {
      setError("Failed to refresh job history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchJobs(filters);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [filters, fetchJobs]);

  useEffect(() => {
    if (!hasActiveJobs(jobs)) {
      return;
    }

    const interval = window.setInterval(() => {
      void fetchJobs(filters);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [jobs, filters, fetchJobs]);

  const filtersActive = hasActiveFilters(filters);

  return (
    <section className="dashboard-panel overflow-hidden rounded-xl border border-indigo-200/50 bg-white/95">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-indigo-100/80 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-indigo-950">
            Prompt job history
          </h2>
          <p className="text-xs text-indigo-600/70">
            {jobs.length} job{jobs.length === 1 ? "" : "s"} tracked by prompt
            ID
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-indigo-600">
              Prompt name
            </span>
            <input
              type="search"
              value={filters.prompt}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  prompt: event.target.value,
                }))
              }
              placeholder="Search prompts"
              className="w-44 rounded-md border border-indigo-200/80 bg-white px-2 py-1.5 text-xs text-indigo-950 placeholder:text-indigo-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-indigo-600">Date</span>
            <input
              type="date"
              value={filters.date}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
              className="rounded-md border border-indigo-200/80 bg-white px-2 py-1.5 text-xs text-indigo-950 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </label>
        </div>
      </div>

      <div className="px-4 py-3">
        {error ? (
          <p className="mb-2 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
            {error}
          </p>
        ) : null}

        {loading && jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-indigo-200/80 bg-indigo-50/40 px-4 py-6 text-center">
            <p className="text-xs font-medium text-indigo-700">
              Loading prompt jobs…
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-indigo-200/80 bg-indigo-50/40 px-4 py-6 text-center">
            <p className="text-xs font-medium text-indigo-700">
              {filtersActive
                ? "No prompt jobs match your filters."
                : "No prompt jobs yet."}
            </p>
            {!filtersActive ? (
              <p className="mt-1 text-[11px] text-indigo-500">
                Submit a prompt from the prompt console to start tracking jobs here.
              </p>
            ) : null}
          </div>
        ) : (
          <div
            className={`overflow-y-auto rounded-lg border border-indigo-100/80 ${HISTORY_MAX_HEIGHT}`}
          >
            <table className="w-full min-w-[640px] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-indigo-50/95 backdrop-blur">
                <tr className="border-b border-indigo-100/80 text-[11px] uppercase tracking-wide text-indigo-600">
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Prompt</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Submitted by</th>
                  <th className="px-3 py-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const isExpanded = expandedId === job.id;

                  return (
                    <JobHistoryRow
                      key={job.id}
                      job={job}
                      isExpanded={isExpanded}
                      onToggle={() =>
                        setExpandedId((current) =>
                          current === job.id ? null : job.id,
                        )
                      }
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

interface JobHistoryRowProps {
  job: Job;
  isExpanded: boolean;
  onToggle: () => void;
}

function JobHistoryRow({ job, isExpanded, onToggle }: JobHistoryRowProps) {
  return (
    <>
      <tr className="border-b border-indigo-100/60 bg-violet-50/20 hover:bg-violet-50/40">
        <td className="px-3 py-2 align-top">
          <JobStatusBadge status={job.status} />
        </td>
        <td className="px-3 py-2 align-top">
          <p className="font-mono text-[11px] text-indigo-600">{job.id}</p>
          <p className="mt-1 text-indigo-950">{truncatePrompt(job.prompt)}</p>
        </td>
        <td className="whitespace-nowrap px-3 py-2 align-top text-indigo-700">
          {formatTimestamp(job.createdAt)}
        </td>
        <td className="px-3 py-2 align-top text-indigo-700">
          {job.submittedByEmail ?? "—"}
        </td>
        <td className="px-3 py-2 align-top">
          <button
            type="button"
            onClick={onToggle}
            className="text-[11px] font-medium text-violet-700 hover:text-violet-900"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Hide" : "Details"}
          </button>
        </td>
      </tr>
      {isExpanded ? (
        <tr className="border-b border-indigo-100/60 bg-indigo-50/30">
          <td colSpan={5} className="px-3 py-3">
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="font-medium text-indigo-600">Prompt ID</dt>
                <dd className="mt-0.5 font-mono text-[11px] text-indigo-950">
                  {job.id}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-indigo-600">Prompt</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-indigo-950">
                  {job.prompt}
                </dd>
              </div>
              {job.submittedByEmail ? (
                <div>
                  <dt className="font-medium text-indigo-600">Submitted by</dt>
                  <dd className="mt-0.5 text-indigo-950">
                    {job.submittedByEmail}
                  </dd>
                </div>
              ) : null}
              {job.agentId ? (
                <div>
                  <dt className="font-medium text-indigo-600">Agent ID</dt>
                  <dd className="mt-0.5 font-mono text-[11px] text-indigo-950">
                    {job.agentId}
                  </dd>
                </div>
              ) : null}
              {job.agentRunId ? (
                <div>
                  <dt className="font-medium text-indigo-600">Agent run ID</dt>
                  <dd className="mt-0.5 font-mono text-[11px] text-indigo-950">
                    {job.agentRunId}
                  </dd>
                </div>
              ) : null}
              {job.metadata && Object.keys(job.metadata).length > 0 ? (
                <div>
                  <dt className="font-medium text-indigo-600">Metadata</dt>
                  <dd className="mt-0.5">
                    <pre className="overflow-x-auto rounded-md bg-indigo-50/80 p-2 font-mono text-[10px] text-indigo-900">
                      {JSON.stringify(job.metadata, null, 2)}
                    </pre>
                  </dd>
                </div>
              ) : null}
              {job.prUrl ? (
                <div>
                  <dt className="font-medium text-indigo-600">Pull request</dt>
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
                  <dt className="font-medium text-indigo-600">Error</dt>
                  <dd className="mt-0.5 text-red-600">{job.error}</dd>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-4 text-[11px] text-indigo-500">
                <span>Created {formatTimestamp(job.createdAt)}</span>
                <span>Updated {formatTimestamp(job.updatedAt)}</span>
              </div>
            </dl>
          </td>
        </tr>
      ) : null}
    </>
  );
}

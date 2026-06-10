"use client";

import { useCallback, useEffect, useState } from "react";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import {
  EMPTY_STATE_COMPACT_CLASS,
  ERROR_BANNER_COMPACT_CLASS,
  INPUT_COMPACT_CLASS,
  PANEL_COMPACT_CLASS,
  PANEL_SECTION_HEADER_CLASS,
  TEXT_HEADING_CLASS,
  TEXT_MUTED_CLASS,
  TEXT_SUBTLE_CLASS,
} from "@/lib/theme-classes";
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

function countJobsByStatus(jobs: Job[]) {
  let done = 0;
  let active = 0;
  let failed = 0;

  for (const job of jobs) {
    if (job.status === "done") {
      done += 1;
    } else if (job.status === "failed") {
      failed += 1;
    } else {
      active += 1;
    }
  }

  return { done, active, failed };
}

function formatJobStatsSubtitle(jobs: Job[]): string {
  const { done, active, failed } = countJobsByStatus(jobs);
  const promptLabel = jobs.length === 1 ? "prompt" : "prompts";

  return `${jobs.length} ${promptLabel} · ${done} done · ${active} active · ${failed} failed`;
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
    <section className={PANEL_COMPACT_CLASS}>
      <div className={`${PANEL_SECTION_HEADER_CLASS} flex-wrap items-end`}>
        <div>
          <h2 className={`text-sm ${TEXT_HEADING_CLASS}`}>
            Prompt job history
          </h2>
          <p className={`text-xs ${TEXT_SUBTLE_CLASS}`}>
            {formatJobStatsSubtitle(jobs)}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">
            <span className={`text-[11px] font-medium ${TEXT_MUTED_CLASS}`}>
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
              className={`w-44 px-2 py-1.5 ${INPUT_COMPACT_CLASS}`}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={`text-[11px] font-medium ${TEXT_MUTED_CLASS}`}>
              Date
            </span>
            <input
              type="date"
              value={filters.date}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
              className={`px-2 py-1.5 ${INPUT_COMPACT_CLASS}`}
            />
          </label>
        </div>
      </div>

      <div className="px-4 py-3">
        {error ? (
          <p className={ERROR_BANNER_COMPACT_CLASS}>
            {error}
          </p>
        ) : null}

        {loading && jobs.length === 0 ? (
          <div className={EMPTY_STATE_COMPACT_CLASS}>
            <p className={`text-xs font-medium ${TEXT_MUTED_CLASS}`}>
              Loading prompt jobs…
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className={EMPTY_STATE_COMPACT_CLASS}>
            <p className={`text-xs font-medium ${TEXT_MUTED_CLASS}`}>
              {filtersActive
                ? "No prompt jobs match your filters."
                : "No prompt jobs yet."}
            </p>
            {!filtersActive ? (
              <p className={`mt-1 text-[11px] ${TEXT_SUBTLE_CLASS}`}>
                Submit a prompt from the prompt console to start tracking jobs here.
              </p>
            ) : null}
          </div>
        ) : (
          <div
            className={`overflow-y-auto rounded-lg border border-border-muted ${HISTORY_MAX_HEIGHT}`}
          >
            <table className="w-full min-w-[640px] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-surface-muted/95 backdrop-blur dark:bg-surface/95">
                <tr className={`border-b border-border-muted text-[11px] uppercase tracking-wide ${TEXT_MUTED_CLASS}`}>
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
      <tr className="border-b border-border-muted bg-violet-50/20 hover:bg-violet-50/40 dark:bg-violet-950/20 dark:hover:bg-violet-950/35">
        <td className="px-3 py-2 align-top">
          <JobStatusBadge status={job.status} />
        </td>
        <td className="px-3 py-2 align-top">
          <p className={`font-mono text-[11px] ${TEXT_SUBTLE_CLASS}`}>{job.id}</p>
          <p className="mt-1 text-foreground">{truncatePrompt(job.prompt)}</p>
        </td>
        <td className={`whitespace-nowrap px-3 py-2 align-top ${TEXT_MUTED_CLASS}`}>
          {formatTimestamp(job.createdAt)}
        </td>
        <td className={`px-3 py-2 align-top ${TEXT_MUTED_CLASS}`}>
          {job.submittedByEmail ?? "—"}
        </td>
        <td className="px-3 py-2 align-top">
          <button
            type="button"
            onClick={onToggle}
            className="text-[11px] font-medium text-brand-via hover:text-brand-to"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Hide" : "Details"}
          </button>
        </td>
      </tr>
      {isExpanded ? (
        <tr className="border-b border-border-muted bg-surface-muted/30 dark:bg-surface/50">
          <td colSpan={5} className="px-3 py-3">
            <dl className="space-y-2 text-xs">
              <div>
                <dt className={`font-medium ${TEXT_MUTED_CLASS}`}>Prompt ID</dt>
                <dd className="mt-0.5 font-mono text-[11px] text-foreground">
                  {job.id}
                </dd>
              </div>
              <div>
                <dt className={`font-medium ${TEXT_MUTED_CLASS}`}>Prompt</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-foreground">
                  {job.prompt}
                </dd>
              </div>
              {job.submittedByEmail ? (
                <div>
                  <dt className={`font-medium ${TEXT_MUTED_CLASS}`}>
                    Submitted by
                  </dt>
                  <dd className="mt-0.5 text-foreground">
                    {job.submittedByEmail}
                  </dd>
                </div>
              ) : null}
              {job.agentId ? (
                <div>
                  <dt className={`font-medium ${TEXT_MUTED_CLASS}`}>Agent ID</dt>
                  <dd className="mt-0.5 font-mono text-[11px] text-foreground">
                    {job.agentId}
                  </dd>
                </div>
              ) : null}
              {job.agentRunId ? (
                <div>
                  <dt className={`font-medium ${TEXT_MUTED_CLASS}`}>
                    Agent run ID
                  </dt>
                  <dd className="mt-0.5 font-mono text-[11px] text-foreground">
                    {job.agentRunId}
                  </dd>
                </div>
              ) : null}
              {job.metadata && Object.keys(job.metadata).length > 0 ? (
                <div>
                  <dt className={`font-medium ${TEXT_MUTED_CLASS}`}>Metadata</dt>
                  <dd className="mt-0.5">
                    <pre className="overflow-x-auto rounded-md bg-surface-muted p-2 font-mono text-[10px] text-foreground">
                      {JSON.stringify(job.metadata, null, 2)}
                    </pre>
                  </dd>
                </div>
              ) : null}
              {job.prUrl ? (
                <div>
                  <dt className={`font-medium ${TEXT_MUTED_CLASS}`}>
                    Pull request
                  </dt>
                  <dd className="mt-0.5">
                    <a
                      href={job.prUrl}
                      className="font-medium text-brand-to underline decoration-brand-to/40 underline-offset-2"
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
                  <dt className={`font-medium ${TEXT_MUTED_CLASS}`}>Error</dt>
                  <dd className="mt-0.5 text-red-600 dark:text-red-400">
                    {job.error}
                  </dd>
                </div>
              ) : null}
              <div className={`flex flex-wrap gap-4 text-[11px] ${TEXT_SUBTLE_CLASS}`}>
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

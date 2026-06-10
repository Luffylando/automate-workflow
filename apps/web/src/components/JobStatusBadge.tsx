import { STATUS_BADGE_CLASSES } from "@/lib/theme-classes";
import type { JobStatus } from "@/lib/types";

const STATUS_LABELS: Record<JobStatus, string> = {
  queued: "Queued",
  running: "Running",
  done: "Completed",
  failed: "Failed",
};

interface JobStatusBadgeProps {
  status: JobStatus;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_BADGE_CLASSES[status]}`}
    >
      {status === "running" ? (
        <span
          className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500 dark:bg-blue-400"
          aria-hidden="true"
        />
      ) : null}
      {STATUS_LABELS[status]}
    </span>
  );
}

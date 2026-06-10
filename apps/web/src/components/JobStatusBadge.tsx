import type { JobStatus } from "@/lib/types";

const STATUS_STYLES: Record<
  JobStatus,
  { label: string; className: string }
> = {
  queued: {
    label: "Queued",
    className:
      "border-amber-300 bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  },
  running: {
    label: "Running",
    className:
      "border-blue-400 bg-blue-50 text-blue-800 ring-2 ring-blue-200",
  },
  done: {
    label: "Completed",
    className:
      "border-green-400 bg-green-50 text-green-800 ring-2 ring-green-200",
  },
  failed: {
    label: "Failed",
    className: "border-red-400 bg-red-50 text-red-800 ring-2 ring-red-200",
  },
};

interface JobStatusBadgeProps {
  status: JobStatus;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const { label, className } = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}
    >
      {status === "running" ? (
        <span
          className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500"
          aria-hidden="true"
        />
      ) : null}
      {label}
    </span>
  );
}

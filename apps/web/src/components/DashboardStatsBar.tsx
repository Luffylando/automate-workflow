import type { JobStats, TodoStats } from "@/lib/types";

export interface DashboardStatsBarProps {
  todoStats: TodoStats;
  usersCount?: number;
  donePercent?: number;
  jobStats?: JobStats | null;
}

function InlineStat({ label, value }: { label: string; value: number | string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="text-sm font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </span>
  );
}

function GroupDivider() {
  return (
    <span className="hidden h-3 w-px shrink-0 bg-border sm:inline" aria-hidden />
  );
}

function GroupLabel({ children }: { children: string }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
      {children}
    </span>
  );
}

export function DashboardStatsBar({
  todoStats,
  usersCount,
  donePercent,
  jobStats,
}: DashboardStatsBarProps) {
  const activeJobs = jobStats ? jobStats.queued + jobStats.running : 0;
  const showGroups = jobStats != null;
  const donePercentValue =
    donePercent ??
    (todoStats.total
      ? Math.round((todoStats.done / todoStats.total) * 100)
      : 0);

  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-surface/60 px-2.5 py-1.5">
      {showGroups ? <GroupLabel>Tasks</GroupLabel> : null}
      <InlineStat label="Total" value={todoStats.total} />
      <InlineStat label="Open" value={todoStats.open} />
      <InlineStat label="Done" value={todoStats.done} />
      <InlineStat label="In Prog" value={todoStats.inProgress} />
      <InlineStat label="Overdue" value={todoStats.overdue} />
      <InlineStat label="High" value={todoStats.highPriority} />
      {usersCount !== undefined ? (
        <InlineStat label="Users" value={usersCount} />
      ) : (
        <InlineStat label="Done %" value={donePercentValue} />
      )}
      {todoStats.rated > 0 ? (
        <InlineStat
          label="Avg ★"
          value={todoStats.averageRating?.toFixed(1) ?? "0.0"}
        />
      ) : null}

      {jobStats ? (
        <>
          <GroupDivider />
          <GroupLabel>Prompts</GroupLabel>
          <InlineStat label="Total" value={jobStats.total} />
          <InlineStat label="Active" value={activeJobs} />
          <InlineStat label="Done" value={jobStats.done} />
          <InlineStat label="Failed" value={jobStats.failed} />
        </>
      ) : null}
    </div>
  );
}

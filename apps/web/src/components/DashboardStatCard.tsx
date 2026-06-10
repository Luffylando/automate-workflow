interface DashboardStatCardProps {
  label: string;
  value: number;
  accent?: "indigo" | "emerald" | "amber" | "fuchsia";
}

const ACCENT_CLASSES: Record<
  NonNullable<DashboardStatCardProps["accent"]>,
  string
> = {
  indigo: "border-indigo-200/70 bg-indigo-50/60 text-indigo-700",
  emerald: "border-emerald-200/70 bg-emerald-50/60 text-emerald-700",
  amber: "border-amber-200/70 bg-amber-50/60 text-amber-700",
  fuchsia: "border-fuchsia-200/70 bg-fuchsia-50/60 text-fuchsia-700",
};

export function DashboardStatCard({
  label,
  value,
  accent = "indigo",
}: DashboardStatCardProps) {
  return (
    <div
      className={`dashboard-stat rounded-lg border px-3 py-2.5 ${ACCENT_CLASSES[accent]}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-bold tabular-nums text-indigo-950">
        {value}
      </p>
    </div>
  );
}

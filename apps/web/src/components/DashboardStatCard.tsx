import { ACCENT_CLASSES } from "@/lib/theme-classes";

interface DashboardStatCardProps {
  label: string;
  value: number;
  accent?: "indigo" | "emerald" | "amber" | "fuchsia";
}

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
      <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

import { PRIORITY_BADGE_CLASSES } from "@/lib/theme-classes";
import type { TodoPriority } from "@/lib/types";

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

interface TodoPriorityBadgeProps {
  priority: TodoPriority;
  compact?: boolean;
}

export function TodoPriorityBadge({
  priority,
  compact = false,
}: TodoPriorityBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border font-semibold uppercase tracking-wide ${PRIORITY_BADGE_CLASSES[priority]} ${
        compact
          ? "px-1.5 py-0 text-[9px]"
          : "px-2 py-0.5 text-[10px]"
      }`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

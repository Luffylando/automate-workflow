export const HEADER_BAR_CLASS =
  "border-b border-border bg-surface/85 backdrop-blur-sm dark:bg-surface/80";

export const FOOTER_BAR_CLASS =
  "border-t border-border bg-surface/60 py-2.5 text-center text-xs backdrop-blur-sm dark:bg-surface/50";

export const PANEL_COMPACT_CLASS =
  "dashboard-panel flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface/95 dark:bg-surface/90";

export const PANEL_DEFAULT_CLASS =
  "card-glow overflow-hidden rounded-2xl border border-border bg-surface/90 p-8 backdrop-blur-sm dark:bg-surface/85";

export const PANEL_SECTION_HEADER_CLASS =
  "flex shrink-0 items-center justify-between gap-3 border-b border-border-muted px-4 py-3";

export const INPUT_COMPACT_CLASS =
  "rounded-lg border border-border bg-input px-3 py-1.5 text-xs text-foreground outline-none placeholder:text-subtle focus:border-brand-via focus:ring-1 focus:ring-brand-via/50";

export const INPUT_DEFAULT_CLASS =
  "rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-subtle focus:border-brand-via focus:ring-2 focus:ring-brand-via/50";

export const BTN_SECONDARY_CLASS =
  "rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand-via/50 hover:bg-surface-muted hover:text-foreground";

export const BTN_SECONDARY_LG_CLASS =
  "rounded-xl border border-border bg-surface-muted px-4 py-2 text-sm font-medium text-muted transition hover:border-brand-via/50 hover:bg-surface-muted hover:text-foreground";

export const TEXT_HEADING_CLASS = "font-semibold text-foreground";

export const TEXT_MUTED_CLASS = "text-muted";

export const TEXT_SUBTLE_CLASS = "text-subtle";

export const EMPTY_STATE_COMPACT_CLASS =
  "rounded-lg border border-dashed border-border bg-surface-muted px-4 py-6 text-center";

export const EMPTY_STATE_DEFAULT_CLASS =
  "rounded-xl border border-dashed border-border bg-surface-muted px-6 py-10 text-center";

export const LIST_ITEM_CLASS =
  "group flex items-center gap-2 rounded-lg border border-border-muted bg-surface-muted/40 transition hover:bg-surface-muted/70";

export const ERROR_BANNER_COMPACT_CLASS =
  "mb-2 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300";

export const ERROR_BANNER_CLASS =
  "mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300";

export const ACCENT_CLASSES = {
  indigo:
    "border-indigo-200/70 bg-indigo-50/60 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-300",
  emerald:
    "border-emerald-200/70 bg-emerald-50/60 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300",
  amber:
    "border-amber-200/70 bg-amber-50/60 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300",
  fuchsia:
    "border-fuchsia-200/70 bg-fuchsia-50/60 text-fuchsia-700 dark:border-fuchsia-500/30 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
} as const;

export const ROLE_BADGE_CLASSES = {
  admin:
    "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:border-fuchsia-700/50",
  user: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-700/50",
} as const;

export const STATUS_BADGE_CLASSES = {
  queued:
    "border-amber-300 bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:border-amber-600/50 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800/50",
  running:
    "border-blue-400 bg-blue-50 text-blue-800 ring-2 ring-blue-200 dark:border-blue-600/50 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-800/50",
  done: "border-green-400 bg-green-50 text-green-800 ring-2 ring-green-200 dark:border-green-600/50 dark:bg-green-950/50 dark:text-green-300 dark:ring-green-800/50",
  failed:
    "border-red-400 bg-red-50 text-red-800 ring-2 ring-red-200 dark:border-red-600/50 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-800/50",
} as const;

export const JOB_PANEL_CLASSES = {
  queued:
    "border-amber-200 bg-amber-50/50 ring-1 ring-amber-100 dark:border-amber-700/50 dark:bg-amber-950/40 dark:ring-amber-900/50",
  running:
    "border-blue-300 bg-blue-50/60 ring-2 ring-blue-200 dark:border-blue-700/50 dark:bg-blue-950/40 dark:ring-blue-900/50",
  done: "border-green-300 bg-green-50/60 ring-2 ring-green-200 dark:border-green-700/50 dark:bg-green-950/40 dark:ring-green-900/50",
  failed:
    "border-red-300 bg-red-50/60 ring-2 ring-red-200 dark:border-red-700/50 dark:bg-red-950/40 dark:ring-red-900/50",
} as const;

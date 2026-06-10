import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

interface DashboardHeaderProps {
  email: string;
}

export function DashboardHeader({ email }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header border-b border-indigo-200/50 bg-white/85 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg brand-gradient-bg text-xs font-bold text-white shadow-sm">
            AW
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-indigo-950">
              Dashboard
            </p>
            <p className="truncate text-xs text-indigo-600/80">{email}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            className="rounded-lg border border-indigo-200/80 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:border-violet-200 hover:bg-violet-50"
          >
            Home
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  BTN_SECONDARY_CLASS,
  HEADER_BAR_CLASS,
  TEXT_HEADING_CLASS,
  TEXT_MUTED_CLASS,
} from "@/lib/theme-classes";

interface DashboardHeaderProps {
  email: string;
}

export function DashboardHeader({ email }: DashboardHeaderProps) {
  return (
    <header className={`dashboard-header ${HEADER_BAR_CLASS}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg brand-gradient-bg text-xs font-bold text-white shadow-sm">
            AW
          </div>
          <div className="min-w-0">
            <p className={`truncate text-sm ${TEXT_HEADING_CLASS}`}>
              Dashboard
            </p>
            <p className={`truncate text-xs ${TEXT_MUTED_CLASS}`}>{email}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link href="/" className={BTN_SECONDARY_CLASS}>
            Home
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

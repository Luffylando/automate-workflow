"use client";

import { BTN_SECONDARY_CLASS } from "@/lib/theme-classes";

export function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      className={`${BTN_SECONDARY_CLASS} hover:border-brand-to/50 hover:bg-surface-muted hover:text-brand-to`}
    >
      Sign out
    </button>
  );
}

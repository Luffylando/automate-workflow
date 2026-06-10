"use client";

export function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      className="rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 transition hover:border-fuchsia-200 hover:bg-fuchsia-50 hover:text-fuchsia-700"
    >
      Sign out
    </button>
  );
}

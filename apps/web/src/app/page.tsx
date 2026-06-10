import Link from "next/link";
import { AdminPromptPanel } from "@/components/AdminPromptPanel";
import { LogoutButton } from "@/components/LogoutButton";
import { PoweredByPromptsFooter } from "@/components/PoweredByPromptsFooter";
import { TodosSection } from "@/components/TodosSection";
import { getAdminSession, getSession, listTodos } from "@/lib/server-api";

export default async function Home() {
  const [session, adminSession, todos] = await Promise.all([
    getSession(),
    getAdminSession(),
    listTodos(),
  ]);

  return (
    <div className="page-gradient flex min-h-full flex-1 flex-col">
      <header className="border-b border-indigo-200/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold tracking-wide brand-gradient-text">
              Automate Workflow
            </p>
            <h1 className="text-xl font-semibold text-indigo-950">Home</h1>
          </div>
          {session ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-indigo-700 sm:inline">
                {session.email}
              </span>
              <Link
                href="/dashboard"
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:border-violet-200 hover:bg-violet-50"
              >
                Dashboard
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:border-fuchsia-200 hover:bg-fuchsia-50 hover:text-fuchsia-700"
            >
              Admin sign in
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 py-10">
        <TodosSection initialTodos={todos} variant="compact" />
      </main>

      {adminSession ? <AdminPromptPanel /> : null}

      <PoweredByPromptsFooter />
    </div>
  );
}

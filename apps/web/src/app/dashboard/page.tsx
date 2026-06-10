import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { PoweredByPromptsFooter } from "@/components/PoweredByPromptsFooter";
import { TodosSection } from "@/components/TodosSection";
import { UsersSection } from "@/components/UsersSection";
import { getAdminSession, getSession, listTodos, listUsers } from "@/lib/server-api";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const adminSession = await getAdminSession();
  const todos = await listTodos();
  const users = adminSession ? await listUsers() : [];

  return (
    <div className="page-gradient flex min-h-full flex-1 flex-col">
      <header className="border-b border-indigo-200/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold tracking-wide brand-gradient-text">
              Automate Workflow
            </p>
            <h1 className="text-xl font-semibold text-indigo-950">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-indigo-700 sm:inline">
              {session.email}
            </span>
            <Link
              href="/"
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:border-violet-200 hover:bg-violet-50"
            >
              Home
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-16">
        <TodosSection initialTodos={todos} />
        {adminSession ? <UsersSection initialUsers={users} /> : null}
      </main>

      <PoweredByPromptsFooter />
    </div>
  );
}

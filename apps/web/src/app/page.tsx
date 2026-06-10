import Link from "next/link";
import { AdminPromptPanel } from "@/components/AdminPromptPanel";
import { PoweredByPromptsFooter } from "@/components/PoweredByPromptsFooter";
import { TodosSection } from "@/components/TodosSection";
import { getSession, listTodos } from "@/lib/server-api";

export default async function Home() {
  const [session, todos] = await Promise.all([getSession(), listTodos()]);

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
          {session ? null : (
            <Link
              href="/login"
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:border-fuchsia-200 hover:bg-fuchsia-50 hover:text-fuchsia-700"
            >
              Admin sign in
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16">
        <TodosSection initialTodos={todos} />
      </main>

      {session ? <AdminPromptPanel /> : null}

      <PoweredByPromptsFooter />
    </div>
  );
}

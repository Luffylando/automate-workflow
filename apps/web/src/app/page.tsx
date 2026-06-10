import Link from "next/link";
import { AdminPromptPanel } from "@/components/AdminPromptPanel";
import { PoweredByPromptsFooter } from "@/components/PoweredByPromptsFooter";
import { TodosSection } from "@/components/TodosSection";
import { getSession, listTodos } from "@/lib/server-api";

export default async function Home() {
  const [session, todos] = await Promise.all([getSession(), listTodos()]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-zinc-500">Automate Workflow</p>
            <h1 className="text-xl font-semibold text-zinc-900">Home</h1>
          </div>
          {session ? null : (
            <Link
              href="/login"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
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

import Link from "next/link";
import { AdminPromptPanel } from "@/components/AdminPromptPanel";
import { PoweredByPromptsFooter } from "@/components/PoweredByPromptsFooter";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

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

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-16">
        <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Blank home page
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-600">
            This is the public starting point. Future prompts will evolve this
            page and the rest of the codebase.
          </p>
        </section>

        {session ? <AdminPromptPanel /> : null}
      </main>
      <PoweredByPromptsFooter />
    </div>
  );
}

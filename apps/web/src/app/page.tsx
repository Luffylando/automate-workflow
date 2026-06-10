import Link from "next/link";
import { PoweredByPromptsFooter } from "@/components/PoweredByPromptsFooter";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Automate Workflow</h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-600">
          Describe features in natural language and let a Cloud Agent modify the repo and open a
          pull request.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Admin sign in
        </Link>
      </main>
      <PoweredByPromptsFooter />
    </div>
  );
}

import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { PoweredByPromptsFooter } from "@/components/PoweredByPromptsFooter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TodosSection } from "@/components/TodosSection";
import {
  BTN_SECONDARY_LG_CLASS,
  HEADER_BAR_CLASS,
  TEXT_HEADING_CLASS,
  TEXT_MUTED_CLASS,
} from "@/lib/theme-classes";
import { getSession, listTodos } from "@/lib/server-api";

export default async function Home() {
  const [session, todos] = await Promise.all([getSession(), listTodos()]);

  return (
    <div className="page-gradient flex min-h-full flex-1 flex-col">
      <header className={HEADER_BAR_CLASS}>
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold tracking-wide brand-gradient-text">
              Automate Workflow
            </p>
            <h1 className={`text-xl ${TEXT_HEADING_CLASS}`}>Home</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <>
                <span className={`hidden text-sm sm:inline ${TEXT_MUTED_CLASS}`}>
                  {session.email}
                </span>
                <Link href="/dashboard" className={BTN_SECONDARY_LG_CLASS}>
                  Dashboard
                </Link>
                <LogoutButton />
              </>
            ) : (
              <Link href="/login" className={BTN_SECONDARY_LG_CLASS}>
                Admin sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 py-10">
        <TodosSection
          initialTodos={todos}
          variant="compact"
          canRate={Boolean(session)}
        />
      </main>

      <PoweredByPromptsFooter />
    </div>
  );
}

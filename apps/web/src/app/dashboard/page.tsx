import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardStatCard } from "@/components/DashboardStatCard";
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

  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;

  return (
    <div className="page-gradient flex min-h-full flex-1 flex-col">
      <DashboardHeader email={session.email} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-5">
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <DashboardStatCard label="Total tasks" value={totalTodos} accent="indigo" />
          <DashboardStatCard label="Open" value={pendingTodos} accent="amber" />
          <DashboardStatCard label="Done" value={completedTodos} accent="emerald" />
          {adminSession ? (
            <DashboardStatCard label="Users" value={users.length} accent="fuchsia" />
          ) : (
            <DashboardStatCard label="Done %" value={totalTodos ? Math.round((completedTodos / totalTodos) * 100) : 0} accent="fuchsia" />
          )}
        </div>

        <div
          className={
            adminSession
              ? "grid gap-4 lg:grid-cols-5 lg:items-start"
              : "grid gap-4"
          }
        >
          <div className={adminSession ? "lg:col-span-3" : ""}>
            <TodosSection
              initialTodos={todos}
              variant="compact"
              canRate
            />
          </div>
          {adminSession ? (
            <div className="lg:col-span-2">
              <UsersSection initialUsers={users} variant="compact" />
            </div>
          ) : null}
        </div>
      </main>

      <PoweredByPromptsFooter />
    </div>
  );
}

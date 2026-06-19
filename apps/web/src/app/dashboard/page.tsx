import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardStatsBar } from "@/components/DashboardStatsBar";
import { PoweredByPromptsFooter } from "@/components/PoweredByPromptsFooter";
import { JobHistorySection } from "@/components/JobHistorySection";
import { TodosSection } from "@/components/TodosSection";
import { UsersSection } from "@/components/UsersSection";
import {
  getAdminSession,
  getJobStats,
  getSession,
  getTodoStats,
  listJobs,
  listTodos,
  listUsers,
} from "@/lib/server-api";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const adminSession = await getAdminSession();
  const [todos, todoStats] = await Promise.all([listTodos(), getTodoStats()]);
  const users = adminSession ? await listUsers() : [];
  const jobs = adminSession ? await listJobs() : [];
  const jobStats = adminSession ? await getJobStats() : null;

  return (
    <div className="page-gradient flex min-h-full flex-1 flex-col">
      <DashboardHeader email={session.email} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-5">
        <DashboardStatsBar
          todoStats={todoStats}
          usersCount={adminSession ? users.length : undefined}
          donePercent={
            adminSession
              ? undefined
              : todoStats.total
                ? Math.round((todoStats.done / todoStats.total) * 100)
                : 0
          }
          jobStats={adminSession ? jobStats : null}
        />

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
              fixedHeight
            />
          </div>
          {adminSession ? (
            <div className="lg:col-span-2">
              <UsersSection
                initialUsers={users}
                variant="compact"
                fixedHeight
              />
            </div>
          ) : null}
        </div>

        {adminSession ? (
          <div className="mt-4">
            <JobHistorySection initialJobs={jobs} />
          </div>
        ) : null}
      </main>

      <PoweredByPromptsFooter />
    </div>
  );
}

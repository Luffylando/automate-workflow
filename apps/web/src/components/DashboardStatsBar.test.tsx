import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DashboardStatsBar } from "./DashboardStatsBar";

afterEach(() => {
  cleanup();
});

const baseTodoStats = {
  total: 10,
  open: 4,
  done: 5,
  cancelled: 1,
  inProgress: 2,
  overdue: 1,
  highPriority: 2,
  rated: 3,
  averageRating: 4.2,
};

describe("DashboardStatsBar", () => {
  it("renders compact task stats for regular users", () => {
    render(
      <DashboardStatsBar
        todoStats={baseTodoStats}
        donePercent={50}
      />,
    );

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("In Prog")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByText("Done %")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("Avg ★")).toBeInTheDocument();
    expect(screen.getByText("4.2")).toBeInTheDocument();
    expect(screen.queryByText("Tasks")).not.toBeInTheDocument();
    expect(screen.queryByText("Prompts")).not.toBeInTheDocument();
  });

  it("renders grouped task and prompt stats for admins", () => {
    render(
      <DashboardStatsBar
        todoStats={{
          ...baseTodoStats,
          total: 8,
          open: 3,
          done: 4,
        }}
        usersCount={2}
        jobStats={{
          total: 12,
          queued: 1,
          running: 1,
          done: 9,
          failed: 1,
        }}
      />,
    );

    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Prompts")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("In Prog")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardStatsBar } from "./DashboardStatsBar";

const sampleTodoStats = {
  total: 10,
  open: 4,
  completed: 6,
  overdue: 2,
  highPriority: 3,
  averageRating: 3.8,
  byPriority: {
    low: 2,
    medium: 5,
    high: 3,
  },
};

describe("DashboardStatsBar", () => {
  it("renders compact task stats for regular users", () => {
    render(
      <DashboardStatsBar todoStats={sampleTodoStats} donePercent={60} />,
    );

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Done %")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("3.8")).toBeInTheDocument();
    expect(screen.queryByText("Tasks")).not.toBeInTheDocument();
    expect(screen.queryByText("Prompts")).not.toBeInTheDocument();
  });

  it("renders grouped task and prompt stats for admins", () => {
    render(
      <DashboardStatsBar
        todoStats={{
          ...sampleTodoStats,
          total: 8,
          open: 3,
          completed: 5,
          overdue: 1,
          highPriority: 2,
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
    expect(screen.getAllByText("2")).toHaveLength(4);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
  });
});

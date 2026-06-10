import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { JobHistorySection } from "./JobHistorySection";

afterEach(() => {
  cleanup();
});

const sampleJobs = [
  {
    id: "job-abc-123",
    prompt: "Add a history tracker for prompt jobs",
    status: "done" as const,
    createdAt: "2026-06-10T10:00:00.000Z",
    updatedAt: "2026-06-10T10:05:00.000Z",
    submittedByEmail: "admin@example.com",
    metadata: { source: "prompt-console" },
    prUrl: "https://github.com/org/repo/pull/42",
  },
  {
    id: "job-def-456",
    prompt: "Fix login redirect",
    status: "running" as const,
    createdAt: "2026-06-10T11:00:00.000Z",
    updatedAt: "2026-06-10T11:01:00.000Z",
    submittedByEmail: "ops@example.com",
    metadata: { source: "admin-prompt", priority: "high" },
  },
];

describe("JobHistorySection", () => {
  it("renders job history with prompt IDs", () => {
    render(<JobHistorySection initialJobs={sampleJobs} />);

    expect(
      screen.getByRole("heading", { name: "Prompt job history" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 jobs tracked by prompt ID")).toBeInTheDocument();
    expect(screen.getByText("job-abc-123")).toBeInTheDocument();
    expect(screen.getByText("job-def-456")).toBeInTheDocument();
    expect(screen.getByText(/admin@example\.com/)).toBeInTheDocument();
  });

  it("shows a message when there are no jobs", () => {
    render(<JobHistorySection initialJobs={[]} />);

    expect(screen.getByText("No prompt jobs yet.")).toBeInTheDocument();
  });

  it("expands job details with metadata", () => {
    render(<JobHistorySection initialJobs={sampleJobs} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Details/i })[0]!);

    expect(screen.getByText("Prompt ID")).toBeInTheDocument();
    expect(
      screen.getAllByText("Add a history tracker for prompt jobs"),
    ).toHaveLength(2);
    expect(screen.getByText(/"source": "prompt-console"/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View PR" })).toHaveAttribute(
      "href",
      "https://github.com/org/repo/pull/42",
    );
  });
});

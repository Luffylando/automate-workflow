import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JobHistorySection } from "./JobHistorySection";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
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
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ jobs: sampleJobs }),
      })),
    );
  });

  it("renders job history with prompt IDs in a scrollable table", () => {
    render(<JobHistorySection initialJobs={sampleJobs} />);

    expect(
      screen.getByRole("heading", { name: "Prompt job history" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 prompts · 1 done · 1 active · 0 failed")).toBeInTheDocument();
    expect(screen.getByText("job-abc-123")).toBeInTheDocument();
    expect(screen.getByText("job-def-456")).toBeInTheDocument();
    expect(screen.getByText(/admin@example\.com/)).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByLabelText("Prompt name")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
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

  it("fetches filtered jobs by prompt name and date", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ jobs: [sampleJobs[0]] }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    render(<JobHistorySection initialJobs={sampleJobs} />);

    fireEvent.change(screen.getByLabelText("Prompt name"), {
      target: { value: "history" },
    });
    fireEvent.change(screen.getByLabelText("Date"), {
      target: { value: "2026-06-10" },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/jobs?prompt=history&date=2026-06-10",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("job-abc-123")).toBeInTheDocument();
      expect(screen.queryByText("job-def-456")).not.toBeInTheDocument();
    });
  });

  it("shows a filtered empty state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ jobs: [] }),
      })),
    );

    render(<JobHistorySection initialJobs={sampleJobs} />);

    fireEvent.change(screen.getByLabelText("Prompt name"), {
      target: { value: "missing" },
    });

    await waitFor(() => {
      expect(
        screen.getByText("No prompt jobs match your filters."),
      ).toBeInTheDocument();
    });
  });
});

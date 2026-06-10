import { beforeEach, describe, expect, it, vi } from "vitest";
import { processJob } from "./agent-runner";

const mockGetJob = vi.fn();
const mockUpdateJobStatus = vi.fn();
const mockCreateCloudAgent = vi.fn();
const mockWaitForRun = vi.fn();
const mockExtractPrUrl = vi.fn();
const mockMarkPullRequestReady = vi.fn();

vi.mock("./jobs", () => ({
  getJob: (...args: unknown[]) => mockGetJob(...args),
  updateJobStatus: (...args: unknown[]) => mockUpdateJobStatus(...args),
}));

vi.mock("./cursor-api", () => ({
  createCloudAgent: (...args: unknown[]) => mockCreateCloudAgent(...args),
  waitForRun: (...args: unknown[]) => mockWaitForRun(...args),
  extractPrUrl: (...args: unknown[]) => mockExtractPrUrl(...args),
}));

vi.mock("./github", () => ({
  markPullRequestReady: (...args: unknown[]) => mockMarkPullRequestReady(...args),
}));

describe("agent-runner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMarkPullRequestReady.mockResolvedValue(true);
  });

  it("marks the pull request ready when the agent finishes with a PR URL", async () => {
    mockGetJob.mockResolvedValue({
      id: "job-1",
      status: "queued",
      prompt: "Add feature",
    });
    mockCreateCloudAgent.mockResolvedValue({
      agentId: "agent-1",
      runId: "run-1",
    });
    mockWaitForRun.mockResolvedValue({ status: "FINISHED" });
    mockExtractPrUrl.mockReturnValue("https://github.com/org/repo/pull/42");

    await processJob("job-1");

    expect(mockMarkPullRequestReady).toHaveBeenCalledWith(
      "https://github.com/org/repo/pull/42",
    );
    expect(mockUpdateJobStatus).toHaveBeenCalledWith("job-1", "done", {
      agentId: "agent-1",
      agentRunId: "run-1",
      prUrl: "https://github.com/org/repo/pull/42",
    });
  });

  it("still completes the job when marking the pull request ready fails", async () => {
    mockGetJob.mockResolvedValue({
      id: "job-1",
      status: "queued",
      prompt: "Add feature",
    });
    mockCreateCloudAgent.mockResolvedValue({
      agentId: "agent-1",
      runId: "run-1",
    });
    mockWaitForRun.mockResolvedValue({ status: "FINISHED" });
    mockExtractPrUrl.mockReturnValue("https://github.com/org/repo/pull/42");
    mockMarkPullRequestReady.mockRejectedValue(new Error("GitHub API 403"));

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await processJob("job-1");

    expect(mockUpdateJobStatus).toHaveBeenCalledWith("job-1", "done", {
      agentId: "agent-1",
      agentRunId: "run-1",
      prUrl: "https://github.com/org/repo/pull/42",
    });
    expect(warnSpy).toHaveBeenCalled();
  });
});

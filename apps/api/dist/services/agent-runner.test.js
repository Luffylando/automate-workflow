"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const agent_runner_1 = require("./agent-runner");
const mockGetJob = vitest_1.vi.fn();
const mockUpdateJobStatus = vitest_1.vi.fn();
const mockCreateCloudAgent = vitest_1.vi.fn();
const mockWaitForRun = vitest_1.vi.fn();
const mockExtractPrUrl = vitest_1.vi.fn();
const mockMarkPullRequestReady = vitest_1.vi.fn();
vitest_1.vi.mock("./jobs", () => ({
    getJob: (...args) => mockGetJob(...args),
    updateJobStatus: (...args) => mockUpdateJobStatus(...args),
}));
vitest_1.vi.mock("./cursor-api", () => ({
    createCloudAgent: (...args) => mockCreateCloudAgent(...args),
    waitForRun: (...args) => mockWaitForRun(...args),
    extractPrUrl: (...args) => mockExtractPrUrl(...args),
}));
vitest_1.vi.mock("./github", () => ({
    markPullRequestReady: (...args) => mockMarkPullRequestReady(...args),
}));
(0, vitest_1.describe)("agent-runner", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockMarkPullRequestReady.mockResolvedValue(true);
    });
    (0, vitest_1.it)("marks the pull request ready when the agent finishes with a PR URL", async () => {
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
        await (0, agent_runner_1.processJob)("job-1");
        (0, vitest_1.expect)(mockMarkPullRequestReady).toHaveBeenCalledWith("https://github.com/org/repo/pull/42");
        (0, vitest_1.expect)(mockUpdateJobStatus).toHaveBeenCalledWith("job-1", "done", {
            agentId: "agent-1",
            agentRunId: "run-1",
            prUrl: "https://github.com/org/repo/pull/42",
        });
    });
    (0, vitest_1.it)("still completes the job when marking the pull request ready fails", async () => {
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
        const warnSpy = vitest_1.vi.spyOn(console, "warn").mockImplementation(() => { });
        await (0, agent_runner_1.processJob)("job-1");
        (0, vitest_1.expect)(mockUpdateJobStatus).toHaveBeenCalledWith("job-1", "done", {
            agentId: "agent-1",
            agentRunId: "run-1",
            prUrl: "https://github.com/org/repo/pull/42",
        });
        (0, vitest_1.expect)(warnSpy).toHaveBeenCalled();
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processJob = processJob;
const cursor_api_1 = require("./cursor-api");
const github_1 = require("./github");
const jobs_1 = require("./jobs");
async function processJob(jobId) {
    const job = await (0, jobs_1.getJob)(jobId);
    if (!job || job.status !== "queued") {
        return;
    }
    await (0, jobs_1.updateJobStatus)(jobId, "running");
    try {
        const { agentId, runId } = await (0, cursor_api_1.createCloudAgent)(job.prompt);
        await (0, jobs_1.updateJobStatus)(jobId, "running", {
            agentId,
            agentRunId: runId,
        });
        const run = await (0, cursor_api_1.waitForRun)(agentId, runId);
        if (run.status === "FINISHED") {
            const prUrl = (0, cursor_api_1.extractPrUrl)(run);
            if (prUrl) {
                try {
                    await (0, github_1.markPullRequestReady)(prUrl);
                }
                catch (error) {
                    console.warn("Failed to mark pull request ready:", error instanceof Error ? error.message : error);
                }
            }
            await (0, jobs_1.updateJobStatus)(jobId, "done", {
                agentId,
                agentRunId: runId,
                prUrl,
            });
            return;
        }
        await (0, jobs_1.updateJobStatus)(jobId, "failed", {
            agentId,
            agentRunId: runId,
            error: run.result ?? `Agent run ended with status ${run.status}`,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to run agent";
        await (0, jobs_1.updateJobStatus)(jobId, "failed", { error: message });
    }
}

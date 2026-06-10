import {
  createCloudAgent,
  extractPrUrl,
  waitForRun,
} from "./cursor-api";
import { getJob, updateJobStatus } from "./jobs";

export async function processJob(jobId: string): Promise<void> {
  const job = await getJob(jobId);
  if (!job || job.status !== "queued") {
    return;
  }

  await updateJobStatus(jobId, "running");

  try {
    const { agentId, runId } = await createCloudAgent(job.prompt);

    await updateJobStatus(jobId, "running", {
      agentId,
      agentRunId: runId,
    });

    const run = await waitForRun(agentId, runId);

    if (run.status === "FINISHED") {
      await updateJobStatus(jobId, "done", {
        agentId,
        agentRunId: runId,
        prUrl: extractPrUrl(run),
      });
      return;
    }

    await updateJobStatus(jobId, "failed", {
      agentId,
      agentRunId: runId,
      error: run.result ?? `Agent run ended with status ${run.status}`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run agent";
    await updateJobStatus(jobId, "failed", { error: message });
  }
}

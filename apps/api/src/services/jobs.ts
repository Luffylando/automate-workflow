import { getDataSource } from "../db/data-source";
import { Job } from "../db/entities/Job";
import type { JobDto, JobStatus } from "../types";
import { toJobDto } from "./mappers";

export async function createJob(prompt: string): Promise<JobDto> {
  const dataSource = await getDataSource();
  const repo = dataSource.getRepository(Job);
  const job = repo.create({
    prompt,
    status: "queued",
    prUrl: null,
    agentId: null,
    agentRunId: null,
    error: null,
  });
  const saved = await repo.save(job);
  return toJobDto(saved);
}

export async function getJob(id: string): Promise<JobDto | null> {
  const dataSource = await getDataSource();
  const job = await dataSource.getRepository(Job).findOne({ where: { id } });
  return job ? toJobDto(job) : null;
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
  updates: Partial<
    Pick<JobDto, "prUrl" | "agentId" | "agentRunId" | "error">
  > = {},
): Promise<JobDto | null> {
  const dataSource = await getDataSource();
  const repo = dataSource.getRepository(Job);
  const job = await repo.findOne({ where: { id } });

  if (!job) {
    return null;
  }

  job.status = status;
  if ("prUrl" in updates) job.prUrl = updates.prUrl ?? null;
  if ("agentId" in updates) job.agentId = updates.agentId ?? null;
  if ("agentRunId" in updates) job.agentRunId = updates.agentRunId ?? null;
  if ("error" in updates) job.error = updates.error ?? null;

  const saved = await repo.save(job);
  return toJobDto(saved);
}

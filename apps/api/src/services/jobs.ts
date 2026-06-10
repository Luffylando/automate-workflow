import { getDataSource } from "../db/data-source";
import { Job } from "../db/entities/Job";
import type { JobDto, JobStatus } from "../types";
import { toJobDto } from "./mappers";

const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 100;

export interface CreateJobInput {
  prompt: string;
  submittedById?: string;
  submittedByEmail?: string;
  metadata?: Record<string, unknown>;
}

export interface ListJobsOptions {
  limit?: number;
  offset?: number;
}

export async function createJob(input: CreateJobInput): Promise<JobDto> {
  const dataSource = await getDataSource();
  const repo = dataSource.getRepository(Job);
  const job = repo.create({
    prompt: input.prompt,
    status: "queued",
    prUrl: null,
    agentId: null,
    agentRunId: null,
    error: null,
    submittedById: input.submittedById ?? null,
    submittedByEmail: input.submittedByEmail ?? null,
    metadata: input.metadata ?? null,
  });
  const saved = await repo.save(job);
  return toJobDto(saved);
}

export async function listJobs(
  options: ListJobsOptions = {},
): Promise<JobDto[]> {
  const dataSource = await getDataSource();
  const limit = Math.min(
    Math.max(options.limit ?? DEFAULT_LIST_LIMIT, 1),
    MAX_LIST_LIMIT,
  );
  const offset = Math.max(options.offset ?? 0, 0);
  const jobs = await dataSource.getRepository(Job).find({
    order: { createdAt: "DESC" },
    take: limit,
    skip: offset,
  });
  return jobs.map(toJobDto);
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

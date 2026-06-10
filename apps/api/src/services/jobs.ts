import { getDataSource } from "../db/data-source";
import { Job } from "../db/entities/Job";
import type { JobDto, JobStatus } from "../types";
import { toJobDto } from "./mappers";
import {
  lookupSubmitterEmailsByIds,
  resolveSubmitterEmail,
} from "./submitter";

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
  prompt?: string;
  date?: string;
}

function parseUtcDateRange(
  date: string,
): { start: Date; end: Date } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const start = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

async function enrichJobDto(job: Job): Promise<JobDto> {
  const dto = toJobDto(job);
  const email = await resolveSubmitterEmail(
    job.submittedById,
    job.submittedByEmail,
  );

  if (!email) {
    return dto;
  }

  return { ...dto, submittedByEmail: email };
}

async function enrichJobDtos(jobs: Job[]): Promise<JobDto[]> {
  const dtos = jobs.map(toJobDto);
  const idsNeedingEmail = new Set<string>();

  for (let index = 0; index < jobs.length; index += 1) {
    const job = jobs[index];
    const dto = dtos[index];
    if (!dto) {
      continue;
    }

    if (!dto.submittedByEmail?.trim() && job?.submittedById) {
      idsNeedingEmail.add(job.submittedById);
    }
  }

  if (idsNeedingEmail.size === 0) {
    return dtos;
  }

  const emailsById = await lookupSubmitterEmailsByIds([...idsNeedingEmail]);

  return dtos.map((dto, index) => {
    if (dto.submittedByEmail?.trim()) {
      return dto;
    }

    const submittedById = jobs[index]?.submittedById;
    if (!submittedById) {
      return dto;
    }

    const email = emailsById.get(submittedById);
    return email ? { ...dto, submittedByEmail: email } : dto;
  });
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
  return enrichJobDto(saved);
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
  const query = dataSource
    .getRepository(Job)
    .createQueryBuilder("job")
    .orderBy("job.createdAt", "DESC")
    .take(limit)
    .skip(offset);

  const promptSearch = options.prompt?.trim();
  if (promptSearch) {
    query.andWhere("job.prompt ILIKE :prompt", {
      prompt: `%${promptSearch}%`,
    });
  }

  if (options.date) {
    const range = parseUtcDateRange(options.date);
    if (range) {
      query.andWhere("job.createdAt >= :start AND job.createdAt < :end", {
        start: range.start,
        end: range.end,
      });
    }
  }

  const jobs = await query.getMany();
  return enrichJobDtos(jobs);
}

export async function getJob(id: string): Promise<JobDto | null> {
  const dataSource = await getDataSource();
  const job = await dataSource.getRepository(Job).findOne({ where: { id } });
  return job ? enrichJobDto(job) : null;
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
  return enrichJobDto(saved);
}

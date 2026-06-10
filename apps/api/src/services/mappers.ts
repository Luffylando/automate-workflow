import { Job } from "../db/entities/Job";
import { User } from "../db/entities/User";
import type { JobDto, UserDto } from "../types";

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toJobDto(job: Job): JobDto {
  return {
    id: job.id,
    prompt: job.prompt,
    status: job.status,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    prUrl: job.prUrl ?? undefined,
    agentId: job.agentId ?? undefined,
    agentRunId: job.agentRunId ?? undefined,
    error: job.error ?? undefined,
  };
}

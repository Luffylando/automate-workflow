import { Job } from "../db/entities/Job";
import { Todo } from "../db/entities/Todo";
import type { JobDto, TodoDto } from "../types";

export function toTodoDto(todo: Todo): TodoDto {
  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
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

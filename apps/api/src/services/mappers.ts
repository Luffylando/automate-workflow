import { Job } from "../db/entities/Job";
import { Todo } from "../db/entities/Todo";
import { TodoRating } from "../db/entities/TodoRating";
import { User } from "../db/entities/User";
import type { JobDto, TodoDto, TodoRatingDto, UserDto } from "../types";

export function toTodoDto(todo: Todo): TodoDto {
  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

export function toTodoRatingDto(rating: TodoRating): TodoRatingDto {
  return {
    id: rating.id,
    userId: rating.userId,
    todoId: rating.todoId,
    value: rating.value,
    createdAt: rating.createdAt.toISOString(),
  };
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
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

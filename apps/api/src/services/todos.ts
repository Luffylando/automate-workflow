import { getDataSource } from "../db/data-source";
import { Todo } from "../db/entities/Todo";
import type {
  TodoDto,
  TodoPriority,
  TodoStatsDto,
  TodoStatus,
} from "../types";
import { toTodoDto } from "./mappers";
import {
  deleteRatingsForTodo,
  getRatingSummariesForTodos,
  getUserRatingsForTodos,
} from "./todo-ratings";

export interface CreateTodoInput {
  title: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  dueDate?: string | null;
  tags?: string[];
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
  priority?: TodoPriority;
  status?: TodoStatus;
  dueDate?: string | null;
  tags?: string[];
}

const TODO_PRIORITIES: TodoPriority[] = ["low", "medium", "high"];
const TODO_STATUSES: TodoStatus[] = [
  "todo",
  "in_progress",
  "done",
  "cancelled",
];

export function isTodoPriority(value: string): value is TodoPriority {
  return TODO_PRIORITIES.includes(value as TodoPriority);
}

export function isTodoStatus(value: string): value is TodoStatus {
  return TODO_STATUSES.includes(value as TodoStatus);
}

export function normalizeTags(tags: unknown): string[] | null {
  if (tags === undefined) {
    return null;
  }

  if (!Array.isArray(tags)) {
    return null;
  }

  const normalized = tags
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean);

  if (normalized.some((tag) => tag.length > 50)) {
    return null;
  }

  return [...new Set(normalized)].slice(0, 10);
}

export function parseDueDate(value: unknown): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

function completedFromStatus(status: TodoStatus): boolean {
  return status === "done" || status === "cancelled";
}

function statusFromCompleted(
  completed: boolean,
  currentStatus: TodoStatus,
): TodoStatus {
  if (completed) {
    return currentStatus === "cancelled" ? "cancelled" : "done";
  }

  if (currentStatus === "done" || currentStatus === "cancelled") {
    return "todo";
  }

  return currentStatus;
}

function enrichTodoDto(
  todo: TodoDto,
  summaries: Map<string, { averageRating: number | null; ratingCount: number }>,
  userRatings: Map<string, number>,
): TodoDto {
  const summary = summaries.get(todo.id);
  const myRating = userRatings.get(todo.id);

  return {
    ...todo,
    averageRating: summary?.averageRating ?? null,
    ratingCount: summary?.ratingCount ?? 0,
    myRating: myRating ?? null,
  };
}

export async function listTodos(userId?: string): Promise<TodoDto[]> {
  const dataSource = await getDataSource();
  const todos = await dataSource.getRepository(Todo).find({
    order: { createdAt: "DESC" },
  });
  const todoDtos = todos.map(toTodoDto);
  const todoIds = todoDtos.map((todo) => todo.id);
  const summaries = await getRatingSummariesForTodos(todoIds);
  const userRatings = userId
    ? await getUserRatingsForTodos(userId, todoIds)
    : new Map<string, number>();

  return todoDtos.map((todo) => enrichTodoDto(todo, summaries, userRatings));
}

export async function getTodoById(
  id: string,
  userId?: string,
): Promise<TodoDto | null> {
  const dataSource = await getDataSource();
  const todo = await dataSource.getRepository(Todo).findOne({ where: { id } });

  if (!todo) {
    return null;
  }

  const dto = toTodoDto(todo);
  const summaries = await getRatingSummariesForTodos([id]);
  const userRatings = userId
    ? await getUserRatingsForTodos(userId, [id])
    : new Map<string, number>();

  return enrichTodoDto(dto, summaries, userRatings);
}

export async function createTodo(
  input: CreateTodoInput | string,
): Promise<TodoDto> {
  const data = typeof input === "string" ? { title: input } : input;
  const status = data.status ?? "todo";
  const dataSource = await getDataSource();
  const repo = dataSource.getRepository(Todo);
  const dueDate = parseDueDate(data.dueDate ?? undefined);

  const todo = repo.create({
    title: data.title,
    completed: completedFromStatus(status),
    priority: data.priority ?? "medium",
    status,
    dueDate: dueDate ?? null,
    tags: normalizeTags(data.tags ?? []) ?? [],
  });
  const saved = await repo.save(todo);
  return toTodoDto(saved);
}

export async function updateTodo(
  id: string,
  updates: UpdateTodoInput,
): Promise<TodoDto | null> {
  const dataSource = await getDataSource();
  const repo = dataSource.getRepository(Todo);
  const todo = await repo.findOne({ where: { id } });

  if (!todo) {
    return null;
  }

  if (updates.title !== undefined) {
    todo.title = updates.title;
  }

  if (updates.priority !== undefined) {
    todo.priority = updates.priority;
  }

  if (updates.status !== undefined) {
    todo.status = updates.status;
    todo.completed = completedFromStatus(updates.status);
  }

  if (updates.completed !== undefined) {
    todo.completed = updates.completed;
    todo.status = statusFromCompleted(updates.completed, todo.status);
  }

  if (updates.dueDate !== undefined) {
    const dueDate = parseDueDate(updates.dueDate);
    todo.dueDate = dueDate ?? null;
  }

  if (updates.tags !== undefined) {
    const tags = normalizeTags(updates.tags);
    if (tags) {
      todo.tags = tags;
    }
  }

  const saved = await repo.save(todo);
  return toTodoDto(saved);
}

export async function deleteTodo(id: string): Promise<boolean> {
  const dataSource = await getDataSource();
  const result = await dataSource.getRepository(Todo).delete({ id });
  const deleted = (result.affected ?? 0) > 0;

  if (deleted) {
    await deleteRatingsForTodo(id);
  }

  return deleted;
}

export async function getTodoStats(): Promise<TodoStatsDto> {
  const dataSource = await getDataSource();
  const repo = dataSource.getRepository(Todo);
  const todos = await repo.find();
  const now = new Date();

  const stats: TodoStatsDto = {
    total: todos.length,
    open: 0,
    done: 0,
    cancelled: 0,
    inProgress: 0,
    overdue: 0,
    highPriority: 0,
    rated: 0,
    averageRating: null,
  };

  for (const todo of todos) {
    switch (todo.status) {
      case "done":
        stats.done += 1;
        break;
      case "cancelled":
        stats.cancelled += 1;
        break;
      case "in_progress":
        stats.inProgress += 1;
        stats.open += 1;
        break;
      default:
        stats.open += 1;
        break;
    }

    const isClosed = todo.status === "done" || todo.status === "cancelled";

    if (
      !isClosed &&
      todo.dueDate &&
      todo.dueDate.getTime() < now.getTime()
    ) {
      stats.overdue += 1;
    }

    if (!isClosed && todo.priority === "high") {
      stats.highPriority += 1;
    }
  }

  const summaries = await getRatingSummariesForTodos(todos.map((todo) => todo.id));
  let ratingTotal = 0;
  let ratingCount = 0;

  for (const summary of summaries.values()) {
    if (summary.ratingCount > 0) {
      stats.rated += 1;
    }

    if (summary.averageRating != null && summary.ratingCount > 0) {
      ratingTotal += summary.averageRating * summary.ratingCount;
      ratingCount += summary.ratingCount;
    }
  }

  if (ratingCount > 0) {
    stats.averageRating = Math.round((ratingTotal / ratingCount) * 10) / 10;
  }

  return stats;
}

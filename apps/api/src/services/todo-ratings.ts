import { getDataSource } from "../db/data-source";
import { Todo } from "../db/entities/Todo";
import { TodoRating } from "../db/entities/TodoRating";
import type { TodoRatingDto } from "../types";
import { toTodoRatingDto } from "./mappers";

export class InvalidRatingValueError extends Error {
  constructor() {
    super("Rating must be an integer between 1 and 5");
    this.name = "InvalidRatingValueError";
  }
}

export class DuplicateRatingError extends Error {
  constructor() {
    super("You have already rated this todo");
    this.name = "DuplicateRatingError";
  }
}

export class TodoNotFoundError extends Error {
  constructor() {
    super("Todo not found");
    this.name = "TodoNotFoundError";
  }
}

export interface TodoRatingSummary {
  averageRating: number | null;
  ratingCount: number;
}

function isValidRatingValue(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export async function rateTodo(
  userId: string,
  todoId: string,
  value: number,
): Promise<TodoRatingDto> {
  if (!isValidRatingValue(value)) {
    throw new InvalidRatingValueError();
  }

  const dataSource = await getDataSource();
  const todoRepo = dataSource.getRepository(Todo);
  const ratingRepo = dataSource.getRepository(TodoRating);

  const todo = await todoRepo.findOne({ where: { id: todoId } });
  if (!todo) {
    throw new TodoNotFoundError();
  }

  const existing = await ratingRepo.findOne({ where: { userId, todoId } });
  if (existing) {
    throw new DuplicateRatingError();
  }

  const rating = ratingRepo.create({ userId, todoId, value });
  const saved = await ratingRepo.save(rating);
  return toTodoRatingDto(saved);
}

export async function deleteRatingsForTodo(todoId: string): Promise<void> {
  const dataSource = await getDataSource();
  await dataSource.getRepository(TodoRating).delete({ todoId });
}

export async function getRatingSummariesForTodos(
  todoIds: string[],
): Promise<Map<string, TodoRatingSummary>> {
  const summaries = new Map<string, TodoRatingSummary>();

  if (todoIds.length === 0) {
    return summaries;
  }

  const dataSource = await getDataSource();
  const rows = await dataSource
    .getRepository(TodoRating)
    .createQueryBuilder("rating")
    .select("rating.todoId", "todoId")
    .addSelect("AVG(rating.value)", "average")
    .addSelect("COUNT(rating.id)", "count")
    .where("rating.todoId IN (:...todoIds)", { todoIds })
    .groupBy("rating.todoId")
    .getRawMany<{ todoId: string; average: string; count: string }>();

  for (const row of rows) {
    summaries.set(row.todoId, {
      averageRating: Number(row.average),
      ratingCount: Number(row.count),
    });
  }

  return summaries;
}

export async function getUserRatingsForTodos(
  userId: string,
  todoIds: string[],
): Promise<Map<string, number>> {
  const ratings = new Map<string, number>();

  if (todoIds.length === 0) {
    return ratings;
  }

  const dataSource = await getDataSource();
  const rows = await dataSource.getRepository(TodoRating).find({
    where: todoIds.map((todoId) => ({ userId, todoId })),
    select: ["todoId", "value"],
  });

  for (const row of rows) {
    ratings.set(row.todoId, row.value);
  }

  return ratings;
}

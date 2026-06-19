import { getDataSource } from "../db/data-source";
import { Todo, type TodoPriority } from "../db/entities/Todo";
import type { TodoDto, TodoStatsDto } from "../types";
import { toTodoDto } from "./mappers";
import {
  deleteRatingsForTodo,
  getRatingSummariesForTodos,
  getUserRatingsForTodos,
} from "./todo-ratings";

export interface CreateTodoInput {
  title: string;
  description?: string | null;
  priority?: TodoPriority;
  dueDate?: Date | null;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  priority?: TodoPriority;
  dueDate?: Date | null;
  completed?: boolean;
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

export async function getTodoById(id: string): Promise<TodoDto | null> {
  const dataSource = await getDataSource();
  const todo = await dataSource.getRepository(Todo).findOne({ where: { id } });
  return todo ? toTodoDto(todo) : null;
}

export async function createTodo(input: CreateTodoInput): Promise<TodoDto> {
  const dataSource = await getDataSource();
  const repo = dataSource.getRepository(Todo);
  const todo = repo.create({
    title: input.title,
    description: input.description ?? null,
    priority: input.priority ?? "medium",
    dueDate: input.dueDate ?? null,
    completed: false,
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

  if (updates.description !== undefined) {
    todo.description = updates.description;
  }

  if (updates.priority !== undefined) {
    todo.priority = updates.priority;
  }

  if (updates.dueDate !== undefined) {
    todo.dueDate = updates.dueDate;
  }

  if (updates.completed !== undefined) {
    todo.completed = updates.completed;
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
  const now = new Date();

  const [total, completed, overdue, highPriority, priorityRows, ratingRow] =
    await Promise.all([
      repo.count(),
      repo.count({ where: { completed: true } }),
      repo
        .createQueryBuilder("todo")
        .where("todo.completed = false")
        .andWhere("todo.dueDate IS NOT NULL")
        .andWhere("todo.dueDate < :now", { now })
        .getCount(),
      repo.count({ where: { completed: false, priority: "high" } }),
      repo
        .createQueryBuilder("todo")
        .select("todo.priority", "priority")
        .addSelect("COUNT(todo.id)", "count")
        .groupBy("todo.priority")
        .getRawMany<{ priority: TodoPriority; count: string }>(),
      dataSource
        .createQueryBuilder()
        .select("AVG(rating.value)", "average")
        .from("todo_ratings", "rating")
        .getRawOne<{ average: string | null }>(),
    ]);

  const byPriority: Record<TodoPriority, number> = {
    low: 0,
    medium: 0,
    high: 0,
  };

  for (const row of priorityRows) {
    byPriority[row.priority] = Number(row.count);
  }

  const averageRating =
    ratingRow?.average != null ? Number(ratingRow.average) : null;

  return {
    total,
    open: total - completed,
    completed,
    overdue,
    highPriority,
    averageRating,
    byPriority,
  };
}

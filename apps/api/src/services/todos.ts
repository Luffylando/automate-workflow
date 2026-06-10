import { getDataSource } from "../db/data-source";
import { Todo } from "../db/entities/Todo";
import type { TodoDto } from "../types";
import { toTodoDto } from "./mappers";

export async function listTodos(): Promise<TodoDto[]> {
  const dataSource = await getDataSource();
  const todos = await dataSource.getRepository(Todo).find({
    order: { createdAt: "DESC" },
  });
  return todos.map(toTodoDto);
}

export async function getTodoById(id: string): Promise<TodoDto | null> {
  const dataSource = await getDataSource();
  const todo = await dataSource.getRepository(Todo).findOne({ where: { id } });
  return todo ? toTodoDto(todo) : null;
}

export async function createTodo(title: string): Promise<TodoDto> {
  const dataSource = await getDataSource();
  const repo = dataSource.getRepository(Todo);
  const todo = repo.create({ title, completed: false });
  const saved = await repo.save(todo);
  return toTodoDto(saved);
}

export async function updateTodo(
  id: string,
  updates: { title?: string; completed?: boolean },
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

  if (updates.completed !== undefined) {
    todo.completed = updates.completed;
  }

  const saved = await repo.save(todo);
  return toTodoDto(saved);
}

export async function deleteTodo(id: string): Promise<boolean> {
  const dataSource = await getDataSource();
  const result = await dataSource.getRepository(Todo).delete({ id });
  return (result.affected ?? 0) > 0;
}

import type { TodoPriority } from "../db/entities/Todo";

const TODO_PRIORITIES: TodoPriority[] = ["low", "medium", "high"];

export function isValidTodoPriority(value: string): value is TodoPriority {
  return TODO_PRIORITIES.includes(value as TodoPriority);
}

export function parseOptionalDueDate(
  value: string | null | undefined,
): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

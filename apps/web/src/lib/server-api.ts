import { cookies } from "next/headers";
import type { AdminSession, Todo } from "./types";
import { getApiUrl } from "./api-url";

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const response = await fetch(`${getApiUrl()}/api/auth/me`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    admin?: boolean;
    sub?: string;
    email?: string;
  };
  if (!data.admin) {
    return null;
  }

  return {
    role: "admin",
    sub: data.sub ?? "admin",
    email: data.email ?? "admin@localhost",
  };
}

export async function listTodos(): Promise<Todo[]> {
  const response = await fetch(`${getApiUrl()}/api/todos`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }

  const data = (await response.json()) as { todos: Todo[] };
  return data.todos;
}

import { cookies } from "next/headers";
import type { AuthSession, Job, Todo, User, UserRole } from "./types";
import { getApiUrl } from "./api-url";

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const response = await fetch(`${getApiUrl()}/api/auth/me`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    authenticated?: boolean;
    role?: UserRole;
    sub?: string;
    email?: string;
  };

  if (!data.authenticated || !data.role) {
    return null;
  }

  return {
    role: data.role,
    sub: data.sub ?? "unknown",
    email: data.email ?? "unknown",
  };
}

export async function getAdminSession(): Promise<AuthSession | null> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return null;
  }
  return session;
}

export async function listTodos(): Promise<Todo[]> {
  const cookieStore = await cookies();
  const response = await fetch(`${getApiUrl()}/api/todos`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }

  const data = (await response.json()) as { todos: Todo[] };
  return data.todos;
}

export async function listUsers(): Promise<User[]> {
  const cookieStore = await cookies();
  const response = await fetch(`${getApiUrl()}/api/users`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = (await response.json()) as { users: User[] };
  return data.users;
}

export async function listJobs(): Promise<Job[]> {
  const cookieStore = await cookies();
  const response = await fetch(`${getApiUrl()}/api/jobs`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }

  const data = (await response.json()) as { jobs: Job[] };
  return data.jobs;
}

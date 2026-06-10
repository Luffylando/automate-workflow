import { cookies } from "next/headers";
import type { AdminSession, User } from "./types";
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

  const data = (await response.json()) as { admin?: boolean; sub?: string };
  if (!data.admin) {
    return null;
  }

  return { role: "admin", sub: data.sub ?? "admin" };
}

export async function listUsers(): Promise<User[]> {
  const response = await fetch(`${getApiUrl()}/api/users`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = (await response.json()) as { users: User[] };
  return data.users;
}

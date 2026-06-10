import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { User } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

const SEED_USERS: Pick<User, "name" | "email">[] = [
  { name: "Alex Rivera", email: "alex@example.com" },
  { name: "Jordan Lee", email: "jordan@example.com" },
  { name: "Sam Patel", email: "sam@example.com" },
];

function createSeedUsers(): User[] {
  const now = new Date().toISOString();
  return SEED_USERS.map((user) => ({
    id: randomUUID(),
    ...user,
    createdAt: now,
  }));
}

async function writeUsers(users: User[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

async function ensureDataFile(): Promise<User[]> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(USERS_FILE, "utf8");
    const users = JSON.parse(raw) as User[];
    if (users.length === 0) {
      const seeded = createSeedUsers();
      await writeUsers(seeded);
      return seeded;
    }
    return users;
  } catch {
    const seeded = createSeedUsers();
    await writeUsers(seeded);
    return seeded;
  }
}

export async function listUsers(): Promise<User[]> {
  const users = await ensureDataFile();
  return [...users].sort((a, b) => a.name.localeCompare(b.name));
}

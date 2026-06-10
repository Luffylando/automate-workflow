import { mkdtemp, rm } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listUsers } from "./users";

describe("listUsers", () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tempDir = await mkdtemp(path.join(os.tmpdir(), "users-test-"));
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  });

  it("seeds default users when the data file is missing", async () => {
    const users = await listUsers();

    expect(users).toHaveLength(3);
    expect(users.map((user) => user.email)).toEqual([
      "alex@example.com",
      "jordan@example.com",
      "sam@example.com",
    ]);
    users.forEach((user) => {
      expect(user.id).toBeTruthy();
      expect(user.createdAt).toBeTruthy();
    });
  });

  it("returns users sorted by name", async () => {
    const users = await listUsers();

    expect(users.map((user) => user.name)).toEqual([
      "Alex Rivera",
      "Jordan Lee",
      "Sam Patel",
    ]);
  });
});

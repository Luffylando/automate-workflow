import { describe, expect, it } from "vitest";
import { Job } from "../db/entities/Job";
import { User } from "../db/entities/User";
import { toJobDto, toUserDto } from "./mappers";

describe("mappers", () => {
  it("maps a user entity to dto", () => {
    const user = {
      id: "user-1",
      name: "Alex Rivera",
      email: "alex@example.com",
      createdAt: new Date("2026-06-10T10:00:00.000Z"),
    } as User;

    expect(toUserDto(user)).toEqual({
      id: "user-1",
      name: "Alex Rivera",
      email: "alex@example.com",
      createdAt: "2026-06-10T10:00:00.000Z",
    });
  });

  it("maps a job entity to dto", () => {
    const job = {
      id: "job-1",
      prompt: "Add todos",
      status: "queued",
      prUrl: null,
      agentId: null,
      agentRunId: null,
      error: null,
      createdAt: new Date("2026-06-10T10:00:00.000Z"),
      updatedAt: new Date("2026-06-10T10:05:00.000Z"),
    } as Job;

    expect(toJobDto(job)).toEqual({
      id: "job-1",
      prompt: "Add todos",
      status: "queued",
      createdAt: "2026-06-10T10:00:00.000Z",
      updatedAt: "2026-06-10T10:05:00.000Z",
    });
  });
});

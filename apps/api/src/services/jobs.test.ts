import { beforeEach, describe, expect, it, vi } from "vitest";
import { Job } from "../db/entities/Job";
import { createJob, listJobs } from "./jobs";

const mockSave = vi.fn();
const mockCreate = vi.fn();
const mockFind = vi.fn();
const mockGetRepository = vi.fn();

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(async () => ({
    getRepository: mockGetRepository,
  })),
}));

describe("jobs service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRepository.mockReturnValue({
      create: mockCreate,
      save: mockSave,
      find: mockFind,
    });
  });

  it("creates a job with submitter and metadata", async () => {
    const createdAt = new Date("2026-06-10T10:00:00.000Z");
    const updatedAt = new Date("2026-06-10T10:05:00.000Z");
    const entity = {
      id: "job-1",
      prompt: "Add todos",
      status: "queued",
      prUrl: null,
      agentId: null,
      agentRunId: null,
      error: null,
      submittedById: "admin-1",
      submittedByEmail: "admin@example.com",
      metadata: { source: "prompt-console" },
      createdAt,
      updatedAt,
    } as Job;

    mockCreate.mockReturnValue(entity);
    mockSave.mockResolvedValue(entity);

    const result = await createJob({
      prompt: "Add todos",
      submittedById: "admin-1",
      submittedByEmail: "admin@example.com",
      metadata: { source: "prompt-console" },
    });

    expect(mockCreate).toHaveBeenCalledWith({
      prompt: "Add todos",
      status: "queued",
      prUrl: null,
      agentId: null,
      agentRunId: null,
      error: null,
      submittedById: "admin-1",
      submittedByEmail: "admin@example.com",
      metadata: { source: "prompt-console" },
    });
    expect(result).toEqual({
      id: "job-1",
      prompt: "Add todos",
      status: "queued",
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      submittedById: "admin-1",
      submittedByEmail: "admin@example.com",
      metadata: { source: "prompt-console" },
    });
  });

  it("lists jobs ordered by creation time", async () => {
    const createdAt = new Date("2026-06-10T10:00:00.000Z");
    const updatedAt = new Date("2026-06-10T10:05:00.000Z");
    const jobs = [
      {
        id: "job-2",
        prompt: "Second",
        status: "done",
        prUrl: "https://github.com/org/repo/pull/1",
        agentId: "agent-2",
        agentRunId: "run-2",
        error: null,
        submittedById: "admin-1",
        submittedByEmail: "admin@example.com",
        metadata: { source: "admin-prompt" },
        createdAt,
        updatedAt,
      },
      {
        id: "job-1",
        prompt: "First",
        status: "failed",
        prUrl: null,
        agentId: null,
        agentRunId: null,
        error: "Agent failed",
        submittedById: null,
        submittedByEmail: null,
        metadata: null,
        createdAt,
        updatedAt,
      },
    ] as Job[];

    mockFind.mockResolvedValue(jobs);

    const result = await listJobs({ limit: 10, offset: 0 });

    expect(mockFind).toHaveBeenCalledWith({
      order: { createdAt: "DESC" },
      take: 10,
      skip: 0,
    });
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("job-2");
    expect(result[1]?.error).toBe("Agent failed");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { Job } from "../db/entities/Job";
import { createJob, listJobs } from "./jobs";
import { lookupSubmitterEmailsByIds } from "./submitter";

const mockSave = vi.fn();
const mockCreate = vi.fn();
const mockGetMany = vi.fn();
const mockQueryBuilder = {
  orderBy: vi.fn(),
  take: vi.fn(),
  skip: vi.fn(),
  andWhere: vi.fn(),
  getMany: mockGetMany,
};
const mockCreateQueryBuilder = vi.fn();
const mockGetRepository = vi.fn();

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(async () => ({
    getRepository: mockGetRepository,
  })),
}));

vi.mock("./submitter", () => ({
  resolveSubmitterEmail: vi.fn(
    async (
      submittedById: string | null | undefined,
      submittedByEmail: string | null | undefined,
    ) => submittedByEmail?.trim() || undefined,
  ),
  lookupSubmitterEmailsByIds: vi.fn(async () => new Map()),
}));

describe("jobs service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryBuilder.orderBy.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.take.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.skip.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.andWhere.mockReturnValue(mockQueryBuilder);
    mockCreateQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockGetRepository.mockReturnValue({
      create: mockCreate,
      save: mockSave,
      createQueryBuilder: mockCreateQueryBuilder,
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

    mockGetMany.mockResolvedValue(jobs);

    const result = await listJobs({ limit: 10, offset: 0 });

    expect(mockCreateQueryBuilder).toHaveBeenCalledWith("job");
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
      "job.createdAt",
      "DESC",
    );
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("job-2");
    expect(result[1]?.error).toBe("Agent failed");
  });

  it("backfills missing submitter emails when listing jobs", async () => {
    const createdAt = new Date("2026-06-10T10:00:00.000Z");
    const updatedAt = new Date("2026-06-10T10:05:00.000Z");
    const jobs = [
      {
        id: "job-1",
        prompt: "Legacy prompt",
        status: "done",
        prUrl: null,
        agentId: null,
        agentRunId: null,
        error: null,
        submittedById: "admin-1",
        submittedByEmail: null,
        metadata: null,
        createdAt,
        updatedAt,
      },
    ] as Job[];

    mockGetMany.mockResolvedValue(jobs);
    vi.mocked(lookupSubmitterEmailsByIds).mockResolvedValue(
      new Map([["admin-1", "legacy-admin@example.com"]]),
    );

    const result = await listJobs();

    expect(lookupSubmitterEmailsByIds).toHaveBeenCalledWith(["admin-1"]);
    expect(result[0]?.submittedByEmail).toBe("legacy-admin@example.com");
  });

  it("filters jobs by prompt name and date", async () => {
    mockGetMany.mockResolvedValue([]);

    await listJobs({
      prompt: "history",
      date: "2026-06-10",
    });

    expect(mockQueryBuilder.andWhere).toHaveBeenNthCalledWith(
      1,
      "job.prompt ILIKE :prompt",
      { prompt: "%history%" },
    );
    expect(mockQueryBuilder.andWhere).toHaveBeenNthCalledWith(
      2,
      "job.createdAt >= :start AND job.createdAt < :end",
      {
        start: new Date("2026-06-10T00:00:00.000Z"),
        end: new Date("2026-06-11T00:00:00.000Z"),
      },
    );
  });
});

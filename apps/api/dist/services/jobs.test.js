"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const jobs_1 = require("./jobs");
const submitter_1 = require("./submitter");
const mockSave = vitest_1.vi.fn();
const mockCreate = vitest_1.vi.fn();
const mockGetMany = vitest_1.vi.fn();
const mockQueryBuilder = {
    orderBy: vitest_1.vi.fn(),
    take: vitest_1.vi.fn(),
    skip: vitest_1.vi.fn(),
    andWhere: vitest_1.vi.fn(),
    getMany: mockGetMany,
};
const mockCreateQueryBuilder = vitest_1.vi.fn();
const mockGetRepository = vitest_1.vi.fn();
vitest_1.vi.mock("../db/data-source", () => ({
    getDataSource: vitest_1.vi.fn(async () => ({
        getRepository: mockGetRepository,
    })),
}));
vitest_1.vi.mock("./submitter", () => ({
    resolveSubmitterEmail: vitest_1.vi.fn(async (submittedById, submittedByEmail) => submittedByEmail?.trim() || undefined),
    lookupSubmitterEmailsByIds: vitest_1.vi.fn(async () => new Map()),
}));
(0, vitest_1.describe)("jobs service", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
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
    (0, vitest_1.it)("creates a job with submitter and metadata", async () => {
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
        };
        mockCreate.mockReturnValue(entity);
        mockSave.mockResolvedValue(entity);
        const result = await (0, jobs_1.createJob)({
            prompt: "Add todos",
            submittedById: "admin-1",
            submittedByEmail: "admin@example.com",
            metadata: { source: "prompt-console" },
        });
        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledWith({
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
        (0, vitest_1.expect)(result).toEqual({
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
    (0, vitest_1.it)("lists jobs ordered by creation time", async () => {
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
        ];
        mockGetMany.mockResolvedValue(jobs);
        const result = await (0, jobs_1.listJobs)({ limit: 10, offset: 0 });
        (0, vitest_1.expect)(mockCreateQueryBuilder).toHaveBeenCalledWith("job");
        (0, vitest_1.expect)(mockQueryBuilder.orderBy).toHaveBeenCalledWith("job.createdAt", "DESC");
        (0, vitest_1.expect)(mockQueryBuilder.take).toHaveBeenCalledWith(10);
        (0, vitest_1.expect)(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
        (0, vitest_1.expect)(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
        (0, vitest_1.expect)(result).toHaveLength(2);
        (0, vitest_1.expect)(result[0]?.id).toBe("job-2");
        (0, vitest_1.expect)(result[1]?.error).toBe("Agent failed");
    });
    (0, vitest_1.it)("backfills missing submitter emails when listing jobs", async () => {
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
        ];
        mockGetMany.mockResolvedValue(jobs);
        vitest_1.vi.mocked(submitter_1.lookupSubmitterEmailsByIds).mockResolvedValue(new Map([["admin-1", "legacy-admin@example.com"]]));
        const result = await (0, jobs_1.listJobs)();
        (0, vitest_1.expect)(submitter_1.lookupSubmitterEmailsByIds).toHaveBeenCalledWith(["admin-1"]);
        (0, vitest_1.expect)(result[0]?.submittedByEmail).toBe("legacy-admin@example.com");
    });
    (0, vitest_1.it)("filters jobs by prompt name and date", async () => {
        mockGetMany.mockResolvedValue([]);
        await (0, jobs_1.listJobs)({
            prompt: "history",
            date: "2026-06-10",
        });
        (0, vitest_1.expect)(mockQueryBuilder.andWhere).toHaveBeenNthCalledWith(1, "job.prompt ILIKE :prompt", { prompt: "%history%" });
        (0, vitest_1.expect)(mockQueryBuilder.andWhere).toHaveBeenNthCalledWith(2, "job.createdAt >= :start AND job.createdAt < :end", {
            start: new Date("2026-06-10T00:00:00.000Z"),
            end: new Date("2026-06-11T00:00:00.000Z"),
        });
    });
});

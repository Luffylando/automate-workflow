"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const jobs_1 = require("./jobs");
const mockSave = vitest_1.vi.fn();
const mockCreate = vitest_1.vi.fn();
const mockFind = vitest_1.vi.fn();
const mockGetRepository = vitest_1.vi.fn();
vitest_1.vi.mock("../db/data-source", () => ({
    getDataSource: vitest_1.vi.fn(async () => ({
        getRepository: mockGetRepository,
    })),
}));
(0, vitest_1.describe)("jobs service", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockGetRepository.mockReturnValue({
            create: mockCreate,
            save: mockSave,
            find: mockFind,
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
        mockFind.mockResolvedValue(jobs);
        const result = await (0, jobs_1.listJobs)({ limit: 10, offset: 0 });
        (0, vitest_1.expect)(mockFind).toHaveBeenCalledWith({
            order: { createdAt: "DESC" },
            take: 10,
            skip: 0,
        });
        (0, vitest_1.expect)(result).toHaveLength(2);
        (0, vitest_1.expect)(result[0]?.id).toBe("job-2");
        (0, vitest_1.expect)(result[1]?.error).toBe("Agent failed");
    });
});

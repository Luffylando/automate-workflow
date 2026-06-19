"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const todos_1 = require("./todos");
const mockSave = vitest_1.vi.fn();
const mockCreate = vitest_1.vi.fn();
const mockCount = vitest_1.vi.fn();
const mockRepoCreateQueryBuilder = vitest_1.vi.fn();
const mockDataSourceCreateQueryBuilder = vitest_1.vi.fn();
const mockGetRepository = vitest_1.vi.fn();
vitest_1.vi.mock("../db/data-source", () => ({
    getDataSource: vitest_1.vi.fn(async () => ({
        getRepository: mockGetRepository,
        createQueryBuilder: mockDataSourceCreateQueryBuilder,
    })),
}));
(0, vitest_1.describe)("todos service", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockGetRepository.mockReturnValue({
            create: mockCreate,
            save: mockSave,
            count: mockCount,
            createQueryBuilder: mockRepoCreateQueryBuilder,
        });
    });
    (0, vitest_1.it)("creates a todo with extended fields", async () => {
        const createdAt = new Date("2026-06-10T10:00:00.000Z");
        const updatedAt = new Date("2026-06-10T10:05:00.000Z");
        const dueDate = new Date("2026-06-20T17:00:00.000Z");
        const entity = {
            id: "todo-1",
            title: "Write tests",
            description: "Cover todo stats and validation",
            priority: "high",
            dueDate,
            completed: false,
            createdAt,
            updatedAt,
        };
        mockCreate.mockReturnValue(entity);
        mockSave.mockResolvedValue(entity);
        const result = await (0, todos_1.createTodo)({
            title: "Write tests",
            description: "Cover todo stats and validation",
            priority: "high",
            dueDate,
        });
        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledWith({
            title: "Write tests",
            description: "Cover todo stats and validation",
            priority: "high",
            dueDate,
            completed: false,
        });
        (0, vitest_1.expect)(result).toEqual({
            id: "todo-1",
            title: "Write tests",
            description: "Cover todo stats and validation",
            priority: "high",
            dueDate: dueDate.toISOString(),
            completed: false,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
        });
    });
    (0, vitest_1.it)("aggregates todo stats", async () => {
        mockCount
            .mockResolvedValueOnce(10)
            .mockResolvedValueOnce(4)
            .mockResolvedValueOnce(2);
        mockRepoCreateQueryBuilder
            .mockReturnValueOnce({
            where: vitest_1.vi.fn().mockReturnThis(),
            andWhere: vitest_1.vi.fn().mockReturnThis(),
            getCount: vitest_1.vi.fn().mockResolvedValue(1),
        })
            .mockReturnValueOnce({
            select: vitest_1.vi.fn().mockReturnThis(),
            addSelect: vitest_1.vi.fn().mockReturnThis(),
            groupBy: vitest_1.vi.fn().mockReturnThis(),
            getRawMany: vitest_1.vi.fn().mockResolvedValue([
                { priority: "low", count: "2" },
                { priority: "medium", count: "5" },
                { priority: "high", count: "3" },
            ]),
        });
        mockDataSourceCreateQueryBuilder.mockReturnValue({
            select: vitest_1.vi.fn().mockReturnThis(),
            from: vitest_1.vi.fn().mockReturnThis(),
            getRawOne: vitest_1.vi.fn().mockResolvedValue({ average: "3.75" }),
        });
        const result = await (0, todos_1.getTodoStats)();
        (0, vitest_1.expect)(result).toEqual({
            total: 10,
            open: 6,
            completed: 4,
            overdue: 1,
            highPriority: 2,
            averageRating: 3.75,
            byPriority: {
                low: 2,
                medium: 5,
                high: 3,
            },
        });
    });
});

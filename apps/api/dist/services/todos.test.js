"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const todos_1 = require("./todos");
const mockSave = vitest_1.vi.fn();
const mockCreate = vitest_1.vi.fn();
const mockGetRepository = vitest_1.vi.fn();
vitest_1.vi.mock("../db/data-source", () => ({
    getDataSource: vitest_1.vi.fn(async () => ({
        getRepository: mockGetRepository,
    })),
}));
(0, vitest_1.describe)("todos service", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockGetRepository.mockReturnValue({
            create: mockCreate,
            save: mockSave,
        });
    });
    (0, vitest_1.it)("creates a todo with title and completed fields", async () => {
        const createdAt = new Date("2026-06-10T10:00:00.000Z");
        const updatedAt = new Date("2026-06-10T10:05:00.000Z");
        const entity = {
            id: "todo-1",
            title: "Write tests",
            completed: false,
            createdAt,
            updatedAt,
        };
        mockCreate.mockReturnValue(entity);
        mockSave.mockResolvedValue(entity);
        const result = await (0, todos_1.createTodo)("Write tests");
        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledWith({
            title: "Write tests",
            completed: false,
        });
        (0, vitest_1.expect)(mockSave).toHaveBeenCalledWith(entity);
        (0, vitest_1.expect)(result).toEqual({
            id: "todo-1",
            title: "Write tests",
            completed: false,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
        });
    });
});

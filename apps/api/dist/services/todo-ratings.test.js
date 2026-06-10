"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const todo_ratings_1 = require("./todo-ratings");
const mockSave = vitest_1.vi.fn();
const mockCreate = vitest_1.vi.fn();
const mockFindOneTodo = vitest_1.vi.fn();
const mockFindOneRating = vitest_1.vi.fn();
const mockGetRepository = vitest_1.vi.fn();
vitest_1.vi.mock("../db/data-source", () => ({
    getDataSource: vitest_1.vi.fn(async () => ({
        getRepository: mockGetRepository,
    })),
}));
(0, vitest_1.describe)("todo-ratings service", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockGetRepository.mockImplementation((entity) => {
            if (entity.name === "Todo") {
                return { findOne: mockFindOneTodo };
            }
            return {
                create: mockCreate,
                save: mockSave,
                findOne: mockFindOneRating,
            };
        });
    });
    (0, vitest_1.it)("creates a rating when the todo exists and the user has not rated it", async () => {
        const createdAt = new Date("2026-06-10T10:00:00.000Z");
        const entity = {
            id: "rating-1",
            userId: "user-1",
            todoId: "todo-1",
            value: 4,
            createdAt,
        };
        mockFindOneTodo.mockResolvedValue({ id: "todo-1" });
        mockFindOneRating.mockResolvedValue(null);
        mockCreate.mockReturnValue(entity);
        mockSave.mockResolvedValue(entity);
        const result = await (0, todo_ratings_1.rateTodo)("user-1", "todo-1", 4);
        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledWith({
            userId: "user-1",
            todoId: "todo-1",
            value: 4,
        });
        (0, vitest_1.expect)(result).toEqual({
            id: "rating-1",
            userId: "user-1",
            todoId: "todo-1",
            value: 4,
            createdAt: createdAt.toISOString(),
        });
    });
    (0, vitest_1.it)("rejects invalid rating values", async () => {
        await (0, vitest_1.expect)((0, todo_ratings_1.rateTodo)("user-1", "todo-1", 0)).rejects.toBeInstanceOf(todo_ratings_1.InvalidRatingValueError);
        await (0, vitest_1.expect)((0, todo_ratings_1.rateTodo)("user-1", "todo-1", 6)).rejects.toBeInstanceOf(todo_ratings_1.InvalidRatingValueError);
        await (0, vitest_1.expect)((0, todo_ratings_1.rateTodo)("user-1", "todo-1", 3.5)).rejects.toBeInstanceOf(todo_ratings_1.InvalidRatingValueError);
    });
    (0, vitest_1.it)("rejects duplicate ratings from the same user", async () => {
        mockFindOneTodo.mockResolvedValue({ id: "todo-1" });
        mockFindOneRating.mockResolvedValue({
            id: "rating-1",
            userId: "user-1",
            todoId: "todo-1",
            value: 3,
        });
        await (0, vitest_1.expect)((0, todo_ratings_1.rateTodo)("user-1", "todo-1", 5)).rejects.toBeInstanceOf(todo_ratings_1.DuplicateRatingError);
    });
    (0, vitest_1.it)("rejects ratings for missing todos", async () => {
        mockFindOneTodo.mockResolvedValue(null);
        await (0, vitest_1.expect)((0, todo_ratings_1.rateTodo)("user-1", "todo-1", 5)).rejects.toBeInstanceOf(todo_ratings_1.TodoNotFoundError);
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const mappers_1 = require("./mappers");
(0, vitest_1.describe)("mappers", () => {
    (0, vitest_1.it)("maps a todo entity to dto", () => {
        const todo = {
            id: "todo-1",
            title: "Write tests",
            completed: false,
            createdAt: new Date("2026-06-10T10:00:00.000Z"),
            updatedAt: new Date("2026-06-10T10:05:00.000Z"),
        };
        (0, vitest_1.expect)((0, mappers_1.toTodoDto)(todo)).toEqual({
            id: "todo-1",
            title: "Write tests",
            completed: false,
            createdAt: "2026-06-10T10:00:00.000Z",
            updatedAt: "2026-06-10T10:05:00.000Z",
        });
    });
    (0, vitest_1.it)("maps a todo rating entity to dto", () => {
        const rating = {
            id: "rating-1",
            userId: "user-1",
            todoId: "todo-1",
            value: 5,
            createdAt: new Date("2026-06-10T10:00:00.000Z"),
        };
        (0, vitest_1.expect)((0, mappers_1.toTodoRatingDto)(rating)).toEqual({
            id: "rating-1",
            userId: "user-1",
            todoId: "todo-1",
            value: 5,
            createdAt: "2026-06-10T10:00:00.000Z",
        });
    });
    (0, vitest_1.it)("maps a user entity to dto", () => {
        const user = {
            id: "user-1",
            name: "Alex Rivera",
            email: "alex@example.com",
            role: "admin",
            createdAt: new Date("2026-06-10T10:00:00.000Z"),
        };
        (0, vitest_1.expect)((0, mappers_1.toUserDto)(user)).toEqual({
            id: "user-1",
            name: "Alex Rivera",
            email: "alex@example.com",
            role: "admin",
            createdAt: "2026-06-10T10:00:00.000Z",
        });
    });
    (0, vitest_1.it)("maps a job entity to dto", () => {
        const job = {
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
            createdAt: new Date("2026-06-10T10:00:00.000Z"),
            updatedAt: new Date("2026-06-10T10:05:00.000Z"),
        };
        (0, vitest_1.expect)((0, mappers_1.toJobDto)(job)).toEqual({
            id: "job-1",
            prompt: "Add todos",
            status: "queued",
            createdAt: "2026-06-10T10:00:00.000Z",
            updatedAt: "2026-06-10T10:05:00.000Z",
            submittedById: "admin-1",
            submittedByEmail: "admin@example.com",
            metadata: { source: "prompt-console" },
        });
    });
});

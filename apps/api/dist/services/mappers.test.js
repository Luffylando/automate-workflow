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
    (0, vitest_1.it)("maps a job entity to dto", () => {
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
        };
        (0, vitest_1.expect)((0, mappers_1.toJobDto)(job)).toEqual({
            id: "job-1",
            prompt: "Add todos",
            status: "queued",
            createdAt: "2026-06-10T10:00:00.000Z",
            updatedAt: "2026-06-10T10:05:00.000Z",
        });
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const todo_validation_1 = require("./todo-validation");
(0, vitest_1.describe)("todo validation", () => {
    (0, vitest_1.it)("accepts valid priorities", () => {
        (0, vitest_1.expect)((0, todo_validation_1.isValidTodoPriority)("low")).toBe(true);
        (0, vitest_1.expect)((0, todo_validation_1.isValidTodoPriority)("medium")).toBe(true);
        (0, vitest_1.expect)((0, todo_validation_1.isValidTodoPriority)("high")).toBe(true);
        (0, vitest_1.expect)((0, todo_validation_1.isValidTodoPriority)("urgent")).toBe(false);
    });
    (0, vitest_1.it)("parses optional due dates", () => {
        (0, vitest_1.expect)((0, todo_validation_1.parseOptionalDueDate)(undefined)).toBeUndefined();
        (0, vitest_1.expect)((0, todo_validation_1.parseOptionalDueDate)(null)).toBeNull();
        (0, vitest_1.expect)((0, todo_validation_1.parseOptionalDueDate)("")).toBeNull();
        const parsed = (0, todo_validation_1.parseOptionalDueDate)("2026-06-20T12:00:00.000Z");
        (0, vitest_1.expect)(parsed).toBeInstanceOf(Date);
        (0, vitest_1.expect)(parsed?.toISOString()).toBe("2026-06-20T12:00:00.000Z");
        (0, vitest_1.expect)((0, todo_validation_1.parseOptionalDueDate)("not-a-date")).toBeUndefined();
    });
});

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const todos_1 = require("./todos");
const mockSave = vitest_1.vi.fn();
const mockCreate = vitest_1.vi.fn();
const mockFind = vitest_1.vi.fn();
const mockGetRepository = vitest_1.vi.fn();
vitest_1.vi.mock("../db/data-source", () => ({
    getDataSource: vitest_1.vi.fn(async () => ({
        getRepository: mockGetRepository,
    })),
}));
vitest_1.vi.mock("./todo-ratings", () => ({
    getRatingSummariesForTodos: vitest_1.vi.fn(async () => new Map()),
    getUserRatingsForTodos: vitest_1.vi.fn(async () => new Map()),
    deleteRatingsForTodo: vitest_1.vi.fn(async () => undefined),
}));
(0, vitest_1.describe)("todos service", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockGetRepository.mockReturnValue({
            create: mockCreate,
            save: mockSave,
            find: mockFind,
        });
    });
    (0, vitest_1.it)("creates a todo with extended fields", async () => {
        const createdAt = new Date("2026-06-10T10:00:00.000Z");
        const updatedAt = new Date("2026-06-10T10:05:00.000Z");
        const entity = {
            id: "todo-1",
            title: "Write tests",
            completed: false,
            priority: "high",
            status: "todo",
            dueDate: new Date("2026-06-20T12:00:00.000Z"),
            tags: ["testing"],
            createdAt,
            updatedAt,
        };
        mockCreate.mockReturnValue(entity);
        mockSave.mockResolvedValue(entity);
        const result = await (0, todos_1.createTodo)({
            title: "Write tests",
            priority: "high",
            dueDate: "2026-06-20T12:00:00.000Z",
            tags: ["testing"],
        });
        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledWith({
            title: "Write tests",
            completed: false,
            priority: "high",
            status: "todo",
            dueDate: new Date("2026-06-20T12:00:00.000Z"),
            tags: ["testing"],
        });
        (0, vitest_1.expect)(result).toEqual({
            id: "todo-1",
            title: "Write tests",
            completed: false,
            priority: "high",
            status: "todo",
            dueDate: "2026-06-20T12:00:00.000Z",
            tags: ["testing"],
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
        });
    });
    (0, vitest_1.it)("aggregates todo stats", async () => {
        const now = Date.now();
        mockFind.mockResolvedValue([
            {
                id: "1",
                status: "todo",
                priority: "high",
                dueDate: new Date(now - 86_400_000),
            },
            {
                id: "2",
                status: "in_progress",
                priority: "medium",
                dueDate: new Date(now + 86_400_000),
            },
            {
                id: "3",
                status: "done",
                priority: "low",
                dueDate: null,
            },
            {
                id: "4",
                status: "cancelled",
                priority: "high",
                dueDate: new Date(now - 86_400_000),
            },
        ]);
        const { getRatingSummariesForTodos } = await Promise.resolve().then(() => __importStar(require("./todo-ratings")));
        vitest_1.vi.mocked(getRatingSummariesForTodos).mockResolvedValue(new Map([
            ["1", { averageRating: 4, ratingCount: 2 }],
            ["2", { averageRating: null, ratingCount: 0 }],
        ]));
        const result = await (0, todos_1.getTodoStats)();
        (0, vitest_1.expect)(result).toEqual({
            total: 4,
            open: 2,
            done: 1,
            cancelled: 1,
            inProgress: 1,
            overdue: 1,
            highPriority: 1,
            rated: 1,
            averageRating: 4,
        });
    });
    (0, vitest_1.it)("validates todo metadata helpers", () => {
        (0, vitest_1.expect)((0, todos_1.isTodoPriority)("high")).toBe(true);
        (0, vitest_1.expect)((0, todos_1.isTodoPriority)("urgent")).toBe(false);
        (0, vitest_1.expect)((0, todos_1.isTodoStatus)("in_progress")).toBe(true);
        (0, vitest_1.expect)((0, todos_1.isTodoStatus)("blocked")).toBe(false);
        (0, vitest_1.expect)((0, todos_1.normalizeTags)([" api ", "api", "frontend"])).toEqual([
            "api",
            "frontend",
        ]);
        (0, vitest_1.expect)((0, todos_1.parseDueDate)("2026-06-20T12:00:00.000Z")).toEqual(new Date("2026-06-20T12:00:00.000Z"));
        (0, vitest_1.expect)((0, todos_1.parseDueDate)("not-a-date")).toBeUndefined();
    });
});

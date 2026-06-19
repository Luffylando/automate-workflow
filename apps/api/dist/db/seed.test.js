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
const seed_1 = require("./seed");
const mockUserCount = vitest_1.vi.fn();
const mockTodoCount = vitest_1.vi.fn();
const mockRatingCount = vitest_1.vi.fn();
const mockUserFind = vitest_1.vi.fn();
const mockTodoFind = vitest_1.vi.fn();
const mockCreateUser = vitest_1.vi.fn();
const mockCreateTodo = vitest_1.vi.fn();
const mockUpdateTodo = vitest_1.vi.fn();
const mockRateTodo = vitest_1.vi.fn();
vitest_1.vi.mock("../config", () => ({
    config: {
        isProduction: false,
    },
}));
vitest_1.vi.mock("../db/data-source", () => ({
    getDataSource: vitest_1.vi.fn(async () => ({
        getRepository: (entity) => {
            if (entity.name === "User") {
                return {
                    count: mockUserCount,
                    find: mockUserFind,
                };
            }
            if (entity.name === "Todo") {
                return {
                    count: mockTodoCount,
                    find: mockTodoFind,
                };
            }
            return {
                count: mockRatingCount,
            };
        },
    })),
}));
vitest_1.vi.mock("../services/users", () => ({
    createUser: (...args) => mockCreateUser(...args),
}));
vitest_1.vi.mock("../services/todos", () => ({
    createTodo: (...args) => mockCreateTodo(...args),
    updateTodo: (...args) => mockUpdateTodo(...args),
}));
vitest_1.vi.mock("../services/todo-ratings", () => ({
    rateTodo: (...args) => mockRateTodo(...args),
}));
(0, vitest_1.describe)("seedDemoData", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockUserCount.mockResolvedValue(0);
        mockTodoCount.mockResolvedValue(0);
        mockRatingCount.mockResolvedValue(0);
        mockCreateUser.mockResolvedValue({ id: "user-id" });
        mockCreateTodo.mockImplementation(async (input) => ({
            id: `todo-${input.title}`,
            title: input.title,
            completed: false,
        }));
        mockUpdateTodo.mockResolvedValue(null);
        mockUserFind.mockResolvedValue([
            { id: "user-1", email: "alex@example.com" },
            { id: "user-2", email: "sam@example.com" },
            { id: "user-3", email: "jordan@example.com" },
            { id: "user-4", email: "taylor@example.com" },
            { id: "user-5", email: "morgan@example.com" },
        ]);
        mockTodoFind.mockResolvedValue([
            { id: "todo-1", title: "Review dashboard layout" },
            { id: "todo-2", title: "Ship user management UI" },
            { id: "todo-3", title: "Add rating stars to todo cards" },
            {
                id: "todo-4",
                title: "Polish dark mode contrast on stat cards",
            },
            { id: "todo-5", title: "Write API integration tests" },
        ]);
    });
    (0, vitest_1.it)("seeds users, todos, and ratings when tables are empty", async () => {
        await (0, seed_1.seedDemoData)();
        (0, vitest_1.expect)(mockCreateUser).toHaveBeenCalledTimes(5);
        (0, vitest_1.expect)(mockCreateUser).toHaveBeenCalledWith({
            name: "Alex Rivera",
            email: "alex@example.com",
            password: seed_1.DEMO_PASSWORD,
            role: "user",
        });
        (0, vitest_1.expect)(mockCreateUser).toHaveBeenCalledWith({
            name: "Jordan Lee",
            email: "jordan@example.com",
            password: seed_1.DEMO_PASSWORD,
            role: "admin",
        });
        (0, vitest_1.expect)(mockCreateTodo).toHaveBeenCalledTimes(10);
        (0, vitest_1.expect)(mockUpdateTodo).toHaveBeenCalled();
        (0, vitest_1.expect)(mockRateTodo).toHaveBeenCalledTimes(6);
    });
    (0, vitest_1.it)("skips seeding when data already exists", async () => {
        mockUserCount.mockResolvedValue(3);
        mockTodoCount.mockResolvedValue(4);
        mockRatingCount.mockResolvedValue(2);
        await (0, seed_1.seedDemoData)();
        (0, vitest_1.expect)(mockCreateUser).not.toHaveBeenCalled();
        (0, vitest_1.expect)(mockCreateTodo).not.toHaveBeenCalled();
        (0, vitest_1.expect)(mockRateTodo).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("does not seed in production", async () => {
        const { config } = await Promise.resolve().then(() => __importStar(require("../config")));
        vitest_1.vi.mocked(config).isProduction = true;
        await (0, seed_1.seedDemoData)();
        (0, vitest_1.expect)(mockCreateUser).not.toHaveBeenCalled();
        (0, vitest_1.expect)(mockCreateTodo).not.toHaveBeenCalled();
        (0, vitest_1.expect)(mockRateTodo).not.toHaveBeenCalled();
        vitest_1.vi.mocked(config).isProduction = false;
    });
});

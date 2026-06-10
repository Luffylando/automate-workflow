"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const users_1 = require("./users");
const mockSave = vitest_1.vi.fn();
const mockCreate = vitest_1.vi.fn();
const mockFindOne = vitest_1.vi.fn();
const mockGetRepository = vitest_1.vi.fn();
vitest_1.vi.mock("../db/data-source", () => ({
    getDataSource: vitest_1.vi.fn(async () => ({
        getRepository: mockGetRepository,
    })),
}));
(0, vitest_1.describe)("users service", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockGetRepository.mockReturnValue({
            create: mockCreate,
            save: mockSave,
            findOne: mockFindOne,
        });
    });
    (0, vitest_1.it)("creates a user with name, email, and role", async () => {
        const createdAt = new Date("2026-06-10T10:00:00.000Z");
        const entity = {
            id: "user-1",
            name: "Alex Rivera",
            email: "alex@example.com",
            role: "user",
            createdAt,
        };
        mockCreate.mockReturnValue(entity);
        mockSave.mockResolvedValue(entity);
        const result = await (0, users_1.createUser)({
            name: "Alex Rivera",
            email: "Alex@Example.com",
            role: "user",
        });
        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledWith({
            name: "Alex Rivera",
            email: "alex@example.com",
            role: "user",
        });
        (0, vitest_1.expect)(mockSave).toHaveBeenCalledWith(entity);
        (0, vitest_1.expect)(result).toEqual({
            id: "user-1",
            name: "Alex Rivera",
            email: "alex@example.com",
            role: "user",
            createdAt: createdAt.toISOString(),
        });
    });
    (0, vitest_1.it)("updates a user role", async () => {
        const createdAt = new Date("2026-06-10T10:00:00.000Z");
        const entity = {
            id: "user-1",
            name: "Alex Rivera",
            email: "alex@example.com",
            role: "user",
            createdAt,
        };
        mockFindOne.mockResolvedValue(entity);
        mockSave.mockImplementation(async (user) => ({
            ...user,
            role: "admin",
        }));
        const result = await (0, users_1.updateUserRole)("user-1", "admin");
        (0, vitest_1.expect)(mockFindOne).toHaveBeenCalledWith({ where: { id: "user-1" } });
        (0, vitest_1.expect)(entity.role).toBe("admin");
        (0, vitest_1.expect)(mockSave).toHaveBeenCalledWith(entity);
        (0, vitest_1.expect)(result).toEqual({
            id: "user-1",
            name: "Alex Rivera",
            email: "alex@example.com",
            role: "admin",
            createdAt: createdAt.toISOString(),
        });
    });
});

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
const admins_1 = require("./admins");
const mockFindOne = vitest_1.vi.fn();
vitest_1.vi.mock("../db/data-source", () => ({
    getDataSource: vitest_1.vi.fn(async () => ({
        getRepository: () => ({
            findOne: mockFindOne,
        }),
    })),
}));
vitest_1.vi.mock("./password", () => ({
    hashPassword: vitest_1.vi.fn(),
    verifyPassword: vitest_1.vi.fn(),
}));
(0, vitest_1.describe)("admins service", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)("returns admin when credentials are valid", async () => {
        const admin = {
            id: "admin-1",
            email: "admin@localhost",
            passwordHash: "hash",
            createdAt: new Date(),
        };
        mockFindOne.mockResolvedValue(admin);
        const { verifyPassword } = await Promise.resolve().then(() => __importStar(require("./password")));
        vitest_1.vi.mocked(verifyPassword).mockResolvedValue(true);
        await (0, vitest_1.expect)((0, admins_1.verifyAdminCredentials)("admin@localhost", "secret")).resolves.toEqual(admin);
        (0, vitest_1.expect)(mockFindOne).toHaveBeenCalledWith({
            where: { email: "admin@localhost" },
        });
    });
    (0, vitest_1.it)("returns null when password is invalid", async () => {
        mockFindOne.mockResolvedValue({
            id: "admin-1",
            email: "admin@localhost",
            passwordHash: "hash",
            createdAt: new Date(),
        });
        const { verifyPassword } = await Promise.resolve().then(() => __importStar(require("./password")));
        vitest_1.vi.mocked(verifyPassword).mockResolvedValue(false);
        await (0, vitest_1.expect)((0, admins_1.verifyAdminCredentials)("admin@localhost", "wrong")).resolves.toBeNull();
    });
    (0, vitest_1.it)("returns null when admin does not exist", async () => {
        mockFindOne.mockResolvedValue(null);
        await (0, vitest_1.expect)((0, admins_1.verifyAdminCredentials)("missing@localhost", "secret")).resolves.toBeNull();
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const submitter_1 = require("./submitter");
const mockGetUserById = vitest_1.vi.fn();
const mockGetAdminById = vitest_1.vi.fn();
vitest_1.vi.mock("./users", () => ({
    getUserById: (...args) => mockGetUserById(...args),
}));
vitest_1.vi.mock("./admins", () => ({
    getAdminById: (...args) => mockGetAdminById(...args),
}));
(0, vitest_1.describe)("submitter service", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)("returns stored submitter email when present", async () => {
        await (0, vitest_1.expect)((0, submitter_1.resolveSubmitterEmail)("user-1", "  admin@example.com  ")).resolves.toBe("admin@example.com");
        (0, vitest_1.expect)(mockGetUserById).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("looks up email from users when missing on the job", async () => {
        mockGetUserById.mockResolvedValue({
            id: "user-1",
            email: "user@example.com",
        });
        await (0, vitest_1.expect)((0, submitter_1.resolveSubmitterEmail)("user-1", null)).resolves.toBe("user@example.com");
        (0, vitest_1.expect)(mockGetUserById).toHaveBeenCalledWith("user-1");
        (0, vitest_1.expect)(mockGetAdminById).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("falls back to legacy admin users when app user is missing", async () => {
        mockGetUserById.mockResolvedValue(null);
        mockGetAdminById.mockResolvedValue({
            id: "admin-1",
            email: "legacy-admin@example.com",
        });
        await (0, vitest_1.expect)((0, submitter_1.lookupSubmitterEmail)("admin-1")).resolves.toBe("legacy-admin@example.com");
        (0, vitest_1.expect)(mockGetAdminById).toHaveBeenCalledWith("admin-1");
    });
    (0, vitest_1.it)("batch-resolves submitter emails by id", async () => {
        mockGetUserById.mockImplementation(async (id) => {
            if (id === "user-1") {
                return { id, email: "user@example.com" };
            }
            return null;
        });
        mockGetAdminById.mockImplementation(async (id) => {
            if (id === "admin-1") {
                return { id, email: "admin@example.com" };
            }
            return null;
        });
        const emails = await (0, submitter_1.lookupSubmitterEmailsByIds)(["user-1", "admin-1"]);
        (0, vitest_1.expect)(emails.get("user-1")).toBe("user@example.com");
        (0, vitest_1.expect)(emails.get("admin-1")).toBe("admin@example.com");
    });
});

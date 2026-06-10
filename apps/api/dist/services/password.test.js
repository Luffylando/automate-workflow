"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const password_1 = require("./password");
(0, vitest_1.describe)("password service", () => {
    (0, vitest_1.it)("hashes and verifies a password", async () => {
        const hash = await (0, password_1.hashPassword)("super-secret");
        (0, vitest_1.expect)(hash).toContain(":");
        await (0, vitest_1.expect)((0, password_1.verifyPassword)("super-secret", hash)).resolves.toBe(true);
        await (0, vitest_1.expect)((0, password_1.verifyPassword)("wrong-password", hash)).resolves.toBe(false);
    });
    (0, vitest_1.it)("rejects invalid stored hashes", async () => {
        await (0, vitest_1.expect)((0, password_1.verifyPassword)("password", "not-a-valid-hash")).resolves.toBe(false);
    });
});

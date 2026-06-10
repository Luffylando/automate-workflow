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
const auth_1 = require("./auth");
vitest_1.vi.mock("../config", () => ({
    config: {
        sessionSecret: "test-session-secret-with-enough-length",
    },
}));
(0, vitest_1.describe)("auth service", () => {
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.unstubAllGlobals();
    });
    (0, vitest_1.it)("creates and verifies an admin JWT session token", async () => {
        const token = await (0, auth_1.createSessionToken)("admin-user-id", "admin@example.com", "admin");
        const session = await (0, auth_1.verifySessionToken)(token);
        (0, vitest_1.expect)(session).toEqual({
            role: "admin",
            sub: "admin-user-id",
            email: "admin@example.com",
        });
    });
    (0, vitest_1.it)("creates and verifies a user JWT session token", async () => {
        const token = await (0, auth_1.createSessionToken)("user-id", "user@example.com", "user");
        const session = await (0, auth_1.verifySessionToken)(token);
        (0, vitest_1.expect)(session).toEqual({
            role: "user",
            sub: "user-id",
            email: "user@example.com",
        });
    });
    (0, vitest_1.it)("rejects tokens with an invalid role", async () => {
        const { SignJWT } = await Promise.resolve().then(() => __importStar(require("jose")));
        const token = await new SignJWT({ role: "superuser", sub: "123" })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1h")
            .sign(new TextEncoder().encode("test-session-secret-with-enough-length"));
        await (0, vitest_1.expect)((0, auth_1.verifySessionToken)(token)).resolves.toBeNull();
    });
    (0, vitest_1.it)("extracts bearer tokens from authorization headers", () => {
        (0, vitest_1.expect)((0, auth_1.extractBearerToken)("Bearer abc.def.ghi")).toBe("abc.def.ghi");
        (0, vitest_1.expect)((0, auth_1.extractBearerToken)("Basic abc")).toBeNull();
        (0, vitest_1.expect)((0, auth_1.extractBearerToken)(undefined)).toBeNull();
    });
});

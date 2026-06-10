"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const config_1 = require("../config");
const admins_1 = require("../services/admins");
const auth_1 = require("../services/auth");
const users_1 = require("../services/users");
async function authRoutes(fastify) {
    fastify.post("/api/auth/login", async (request, reply) => {
        const email = request.body.email?.trim();
        const password = request.body.password?.trim();
        if (!email || !password) {
            return reply
                .status(400)
                .send({ error: "Email and password are required" });
        }
        const appUser = await (0, users_1.verifyUserCredentials)(email, password);
        if (appUser) {
            const token = await (0, auth_1.createSessionToken)(appUser.id, appUser.email, appUser.role);
            reply.setCookie(auth_1.SESSION_COOKIE, token, {
                httpOnly: true,
                sameSite: "lax",
                secure: config_1.config.isProduction,
                path: "/",
                maxAge: auth_1.SESSION_MAX_AGE_SECONDS,
            });
            return {
                ok: true,
                user: { id: appUser.id, email: appUser.email, role: appUser.role },
            };
        }
        const legacyAdmin = await (0, admins_1.verifyAdminCredentials)(email, password);
        if (legacyAdmin) {
            const token = await (0, auth_1.createSessionToken)(legacyAdmin.id, legacyAdmin.email, "admin");
            reply.setCookie(auth_1.SESSION_COOKIE, token, {
                httpOnly: true,
                sameSite: "lax",
                secure: config_1.config.isProduction,
                path: "/",
                maxAge: auth_1.SESSION_MAX_AGE_SECONDS,
            });
            return {
                ok: true,
                user: { id: legacyAdmin.id, email: legacyAdmin.email, role: "admin" },
            };
        }
        return reply.status(401).send({ error: "Invalid credentials" });
    });
    fastify.post("/api/auth/logout", async (_request, reply) => {
        reply.clearCookie(auth_1.SESSION_COOKIE, { path: "/" });
        return { ok: true };
    });
    fastify.get("/api/auth/me", async (request) => {
        if (!request.adminSession) {
            return { authenticated: false, admin: false };
        }
        return {
            authenticated: true,
            admin: request.adminSession.role === "admin",
            role: request.adminSession.role,
            sub: request.adminSession.sub,
            email: request.adminSession.email,
        };
    });
}

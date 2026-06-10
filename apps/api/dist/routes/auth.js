"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const config_1 = require("../config");
const auth_1 = require("../services/auth");
async function authRoutes(fastify) {
    fastify.post("/api/auth/login", async (request, reply) => {
        const password = request.body.password?.trim();
        if (!password) {
            return reply.status(400).send({ error: "Password is required" });
        }
        if (!(0, auth_1.verifyAdminPassword)(password)) {
            return reply.status(401).send({ error: "Invalid credentials" });
        }
        const token = await (0, auth_1.createSessionToken)();
        reply.setCookie(auth_1.SESSION_COOKIE, token, {
            httpOnly: true,
            sameSite: "lax",
            secure: config_1.config.isProduction,
            path: "/",
            maxAge: auth_1.SESSION_MAX_AGE_SECONDS,
        });
        return { ok: true };
    });
    fastify.post("/api/auth/logout", async (_request, reply) => {
        reply.clearCookie(auth_1.SESSION_COOKIE, { path: "/" });
        return { ok: true };
    });
    fastify.get("/api/auth/me", async (request) => {
        if (!request.adminSession) {
            return { admin: false };
        }
        return { admin: true, sub: request.adminSession.sub };
    });
}

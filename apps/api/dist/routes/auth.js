"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const config_1 = require("../config");
const admins_1 = require("../services/admins");
const auth_1 = require("../services/auth");
async function authRoutes(fastify) {
    fastify.post("/api/auth/login", async (request, reply) => {
        const email = request.body.email?.trim();
        const password = request.body.password?.trim();
        if (!email || !password) {
            return reply
                .status(400)
                .send({ error: "Email and password are required" });
        }
        const admin = await (0, admins_1.verifyAdminCredentials)(email, password);
        if (!admin) {
            return reply.status(401).send({ error: "Invalid credentials" });
        }
        const token = await (0, auth_1.createSessionToken)(admin.id, admin.email);
        reply.setCookie(auth_1.SESSION_COOKIE, token, {
            httpOnly: true,
            sameSite: "lax",
            secure: config_1.config.isProduction,
            path: "/",
            maxAge: auth_1.SESSION_MAX_AGE_SECONDS,
        });
        return { ok: true, admin: { id: admin.id, email: admin.email } };
    });
    fastify.post("/api/auth/logout", async (_request, reply) => {
        reply.clearCookie(auth_1.SESSION_COOKIE, { path: "/" });
        return { ok: true };
    });
    fastify.get("/api/auth/me", async (request) => {
        if (!request.adminSession) {
            return { admin: false };
        }
        return {
            admin: true,
            sub: request.adminSession.sub,
            email: request.adminSession.email,
        };
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAdminAuth = registerAdminAuth;
exports.requireAdmin = requireAdmin;
exports.requireAuth = requireAuth;
const auth_1 = require("../services/auth");
function registerAdminAuth(fastify) {
    fastify.decorateRequest("adminSession", null);
    fastify.addHook("onRequest", async (request) => {
        const cookieToken = request.cookies[auth_1.SESSION_COOKIE];
        const bearerToken = (0, auth_1.extractBearerToken)(request.headers.authorization);
        const token = cookieToken ?? bearerToken;
        request.adminSession = token ? await (0, auth_1.verifySessionToken)(token) : null;
    });
}
async function requireAdmin(request, reply) {
    if (!request.adminSession || request.adminSession.role !== "admin") {
        return reply.status(401).send({ error: "Unauthorized" });
    }
}
async function requireAuth(request, reply) {
    if (!request.adminSession) {
        return reply.status(401).send({ error: "Unauthorized" });
    }
}

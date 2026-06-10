"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAdminAuth = registerAdminAuth;
exports.requireAdmin = requireAdmin;
const auth_1 = require("../services/auth");
function registerAdminAuth(fastify) {
    fastify.decorateRequest("adminSession", null);
    fastify.addHook("onRequest", async (request) => {
        const token = request.cookies[auth_1.SESSION_COOKIE];
        request.adminSession = token ? await (0, auth_1.verifySessionToken)(token) : null;
    });
}
async function requireAdmin(request, reply) {
    if (!request.adminSession) {
        reply.status(401).send({ error: "Unauthorized" });
    }
}

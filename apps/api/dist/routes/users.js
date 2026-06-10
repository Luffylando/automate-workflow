"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoutes = usersRoutes;
const users_1 = require("../services/users");
async function usersRoutes(fastify) {
    fastify.get("/api/users", async (_request, reply) => {
        try {
            const users = await (0, users_1.listUsers)();
            return { users };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch users";
            return reply.status(500).send({ error: message });
        }
    });
}

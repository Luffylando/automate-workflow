"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoutes = usersRoutes;
const admin_auth_1 = require("../plugins/admin-auth");
const users_1 = require("../services/users");
async function usersRoutes(fastify) {
    fastify.get("/api/users", { preHandler: admin_auth_1.requireAdmin }, async (_request, reply) => {
        try {
            const users = await (0, users_1.listUsers)();
            return { users };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch users";
            return reply.status(500).send({ error: message });
        }
    });
    fastify.get("/api/users/:id", { preHandler: admin_auth_1.requireAdmin }, async (request, reply) => {
        try {
            const user = await (0, users_1.getUserById)(request.params.id);
            if (!user) {
                return reply.status(404).send({ error: "User not found" });
            }
            return user;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch user";
            return reply.status(500).send({ error: message });
        }
    });
    fastify.post("/api/users", { preHandler: admin_auth_1.requireAdmin }, async (request, reply) => {
        try {
            const name = request.body.name?.trim();
            const email = request.body.email?.trim();
            const role = request.body.role?.trim();
            if (!name) {
                return reply.status(400).send({ error: "Name is required" });
            }
            if (name.length > 200) {
                return reply
                    .status(400)
                    .send({ error: "Name must be 200 characters or fewer" });
            }
            if (!email) {
                return reply.status(400).send({ error: "Email is required" });
            }
            if (email.length > 320) {
                return reply
                    .status(400)
                    .send({ error: "Email must be 320 characters or fewer" });
            }
            if (role !== undefined && !(0, users_1.isValidUserRole)(role)) {
                return reply.status(400).send({ error: "Invalid role" });
            }
            const existing = await (0, users_1.findUserByEmail)(email);
            if (existing) {
                return reply.status(409).send({ error: "Email already in use" });
            }
            const user = await (0, users_1.createUser)({
                name,
                email,
                role: role,
            });
            return reply.status(201).send(user);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create user";
            return reply.status(500).send({ error: message });
        }
    });
    fastify.patch("/api/users/:id", { preHandler: admin_auth_1.requireAdmin }, async (request, reply) => {
        try {
            const role = request.body.role?.trim();
            if (!role) {
                return reply.status(400).send({ error: "Role is required" });
            }
            if (!(0, users_1.isValidUserRole)(role)) {
                return reply.status(400).send({ error: "Invalid role" });
            }
            const user = await (0, users_1.updateUserRole)(request.params.id, role);
            if (!user) {
                return reply.status(404).send({ error: "User not found" });
            }
            return user;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update user";
            return reply.status(500).send({ error: message });
        }
    });
}

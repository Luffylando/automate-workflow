"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsRoutes = jobsRoutes;
const admin_auth_1 = require("../plugins/admin-auth");
const jobs_1 = require("../services/jobs");
async function jobsRoutes(fastify) {
    fastify.get("/api/jobs/:id", { preHandler: admin_auth_1.requireAdmin }, async (request, reply) => {
        try {
            const job = await (0, jobs_1.getJob)(request.params.id);
            if (!job) {
                return reply.status(404).send({ error: "Job not found" });
            }
            return job;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch job";
            return reply.status(500).send({ error: message });
        }
    });
}

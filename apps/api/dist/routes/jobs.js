"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsRoutes = jobsRoutes;
const admin_auth_1 = require("../plugins/admin-auth");
const jobs_1 = require("../services/jobs");
async function jobsRoutes(fastify) {
    fastify.get("/api/jobs", { preHandler: admin_auth_1.requireAdmin }, async (request, reply) => {
        try {
            const query = request.query;
            const limit = query.limit ? Number.parseInt(query.limit, 10) : undefined;
            const offset = query.offset
                ? Number.parseInt(query.offset, 10)
                : undefined;
            if (limit !== undefined && Number.isNaN(limit)) {
                return reply.status(400).send({ error: "Invalid limit" });
            }
            if (offset !== undefined && Number.isNaN(offset)) {
                return reply.status(400).send({ error: "Invalid offset" });
            }
            const jobs = await (0, jobs_1.listJobs)({ limit, offset });
            return { jobs };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch jobs";
            return reply.status(500).send({ error: message });
        }
    });
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

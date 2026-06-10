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
            const prompt = query.prompt?.trim() || undefined;
            const date = query.date?.trim() || undefined;
            if (limit !== undefined && Number.isNaN(limit)) {
                return reply.status(400).send({ error: "Invalid limit" });
            }
            if (offset !== undefined && Number.isNaN(offset)) {
                return reply.status(400).send({ error: "Invalid offset" });
            }
            if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return reply.status(400).send({ error: "Invalid date" });
            }
            const jobs = await (0, jobs_1.listJobs)({ limit, offset, prompt, date });
            return { jobs };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch jobs";
            return reply.status(500).send({ error: message });
        }
    });
    fastify.get("/api/jobs/stats", { preHandler: admin_auth_1.requireAdmin }, async (_request, reply) => {
        try {
            const stats = await (0, jobs_1.getJobStats)();
            return { stats };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch job stats";
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

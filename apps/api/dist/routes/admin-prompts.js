"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPromptsRoutes = adminPromptsRoutes;
const admin_auth_1 = require("../plugins/admin-auth");
const agent_runner_1 = require("../services/agent-runner");
const jobs_1 = require("../services/jobs");
const rate_limit_1 = require("../services/rate-limit");
async function adminPromptsRoutes(fastify) {
    fastify.post("/api/admin/prompts", { preHandler: admin_auth_1.requireAdmin }, async (request, reply) => {
        try {
            const session = request.adminSession;
            if (!session) {
                return reply.status(401).send({ error: "Unauthorized" });
            }
            const prompt = request.body.prompt?.trim();
            if (!prompt) {
                return reply.status(400).send({ error: "Prompt is required" });
            }
            if (prompt.length > 4000) {
                return reply
                    .status(400)
                    .send({ error: "Prompt must be 4000 characters or fewer" });
            }
            const rateLimit = (0, rate_limit_1.checkRateLimit)(session.sub);
            if (!rateLimit.allowed) {
                return reply.status(429).send({
                    error: `Rate limit exceeded. Try again in ${rateLimit.retryAfterSeconds}s.`,
                });
            }
            const job = await (0, jobs_1.createJob)(prompt);
            setImmediate(() => {
                void (0, agent_runner_1.processJob)(job.id);
            });
            return { jobId: job.id, status: job.status };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create job";
            return reply.status(500).send({ error: message });
        }
    });
}

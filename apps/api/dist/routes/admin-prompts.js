"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPromptsRoutes = adminPromptsRoutes;
const admin_auth_1 = require("../plugins/admin-auth");
const agent_runner_1 = require("../services/agent-runner");
const jobs_1 = require("../services/jobs");
const rate_limit_1 = require("../services/rate-limit");
const MAX_METADATA_BYTES = 4096;
function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
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
            let metadata;
            if (request.body.metadata !== undefined) {
                if (!isPlainObject(request.body.metadata)) {
                    return reply.status(400).send({ error: "Metadata must be an object" });
                }
                const serialized = JSON.stringify(request.body.metadata);
                if (serialized.length > MAX_METADATA_BYTES) {
                    return reply
                        .status(400)
                        .send({ error: "Metadata must be 4096 bytes or fewer" });
                }
                metadata = request.body.metadata;
            }
            const rateLimit = (0, rate_limit_1.checkRateLimit)(session.sub);
            if (!rateLimit.allowed) {
                return reply.status(429).send({
                    error: `Rate limit exceeded. Try again in ${rateLimit.retryAfterSeconds}s.`,
                });
            }
            const job = await (0, jobs_1.createJob)({
                prompt,
                submittedById: session.sub,
                submittedByEmail: session.email,
                metadata: {
                    ...metadata,
                    source: metadata?.source ?? "admin-prompt",
                },
            });
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

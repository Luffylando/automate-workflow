import { FastifyInstance } from "fastify";
import { requireAdmin } from "../plugins/admin-auth";
import { processJob } from "../services/agent-runner";
import { createJob } from "../services/jobs";
import { checkRateLimit } from "../services/rate-limit";

export async function adminPromptsRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.post<{ Body: { prompt?: string } }>(
    "/api/admin/prompts",
    { preHandler: requireAdmin },
    async (request, reply) => {
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

        const rateLimit = checkRateLimit(session.sub);
        if (!rateLimit.allowed) {
          return reply.status(429).send({
            error: `Rate limit exceeded. Try again in ${rateLimit.retryAfterSeconds}s.`,
          });
        }

        const job = await createJob(prompt);

        setImmediate(() => {
          void processJob(job.id);
        });

        return { jobId: job.id, status: job.status };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create job";
        return reply.status(500).send({ error: message });
      }
    },
  );
}

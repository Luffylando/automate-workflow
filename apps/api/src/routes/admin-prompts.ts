import { FastifyInstance } from "fastify";
import { requireAdmin } from "../plugins/admin-auth";
import { processJob } from "../services/agent-runner";
import { createJob } from "../services/jobs";
import { checkRateLimit } from "../services/rate-limit";
import { resolveSubmitterEmail } from "../services/submitter";

const MAX_METADATA_BYTES = 4096;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function adminPromptsRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.post<{ Body: { prompt?: string; metadata?: unknown } }>(
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

        let metadata: Record<string, unknown> | undefined;
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

        const rateLimit = checkRateLimit(session.sub);
        if (!rateLimit.allowed) {
          return reply.status(429).send({
            error: `Rate limit exceeded. Try again in ${rateLimit.retryAfterSeconds}s.`,
          });
        }

        const submittedByEmail = await resolveSubmitterEmail(
          session.sub,
          session.email,
        );
        if (!submittedByEmail) {
          return reply.status(400).send({
            error: "Prompter email could not be determined for this session",
          });
        }

        const job = await createJob({
          prompt,
          submittedById: session.sub,
          submittedByEmail,
          metadata: {
            ...metadata,
            source: metadata?.source ?? "admin-prompt",
          },
        });

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

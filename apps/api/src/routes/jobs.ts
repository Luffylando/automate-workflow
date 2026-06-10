import { FastifyInstance } from "fastify";
import { requireAdmin } from "../plugins/admin-auth";
import { getJob, listJobs } from "../services/jobs";

export async function jobsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    "/api/jobs",
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        const query = request.query as { limit?: string; offset?: string };
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

        const jobs = await listJobs({ limit, offset });
        return { jobs };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch jobs";
        return reply.status(500).send({ error: message });
      }
    },
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/jobs/:id",
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        const job = await getJob(request.params.id);

        if (!job) {
          return reply.status(404).send({ error: "Job not found" });
        }

        return job;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch job";
        return reply.status(500).send({ error: message });
      }
    },
  );
}

import { FastifyInstance } from "fastify";
import { requireAdmin } from "../plugins/admin-auth";
import { getJob } from "../services/jobs";

export async function jobsRoutes(fastify: FastifyInstance): Promise<void> {
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

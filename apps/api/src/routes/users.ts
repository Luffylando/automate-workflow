import { FastifyInstance } from "fastify";
import { listUsers } from "../services/users";

export async function usersRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/api/users", async (_request, reply) => {
    try {
      const users = await listUsers();
      return { users };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch users";
      return reply.status(500).send({ error: message });
    }
  });
}

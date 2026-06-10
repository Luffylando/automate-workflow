import "dotenv/config";
import "reflect-metadata";
import cookie from "@fastify/cookie";
import Fastify from "fastify";
import { config } from "./config";
import { getDataSource } from "./db/data-source";
import { registerAdminAuth } from "./plugins/admin-auth";
import { adminPromptsRoutes } from "./routes/admin-prompts";
import { authRoutes } from "./routes/auth";
import { jobsRoutes } from "./routes/jobs";
import { todosRoutes } from "./routes/todos";
import { ensureDefaultAdmin } from "./services/admins";

async function start(): Promise<void> {
  await getDataSource();
  await ensureDefaultAdmin();

  const fastify = Fastify({ logger: true });

  await fastify.register(cookie);
  registerAdminAuth(fastify);

  await fastify.register(authRoutes);
  await fastify.register(todosRoutes);
  await fastify.register(jobsRoutes);
  await fastify.register(adminPromptsRoutes);

  fastify.get("/health", async () => ({ ok: true }));

  await fastify.listen({ port: config.port, host: config.host });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});

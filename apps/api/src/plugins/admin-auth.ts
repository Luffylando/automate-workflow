import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  SESSION_COOKIE,
  extractBearerToken,
  verifySessionToken,
} from "../services/auth";
import type { AuthSession } from "../types";

declare module "fastify" {
  interface FastifyRequest {
    adminSession: AuthSession | null;
  }
}

export function registerAdminAuth(fastify: FastifyInstance): void {
  fastify.decorateRequest("adminSession", null);

  fastify.addHook("onRequest", async (request) => {
    const cookieToken = request.cookies[SESSION_COOKIE];
    const bearerToken = extractBearerToken(request.headers.authorization);
    const token = cookieToken ?? bearerToken;

    request.adminSession = token ? await verifySessionToken(token) : null;
  });
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!request.adminSession || request.adminSession.role !== "admin") {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!request.adminSession) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}

import { FastifyInstance } from "fastify";
import { config } from "../config";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifyAdminPassword,
} from "../services/auth";

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: { password?: string } }>("/api/auth/login", async (request, reply) => {
    const password = request.body.password?.trim();

    if (!password) {
      return reply.status(400).send({ error: "Password is required" });
    }

    if (!verifyAdminPassword(password)) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const token = await createSessionToken();
    reply.setCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: config.isProduction,
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return { ok: true };
  });

  fastify.post("/api/auth/logout", async (_request, reply) => {
    reply.clearCookie(SESSION_COOKIE, { path: "/" });
    return { ok: true };
  });

  fastify.get("/api/auth/me", async (request) => {
    if (!request.adminSession) {
      return { admin: false };
    }
    return { admin: true, sub: request.adminSession.sub };
  });
}

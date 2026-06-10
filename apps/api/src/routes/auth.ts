import { FastifyInstance } from "fastify";
import { config } from "../config";
import { verifyAdminCredentials } from "../services/admins";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "../services/auth";

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: { email?: string; password?: string } }>(
    "/api/auth/login",
    async (request, reply) => {
      const email = request.body.email?.trim();
      const password = request.body.password?.trim();

      if (!email || !password) {
        return reply
          .status(400)
          .send({ error: "Email and password are required" });
      }

      const admin = await verifyAdminCredentials(email, password);
      if (!admin) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      const token = await createSessionToken(admin.id, admin.email);
      reply.setCookie(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: config.isProduction,
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
      });

      return { ok: true, admin: { id: admin.id, email: admin.email } };
    },
  );

  fastify.post("/api/auth/logout", async (_request, reply) => {
    reply.clearCookie(SESSION_COOKIE, { path: "/" });
    return { ok: true };
  });

  fastify.get("/api/auth/me", async (request) => {
    if (!request.adminSession) {
      return { admin: false };
    }

    return {
      admin: true,
      sub: request.adminSession.sub,
      email: request.adminSession.email,
    };
  });
}

import { FastifyInstance } from "fastify";
import { config } from "../config";
import { verifyAdminCredentials } from "../services/admins";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "../services/auth";
import { verifyUserCredentials } from "../services/users";

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

      const appUser = await verifyUserCredentials(email, password);
      if (appUser) {
        const token = await createSessionToken(
          appUser.id,
          appUser.email,
          appUser.role,
        );
        reply.setCookie(SESSION_COOKIE, token, {
          httpOnly: true,
          sameSite: "lax",
          secure: config.isProduction,
          path: "/",
          maxAge: SESSION_MAX_AGE_SECONDS,
        });

        return {
          ok: true,
          user: { id: appUser.id, email: appUser.email, role: appUser.role },
        };
      }

      const legacyAdmin = await verifyAdminCredentials(email, password);
      if (legacyAdmin) {
        const token = await createSessionToken(
          legacyAdmin.id,
          legacyAdmin.email,
          "admin",
        );
        reply.setCookie(SESSION_COOKIE, token, {
          httpOnly: true,
          sameSite: "lax",
          secure: config.isProduction,
          path: "/",
          maxAge: SESSION_MAX_AGE_SECONDS,
        });

        return {
          ok: true,
          user: { id: legacyAdmin.id, email: legacyAdmin.email, role: "admin" },
        };
      }

      return reply.status(401).send({ error: "Invalid credentials" });
    },
  );

  fastify.post("/api/auth/logout", async (_request, reply) => {
    reply.clearCookie(SESSION_COOKIE, { path: "/" });
    return { ok: true };
  });

  fastify.get("/api/auth/me", async (request) => {
    if (!request.adminSession) {
      return { authenticated: false, admin: false };
    }

    return {
      authenticated: true,
      admin: request.adminSession.role === "admin",
      role: request.adminSession.role,
      sub: request.adminSession.sub,
      email: request.adminSession.email,
    };
  });
}

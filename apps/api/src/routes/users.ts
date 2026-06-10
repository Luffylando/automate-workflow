import { FastifyInstance } from "fastify";
import { requireAdmin } from "../plugins/admin-auth";
import type { UserRole } from "../types";
import {
  createUser,
  findUserByEmail,
  getUserById,
  isValidUserRole,
  listUsers,
  updateUserRole,
  validatePassword,
} from "../services/users";

export async function usersRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    "/api/users",
    { preHandler: requireAdmin },
    async (_request, reply) => {
      try {
        const users = await listUsers();
        return { users };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch users";
        return reply.status(500).send({ error: message });
      }
    },
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/users/:id",
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        const user = await getUserById(request.params.id);
        if (!user) {
          return reply.status(404).send({ error: "User not found" });
        }
        return user;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch user";
        return reply.status(500).send({ error: message });
      }
    },
  );

  fastify.post<{
    Body: { name?: string; email?: string; password?: string; role?: string };
  }>(
    "/api/users",
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        const name = request.body.name?.trim();
        const email = request.body.email?.trim();
        const password = request.body.password ?? "";
        const role = request.body.role?.trim();

        if (!name) {
          return reply.status(400).send({ error: "Name is required" });
        }

        if (name.length > 255) {
          return reply
            .status(400)
            .send({ error: "Name must be 255 characters or fewer" });
        }

        if (!email) {
          return reply.status(400).send({ error: "Email is required" });
        }

        if (email.length > 255) {
          return reply
            .status(400)
            .send({ error: "Email must be 255 characters or fewer" });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
          return reply.status(400).send({ error: passwordError });
        }

        if (role !== undefined && !isValidUserRole(role)) {
          return reply.status(400).send({ error: "Invalid role" });
        }

        const existing = await findUserByEmail(email);
        if (existing) {
          return reply.status(409).send({ error: "Email already in use" });
        }

        const user = await createUser({
          name,
          email,
          password,
          role: role as UserRole | undefined,
        });
        return reply.status(201).send(user);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create user";
        return reply.status(500).send({ error: message });
      }
    },
  );

  fastify.patch<{ Params: { id: string }; Body: { role?: string } }>(
    "/api/users/:id",
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        const role = request.body.role?.trim();

        if (!role) {
          return reply.status(400).send({ error: "Role is required" });
        }

        if (!isValidUserRole(role)) {
          return reply.status(400).send({ error: "Invalid role" });
        }

        const user = await updateUserRole(request.params.id, role);
        if (!user) {
          return reply.status(404).send({ error: "User not found" });
        }

        return user;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update user";
        return reply.status(500).send({ error: message });
      }
    },
  );
}

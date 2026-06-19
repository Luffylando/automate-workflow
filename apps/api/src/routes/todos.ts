import { FastifyInstance } from "fastify";
import { requireAuth } from "../plugins/admin-auth";
import {
  DuplicateRatingError,
  InvalidRatingValueError,
  rateTodo,
  TodoNotFoundError,
} from "../services/todo-ratings";
import {
  createTodo,
  deleteTodo,
  getTodoById,
  getTodoStats,
  isTodoPriority,
  isTodoStatus,
  listTodos,
  normalizeTags,
  parseDueDate,
  updateTodo,
} from "../services/todos";
import type { TodoPriority, TodoStatus } from "../types";

export async function todosRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/api/todos", async (request, reply) => {
    try {
      const userId = request.adminSession?.sub;
      const todos = await listTodos(userId);
      return { todos };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch todos";
      return reply.status(500).send({ error: message });
    }
  });

  fastify.get("/api/todos/stats", async (_request, reply) => {
    try {
      const stats = await getTodoStats();
      return { stats };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch todo stats";
      return reply.status(500).send({ error: message });
    }
  });

  fastify.get<{ Params: { id: string } }>(
    "/api/todos/:id",
    async (request, reply) => {
      try {
        const userId = request.adminSession?.sub;
        const todo = await getTodoById(request.params.id, userId);
        if (!todo) {
          return reply.status(404).send({ error: "Todo not found" });
        }
        return todo;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch todo";
        return reply.status(500).send({ error: message });
      }
    },
  );

  fastify.post<{
    Body: {
      title?: string;
      priority?: string;
      status?: string;
      dueDate?: string | null;
      tags?: unknown;
    };
  }>("/api/todos", async (request, reply) => {
    try {
      const title = request.body.title?.trim();
      if (!title) {
        return reply.status(400).send({ error: "Title is required" });
      }
      if (title.length > 500) {
        return reply
          .status(400)
          .send({ error: "Title must be 500 characters or fewer" });
      }

      const priority = request.body.priority?.trim();
      if (priority && !isTodoPriority(priority)) {
        return reply.status(400).send({ error: "Invalid priority" });
      }

      const status = request.body.status?.trim();
      if (status && !isTodoStatus(status)) {
        return reply.status(400).send({ error: "Invalid status" });
      }

      const dueDate = parseDueDate(request.body.dueDate);
      if (request.body.dueDate !== undefined && dueDate === undefined) {
        return reply.status(400).send({ error: "Invalid due date" });
      }

      const tags = normalizeTags(request.body.tags ?? []);
      if (request.body.tags !== undefined && tags === null) {
        return reply.status(400).send({ error: "Invalid tags" });
      }

      const todo = await createTodo({
        title,
        priority: priority as TodoPriority | undefined,
        status: status as TodoStatus | undefined,
        dueDate:
          dueDate === undefined ? undefined : dueDate?.toISOString() ?? null,
        tags: tags ?? [],
      });
      return reply.status(201).send(todo);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create todo";
      return reply.status(500).send({ error: message });
    }
  });

  fastify.patch<{
    Params: { id: string };
    Body: {
      title?: string;
      completed?: boolean;
      priority?: string;
      status?: string;
      dueDate?: string | null;
      tags?: unknown;
    };
  }>("/api/todos/:id", async (request, reply) => {
    try {
      const { title, completed } = request.body;

      if (title !== undefined && !title.trim()) {
        return reply.status(400).send({ error: "Title cannot be empty" });
      }

      if (title !== undefined && title.trim().length > 500) {
        return reply
          .status(400)
          .send({ error: "Title must be 500 characters or fewer" });
      }

      const priority = request.body.priority?.trim();
      if (priority && !isTodoPriority(priority)) {
        return reply.status(400).send({ error: "Invalid priority" });
      }

      const status = request.body.status?.trim();
      if (status && !isTodoStatus(status)) {
        return reply.status(400).send({ error: "Invalid status" });
      }

      const dueDate = parseDueDate(request.body.dueDate);
      if (request.body.dueDate !== undefined && dueDate === undefined) {
        return reply.status(400).send({ error: "Invalid due date" });
      }

      const tags = normalizeTags(request.body.tags);
      if (request.body.tags !== undefined && tags === null) {
        return reply.status(400).send({ error: "Invalid tags" });
      }

      if (
        title === undefined &&
        completed === undefined &&
        priority === undefined &&
        status === undefined &&
        request.body.dueDate === undefined &&
        request.body.tags === undefined
      ) {
        return reply.status(400).send({ error: "No updates provided" });
      }

      const todo = await updateTodo(request.params.id, {
        title: title?.trim(),
        completed,
        priority: priority as TodoPriority | undefined,
        status: status as TodoStatus | undefined,
        dueDate:
          request.body.dueDate === undefined
            ? undefined
            : dueDate?.toISOString() ?? null,
        tags: tags ?? undefined,
      });

      if (!todo) {
        return reply.status(404).send({ error: "Todo not found" });
      }

      return todo;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update todo";
      return reply.status(500).send({ error: message });
    }
  });

  fastify.delete<{ Params: { id: string } }>(
    "/api/todos/:id",
    async (request, reply) => {
      try {
        const deleted = await deleteTodo(request.params.id);
        if (!deleted) {
          return reply.status(404).send({ error: "Todo not found" });
        }
        return reply.status(204).send();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete todo";
        return reply.status(500).send({ error: message });
      }
    },
  );

  fastify.post<{
    Params: { id: string };
    Body: { value?: number };
  }>(
    "/api/todos/:id/ratings",
    { preHandler: requireAuth },
    async (request, reply) => {
      try {
        const value = request.body.value;

        if (value === undefined) {
          return reply.status(400).send({ error: "Rating value is required" });
        }

        const rating = await rateTodo(
          request.adminSession!.sub,
          request.params.id,
          value,
        );

        return reply.status(201).send(rating);
      } catch (error) {
        if (error instanceof InvalidRatingValueError) {
          return reply.status(400).send({ error: error.message });
        }

        if (error instanceof DuplicateRatingError) {
          return reply.status(409).send({ error: error.message });
        }

        if (error instanceof TodoNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }

        const message =
          error instanceof Error ? error.message : "Failed to rate todo";
        return reply.status(500).send({ error: message });
      }
    },
  );
}

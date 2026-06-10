import { FastifyInstance } from "fastify";
import {
  createTodo,
  deleteTodo,
  getTodoById,
  listTodos,
  updateTodo,
} from "../services/todos";

export async function todosRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/api/todos", async (_request, reply) => {
    try {
      const todos = await listTodos();
      return { todos };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch todos";
      return reply.status(500).send({ error: message });
    }
  });

  fastify.get<{ Params: { id: string } }>(
    "/api/todos/:id",
    async (request, reply) => {
      try {
        const todo = await getTodoById(request.params.id);
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

  fastify.post<{ Body: { title?: string } }>(
    "/api/todos",
    async (request, reply) => {
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
        const todo = await createTodo(title);
        return reply.status(201).send(todo);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create todo";
        return reply.status(500).send({ error: message });
      }
    },
  );

  fastify.patch<{
    Params: { id: string };
    Body: { title?: string; completed?: boolean };
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

      if (title === undefined && completed === undefined) {
        return reply.status(400).send({ error: "No updates provided" });
      }

      const todo = await updateTodo(request.params.id, {
        title: title?.trim(),
        completed,
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
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todosRoutes = todosRoutes;
const todos_1 = require("../services/todos");
async function todosRoutes(fastify) {
    fastify.get("/api/todos", async (_request, reply) => {
        try {
            const todos = await (0, todos_1.listTodos)();
            return { todos };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch todos";
            return reply.status(500).send({ error: message });
        }
    });
    fastify.get("/api/todos/:id", async (request, reply) => {
        try {
            const todo = await (0, todos_1.getTodoById)(request.params.id);
            if (!todo) {
                return reply.status(404).send({ error: "Todo not found" });
            }
            return todo;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch todo";
            return reply.status(500).send({ error: message });
        }
    });
    fastify.post("/api/todos", async (request, reply) => {
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
            const todo = await (0, todos_1.createTodo)(title);
            return reply.status(201).send(todo);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create todo";
            return reply.status(500).send({ error: message });
        }
    });
    fastify.patch("/api/todos/:id", async (request, reply) => {
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
            const todo = await (0, todos_1.updateTodo)(request.params.id, {
                title: title?.trim(),
                completed,
            });
            if (!todo) {
                return reply.status(404).send({ error: "Todo not found" });
            }
            return todo;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update todo";
            return reply.status(500).send({ error: message });
        }
    });
    fastify.delete("/api/todos/:id", async (request, reply) => {
        try {
            const deleted = await (0, todos_1.deleteTodo)(request.params.id);
            if (!deleted) {
                return reply.status(404).send({ error: "Todo not found" });
            }
            return reply.status(204).send();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete todo";
            return reply.status(500).send({ error: message });
        }
    });
}

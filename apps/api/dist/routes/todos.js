"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todosRoutes = todosRoutes;
const admin_auth_1 = require("../plugins/admin-auth");
const todo_ratings_1 = require("../services/todo-ratings");
const todos_1 = require("../services/todos");
async function todosRoutes(fastify) {
    fastify.get("/api/todos", async (request, reply) => {
        try {
            const userId = request.adminSession?.sub;
            const todos = await (0, todos_1.listTodos)(userId);
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
    fastify.post("/api/todos/:id/ratings", { preHandler: admin_auth_1.requireAuth }, async (request, reply) => {
        try {
            const value = request.body.value;
            if (value === undefined) {
                return reply.status(400).send({ error: "Rating value is required" });
            }
            const rating = await (0, todo_ratings_1.rateTodo)(request.adminSession.sub, request.params.id, value);
            return reply.status(201).send(rating);
        }
        catch (error) {
            if (error instanceof todo_ratings_1.InvalidRatingValueError) {
                return reply.status(400).send({ error: error.message });
            }
            if (error instanceof todo_ratings_1.DuplicateRatingError) {
                return reply.status(409).send({ error: error.message });
            }
            if (error instanceof todo_ratings_1.TodoNotFoundError) {
                return reply.status(404).send({ error: error.message });
            }
            const message = error instanceof Error ? error.message : "Failed to rate todo";
            return reply.status(500).send({ error: message });
        }
    });
}

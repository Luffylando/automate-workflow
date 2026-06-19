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
    fastify.get("/api/todos/stats", async (_request, reply) => {
        try {
            const stats = await (0, todos_1.getTodoStats)();
            return { stats };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch todo stats";
            return reply.status(500).send({ error: message });
        }
    });
    fastify.get("/api/todos/:id", async (request, reply) => {
        try {
            const userId = request.adminSession?.sub;
            const todo = await (0, todos_1.getTodoById)(request.params.id, userId);
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
            const priority = request.body.priority?.trim();
            if (priority && !(0, todos_1.isTodoPriority)(priority)) {
                return reply.status(400).send({ error: "Invalid priority" });
            }
            const status = request.body.status?.trim();
            if (status && !(0, todos_1.isTodoStatus)(status)) {
                return reply.status(400).send({ error: "Invalid status" });
            }
            const dueDate = (0, todos_1.parseDueDate)(request.body.dueDate);
            if (request.body.dueDate !== undefined && dueDate === undefined) {
                return reply.status(400).send({ error: "Invalid due date" });
            }
            const tags = (0, todos_1.normalizeTags)(request.body.tags ?? []);
            if (request.body.tags !== undefined && tags === null) {
                return reply.status(400).send({ error: "Invalid tags" });
            }
            const todo = await (0, todos_1.createTodo)({
                title,
                priority: priority,
                status: status,
                dueDate: dueDate === undefined ? undefined : dueDate?.toISOString() ?? null,
                tags: tags ?? [],
            });
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
            const priority = request.body.priority?.trim();
            if (priority && !(0, todos_1.isTodoPriority)(priority)) {
                return reply.status(400).send({ error: "Invalid priority" });
            }
            const status = request.body.status?.trim();
            if (status && !(0, todos_1.isTodoStatus)(status)) {
                return reply.status(400).send({ error: "Invalid status" });
            }
            const dueDate = (0, todos_1.parseDueDate)(request.body.dueDate);
            if (request.body.dueDate !== undefined && dueDate === undefined) {
                return reply.status(400).send({ error: "Invalid due date" });
            }
            const tags = (0, todos_1.normalizeTags)(request.body.tags);
            if (request.body.tags !== undefined && tags === null) {
                return reply.status(400).send({ error: "Invalid tags" });
            }
            if (title === undefined &&
                completed === undefined &&
                priority === undefined &&
                status === undefined &&
                request.body.dueDate === undefined &&
                request.body.tags === undefined) {
                return reply.status(400).send({ error: "No updates provided" });
            }
            const todo = await (0, todos_1.updateTodo)(request.params.id, {
                title: title?.trim(),
                completed,
                priority: priority,
                status: status,
                dueDate: request.body.dueDate === undefined
                    ? undefined
                    : dueDate?.toISOString() ?? null,
                tags: tags ?? undefined,
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

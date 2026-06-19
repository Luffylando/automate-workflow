"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTodoPriority = isTodoPriority;
exports.isTodoStatus = isTodoStatus;
exports.normalizeTags = normalizeTags;
exports.parseDueDate = parseDueDate;
exports.listTodos = listTodos;
exports.getTodoById = getTodoById;
exports.createTodo = createTodo;
exports.updateTodo = updateTodo;
exports.deleteTodo = deleteTodo;
exports.getTodoStats = getTodoStats;
const data_source_1 = require("../db/data-source");
const Todo_1 = require("../db/entities/Todo");
const mappers_1 = require("./mappers");
const todo_ratings_1 = require("./todo-ratings");
const TODO_PRIORITIES = ["low", "medium", "high"];
const TODO_STATUSES = [
    "todo",
    "in_progress",
    "done",
    "cancelled",
];
function isTodoPriority(value) {
    return TODO_PRIORITIES.includes(value);
}
function isTodoStatus(value) {
    return TODO_STATUSES.includes(value);
}
function normalizeTags(tags) {
    if (tags === undefined) {
        return null;
    }
    if (!Array.isArray(tags)) {
        return null;
    }
    const normalized = tags
        .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
        .filter(Boolean);
    if (normalized.some((tag) => tag.length > 50)) {
        return null;
    }
    return [...new Set(normalized)].slice(0, 10);
}
function parseDueDate(value) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null || value === "") {
        return null;
    }
    if (typeof value !== "string") {
        return undefined;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }
    return parsed;
}
function completedFromStatus(status) {
    return status === "done" || status === "cancelled";
}
function statusFromCompleted(completed, currentStatus) {
    if (completed) {
        return currentStatus === "cancelled" ? "cancelled" : "done";
    }
    if (currentStatus === "done" || currentStatus === "cancelled") {
        return "todo";
    }
    return currentStatus;
}
function enrichTodoDto(todo, summaries, userRatings) {
    const summary = summaries.get(todo.id);
    const myRating = userRatings.get(todo.id);
    return {
        ...todo,
        averageRating: summary?.averageRating ?? null,
        ratingCount: summary?.ratingCount ?? 0,
        myRating: myRating ?? null,
    };
}
async function listTodos(userId) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const todos = await dataSource.getRepository(Todo_1.Todo).find({
        order: { createdAt: "DESC" },
    });
    const todoDtos = todos.map(mappers_1.toTodoDto);
    const todoIds = todoDtos.map((todo) => todo.id);
    const summaries = await (0, todo_ratings_1.getRatingSummariesForTodos)(todoIds);
    const userRatings = userId
        ? await (0, todo_ratings_1.getUserRatingsForTodos)(userId, todoIds)
        : new Map();
    return todoDtos.map((todo) => enrichTodoDto(todo, summaries, userRatings));
}
async function getTodoById(id, userId) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const todo = await dataSource.getRepository(Todo_1.Todo).findOne({ where: { id } });
    if (!todo) {
        return null;
    }
    const dto = (0, mappers_1.toTodoDto)(todo);
    const summaries = await (0, todo_ratings_1.getRatingSummariesForTodos)([id]);
    const userRatings = userId
        ? await (0, todo_ratings_1.getUserRatingsForTodos)(userId, [id])
        : new Map();
    return enrichTodoDto(dto, summaries, userRatings);
}
async function createTodo(input) {
    const data = typeof input === "string" ? { title: input } : input;
    const status = data.status ?? "todo";
    const dataSource = await (0, data_source_1.getDataSource)();
    const repo = dataSource.getRepository(Todo_1.Todo);
    const dueDate = parseDueDate(data.dueDate ?? undefined);
    const todo = repo.create({
        title: data.title,
        completed: completedFromStatus(status),
        priority: data.priority ?? "medium",
        status,
        dueDate: dueDate ?? null,
        tags: normalizeTags(data.tags ?? []) ?? [],
    });
    const saved = await repo.save(todo);
    return (0, mappers_1.toTodoDto)(saved);
}
async function updateTodo(id, updates) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const repo = dataSource.getRepository(Todo_1.Todo);
    const todo = await repo.findOne({ where: { id } });
    if (!todo) {
        return null;
    }
    if (updates.title !== undefined) {
        todo.title = updates.title;
    }
    if (updates.priority !== undefined) {
        todo.priority = updates.priority;
    }
    if (updates.status !== undefined) {
        todo.status = updates.status;
        todo.completed = completedFromStatus(updates.status);
    }
    if (updates.completed !== undefined) {
        todo.completed = updates.completed;
        todo.status = statusFromCompleted(updates.completed, todo.status);
    }
    if (updates.dueDate !== undefined) {
        const dueDate = parseDueDate(updates.dueDate);
        todo.dueDate = dueDate ?? null;
    }
    if (updates.tags !== undefined) {
        const tags = normalizeTags(updates.tags);
        if (tags) {
            todo.tags = tags;
        }
    }
    const saved = await repo.save(todo);
    return (0, mappers_1.toTodoDto)(saved);
}
async function deleteTodo(id) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const result = await dataSource.getRepository(Todo_1.Todo).delete({ id });
    const deleted = (result.affected ?? 0) > 0;
    if (deleted) {
        await (0, todo_ratings_1.deleteRatingsForTodo)(id);
    }
    return deleted;
}
async function getTodoStats() {
    const dataSource = await (0, data_source_1.getDataSource)();
    const repo = dataSource.getRepository(Todo_1.Todo);
    const todos = await repo.find();
    const now = new Date();
    const stats = {
        total: todos.length,
        open: 0,
        done: 0,
        cancelled: 0,
        inProgress: 0,
        overdue: 0,
        highPriority: 0,
        rated: 0,
        averageRating: null,
    };
    for (const todo of todos) {
        switch (todo.status) {
            case "done":
                stats.done += 1;
                break;
            case "cancelled":
                stats.cancelled += 1;
                break;
            case "in_progress":
                stats.inProgress += 1;
                stats.open += 1;
                break;
            default:
                stats.open += 1;
                break;
        }
        const isClosed = todo.status === "done" || todo.status === "cancelled";
        if (!isClosed &&
            todo.dueDate &&
            todo.dueDate.getTime() < now.getTime()) {
            stats.overdue += 1;
        }
        if (!isClosed && todo.priority === "high") {
            stats.highPriority += 1;
        }
    }
    const summaries = await (0, todo_ratings_1.getRatingSummariesForTodos)(todos.map((todo) => todo.id));
    let ratingTotal = 0;
    let ratingCount = 0;
    for (const summary of summaries.values()) {
        if (summary.ratingCount > 0) {
            stats.rated += 1;
        }
        if (summary.averageRating != null && summary.ratingCount > 0) {
            ratingTotal += summary.averageRating * summary.ratingCount;
            ratingCount += summary.ratingCount;
        }
    }
    if (ratingCount > 0) {
        stats.averageRating = Math.round((ratingTotal / ratingCount) * 10) / 10;
    }
    return stats;
}

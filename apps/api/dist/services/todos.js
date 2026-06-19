"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
async function getTodoById(id) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const todo = await dataSource.getRepository(Todo_1.Todo).findOne({ where: { id } });
    return todo ? (0, mappers_1.toTodoDto)(todo) : null;
}
async function createTodo(input) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const repo = dataSource.getRepository(Todo_1.Todo);
    const todo = repo.create({
        title: input.title,
        description: input.description ?? null,
        priority: input.priority ?? "medium",
        dueDate: input.dueDate ?? null,
        completed: false,
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
    if (updates.description !== undefined) {
        todo.description = updates.description;
    }
    if (updates.priority !== undefined) {
        todo.priority = updates.priority;
    }
    if (updates.dueDate !== undefined) {
        todo.dueDate = updates.dueDate;
    }
    if (updates.completed !== undefined) {
        todo.completed = updates.completed;
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
    const now = new Date();
    const [total, completed, overdue, highPriority, priorityRows, ratingRow] = await Promise.all([
        repo.count(),
        repo.count({ where: { completed: true } }),
        repo
            .createQueryBuilder("todo")
            .where("todo.completed = false")
            .andWhere("todo.dueDate IS NOT NULL")
            .andWhere("todo.dueDate < :now", { now })
            .getCount(),
        repo.count({ where: { completed: false, priority: "high" } }),
        repo
            .createQueryBuilder("todo")
            .select("todo.priority", "priority")
            .addSelect("COUNT(todo.id)", "count")
            .groupBy("todo.priority")
            .getRawMany(),
        dataSource
            .createQueryBuilder()
            .select("AVG(rating.value)", "average")
            .from("todo_ratings", "rating")
            .getRawOne(),
    ]);
    const byPriority = {
        low: 0,
        medium: 0,
        high: 0,
    };
    for (const row of priorityRows) {
        byPriority[row.priority] = Number(row.count);
    }
    const averageRating = ratingRow?.average != null ? Number(ratingRow.average) : null;
    return {
        total,
        open: total - completed,
        completed,
        overdue,
        highPriority,
        averageRating,
        byPriority,
    };
}

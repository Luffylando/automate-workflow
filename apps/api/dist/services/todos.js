"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTodos = listTodos;
exports.getTodoById = getTodoById;
exports.createTodo = createTodo;
exports.updateTodo = updateTodo;
exports.deleteTodo = deleteTodo;
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
async function createTodo(title) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const repo = dataSource.getRepository(Todo_1.Todo);
    const todo = repo.create({ title, completed: false });
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

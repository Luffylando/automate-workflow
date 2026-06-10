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
async function listTodos() {
    const dataSource = await (0, data_source_1.getDataSource)();
    const todos = await dataSource.getRepository(Todo_1.Todo).find({
        order: { createdAt: "DESC" },
    });
    return todos.map(mappers_1.toTodoDto);
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
    return (result.affected ?? 0) > 0;
}

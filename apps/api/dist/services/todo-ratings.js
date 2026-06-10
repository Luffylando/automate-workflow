"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoNotFoundError = exports.DuplicateRatingError = exports.InvalidRatingValueError = void 0;
exports.rateTodo = rateTodo;
exports.deleteRatingsForTodo = deleteRatingsForTodo;
exports.getRatingSummariesForTodos = getRatingSummariesForTodos;
exports.getUserRatingsForTodos = getUserRatingsForTodos;
const data_source_1 = require("../db/data-source");
const Todo_1 = require("../db/entities/Todo");
const TodoRating_1 = require("../db/entities/TodoRating");
const mappers_1 = require("./mappers");
class InvalidRatingValueError extends Error {
    constructor() {
        super("Rating must be an integer between 1 and 5");
        this.name = "InvalidRatingValueError";
    }
}
exports.InvalidRatingValueError = InvalidRatingValueError;
class DuplicateRatingError extends Error {
    constructor() {
        super("You have already rated this todo");
        this.name = "DuplicateRatingError";
    }
}
exports.DuplicateRatingError = DuplicateRatingError;
class TodoNotFoundError extends Error {
    constructor() {
        super("Todo not found");
        this.name = "TodoNotFoundError";
    }
}
exports.TodoNotFoundError = TodoNotFoundError;
function isValidRatingValue(value) {
    return Number.isInteger(value) && value >= 1 && value <= 5;
}
async function rateTodo(userId, todoId, value) {
    if (!isValidRatingValue(value)) {
        throw new InvalidRatingValueError();
    }
    const dataSource = await (0, data_source_1.getDataSource)();
    const todoRepo = dataSource.getRepository(Todo_1.Todo);
    const ratingRepo = dataSource.getRepository(TodoRating_1.TodoRating);
    const todo = await todoRepo.findOne({ where: { id: todoId } });
    if (!todo) {
        throw new TodoNotFoundError();
    }
    const existing = await ratingRepo.findOne({ where: { userId, todoId } });
    if (existing) {
        throw new DuplicateRatingError();
    }
    const rating = ratingRepo.create({ userId, todoId, value });
    const saved = await ratingRepo.save(rating);
    return (0, mappers_1.toTodoRatingDto)(saved);
}
async function deleteRatingsForTodo(todoId) {
    const dataSource = await (0, data_source_1.getDataSource)();
    await dataSource.getRepository(TodoRating_1.TodoRating).delete({ todoId });
}
async function getRatingSummariesForTodos(todoIds) {
    const summaries = new Map();
    if (todoIds.length === 0) {
        return summaries;
    }
    const dataSource = await (0, data_source_1.getDataSource)();
    const rows = await dataSource
        .getRepository(TodoRating_1.TodoRating)
        .createQueryBuilder("rating")
        .select("rating.todoId", "todoId")
        .addSelect("AVG(rating.value)", "average")
        .addSelect("COUNT(rating.id)", "count")
        .where("rating.todoId IN (:...todoIds)", { todoIds })
        .groupBy("rating.todoId")
        .getRawMany();
    for (const row of rows) {
        summaries.set(row.todoId, {
            averageRating: Number(row.average),
            ratingCount: Number(row.count),
        });
    }
    return summaries;
}
async function getUserRatingsForTodos(userId, todoIds) {
    const ratings = new Map();
    if (todoIds.length === 0) {
        return ratings;
    }
    const dataSource = await (0, data_source_1.getDataSource)();
    const rows = await dataSource.getRepository(TodoRating_1.TodoRating).find({
        where: todoIds.map((todoId) => ({ userId, todoId })),
        select: ["todoId", "value"],
    });
    for (const row of rows) {
        ratings.set(row.todoId, row.value);
    }
    return ratings;
}

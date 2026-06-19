"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidTodoPriority = isValidTodoPriority;
exports.parseOptionalDueDate = parseOptionalDueDate;
const TODO_PRIORITIES = ["low", "medium", "high"];
function isValidTodoPriority(value) {
    return TODO_PRIORITIES.includes(value);
}
function parseOptionalDueDate(value) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null || value === "") {
        return null;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }
    return parsed;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTodoDto = toTodoDto;
exports.toUserDto = toUserDto;
exports.toJobDto = toJobDto;
function toTodoDto(todo) {
    return {
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
    };
}
function toUserDto(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
    };
}
function toJobDto(job) {
    return {
        id: job.id,
        prompt: job.prompt,
        status: job.status,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        prUrl: job.prUrl ?? undefined,
        agentId: job.agentId ?? undefined,
        agentRunId: job.agentRunId ?? undefined,
        error: job.error ?? undefined,
    };
}

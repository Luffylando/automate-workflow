import { describe, expect, it } from "vitest";
import { Job } from "../db/entities/Job";
import { Todo } from "../db/entities/Todo";
import { TodoRating } from "../db/entities/TodoRating";
import { User } from "../db/entities/User";
import { toJobDto, toTodoDto, toTodoRatingDto, toUserDto } from "./mappers";

describe("mappers", () => {
  it("maps a todo entity to dto", () => {
    const dueDate = new Date("2026-06-20T17:00:00.000Z");
    const todo = {
      id: "todo-1",
      title: "Write tests",
      description: "Cover mapper output",
      priority: "high",
      dueDate,
      completed: false,
      createdAt: new Date("2026-06-10T10:00:00.000Z"),
      updatedAt: new Date("2026-06-10T10:05:00.000Z"),
    } as Todo;

    expect(toTodoDto(todo)).toEqual({
      id: "todo-1",
      title: "Write tests",
      description: "Cover mapper output",
      priority: "high",
      dueDate: dueDate.toISOString(),
      completed: false,
      createdAt: "2026-06-10T10:00:00.000Z",
      updatedAt: "2026-06-10T10:05:00.000Z",
    });
  });

  it("maps a todo rating entity to dto", () => {
    const rating = {
      id: "rating-1",
      userId: "user-1",
      todoId: "todo-1",
      value: 5,
      createdAt: new Date("2026-06-10T10:00:00.000Z"),
    } as TodoRating;

    expect(toTodoRatingDto(rating)).toEqual({
      id: "rating-1",
      userId: "user-1",
      todoId: "todo-1",
      value: 5,
      createdAt: "2026-06-10T10:00:00.000Z",
    });
  });

  it("maps a user entity to dto", () => {
    const user = {
      id: "user-1",
      name: "Alex Rivera",
      email: "alex@example.com",
      role: "admin",
      createdAt: new Date("2026-06-10T10:00:00.000Z"),
    } as User;

    expect(toUserDto(user)).toEqual({
      id: "user-1",
      name: "Alex Rivera",
      email: "alex@example.com",
      role: "admin",
      createdAt: "2026-06-10T10:00:00.000Z",
    });
  });

  it("maps a job entity to dto", () => {
    const job = {
      id: "job-1",
      prompt: "Add todos",
      status: "queued",
      prUrl: null,
      agentId: null,
      agentRunId: null,
      error: null,
      submittedById: "admin-1",
      submittedByEmail: "admin@example.com",
      metadata: { source: "prompt-console" },
      createdAt: new Date("2026-06-10T10:00:00.000Z"),
      updatedAt: new Date("2026-06-10T10:05:00.000Z"),
    } as Job;

    expect(toJobDto(job)).toEqual({
      id: "job-1",
      prompt: "Add todos",
      status: "queued",
      createdAt: "2026-06-10T10:00:00.000Z",
      updatedAt: "2026-06-10T10:05:00.000Z",
      submittedById: "admin-1",
      submittedByEmail: "admin@example.com",
      metadata: { source: "prompt-console" },
    });
  });
});

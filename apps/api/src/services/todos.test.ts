import { describe, expect, it, vi, beforeEach } from "vitest";
import { Todo } from "../db/entities/Todo";
import {
  createTodo,
  getTodoStats,
  isTodoPriority,
  isTodoStatus,
  normalizeTags,
  parseDueDate,
} from "./todos";

const mockSave = vi.fn();
const mockCreate = vi.fn();
const mockFind = vi.fn();
const mockGetRepository = vi.fn();

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(async () => ({
    getRepository: mockGetRepository,
  })),
}));

vi.mock("./todo-ratings", () => ({
  getRatingSummariesForTodos: vi.fn(async () => new Map()),
  getUserRatingsForTodos: vi.fn(async () => new Map()),
  deleteRatingsForTodo: vi.fn(async () => undefined),
}));

describe("todos service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRepository.mockReturnValue({
      create: mockCreate,
      save: mockSave,
      find: mockFind,
    });
  });

  it("creates a todo with extended fields", async () => {
    const createdAt = new Date("2026-06-10T10:00:00.000Z");
    const updatedAt = new Date("2026-06-10T10:05:00.000Z");
    const entity = {
      id: "todo-1",
      title: "Write tests",
      completed: false,
      priority: "high",
      status: "todo",
      dueDate: new Date("2026-06-20T12:00:00.000Z"),
      tags: ["testing"],
      createdAt,
      updatedAt,
    } as Todo;

    mockCreate.mockReturnValue(entity);
    mockSave.mockResolvedValue(entity);

    const result = await createTodo({
      title: "Write tests",
      priority: "high",
      dueDate: "2026-06-20T12:00:00.000Z",
      tags: ["testing"],
    });

    expect(mockCreate).toHaveBeenCalledWith({
      title: "Write tests",
      completed: false,
      priority: "high",
      status: "todo",
      dueDate: new Date("2026-06-20T12:00:00.000Z"),
      tags: ["testing"],
    });
    expect(result).toEqual({
      id: "todo-1",
      title: "Write tests",
      completed: false,
      priority: "high",
      status: "todo",
      dueDate: "2026-06-20T12:00:00.000Z",
      tags: ["testing"],
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  });

  it("aggregates todo stats", async () => {
    const now = Date.now();
    mockFind.mockResolvedValue([
      {
        id: "1",
        status: "todo",
        priority: "high",
        dueDate: new Date(now - 86_400_000),
      },
      {
        id: "2",
        status: "in_progress",
        priority: "medium",
        dueDate: new Date(now + 86_400_000),
      },
      {
        id: "3",
        status: "done",
        priority: "low",
        dueDate: null,
      },
      {
        id: "4",
        status: "cancelled",
        priority: "high",
        dueDate: new Date(now - 86_400_000),
      },
    ]);

    const { getRatingSummariesForTodos } = await import("./todo-ratings");
    vi.mocked(getRatingSummariesForTodos).mockResolvedValue(
      new Map([
        ["1", { averageRating: 4, ratingCount: 2 }],
        ["2", { averageRating: null, ratingCount: 0 }],
      ]),
    );

    const result = await getTodoStats();

    expect(result).toEqual({
      total: 4,
      open: 2,
      done: 1,
      cancelled: 1,
      inProgress: 1,
      overdue: 1,
      highPriority: 1,
      rated: 1,
      averageRating: 4,
    });
  });

  it("validates todo metadata helpers", () => {
    expect(isTodoPriority("high")).toBe(true);
    expect(isTodoPriority("urgent")).toBe(false);
    expect(isTodoStatus("in_progress")).toBe(true);
    expect(isTodoStatus("blocked")).toBe(false);
    expect(normalizeTags([" api ", "api", "frontend"])).toEqual([
      "api",
      "frontend",
    ]);
    expect(parseDueDate("2026-06-20T12:00:00.000Z")).toEqual(
      new Date("2026-06-20T12:00:00.000Z"),
    );
    expect(parseDueDate("not-a-date")).toBeUndefined();
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { Todo } from "../db/entities/Todo";
import { createTodo, getTodoStats } from "./todos";

const mockSave = vi.fn();
const mockCreate = vi.fn();
const mockCount = vi.fn();
const mockRepoCreateQueryBuilder = vi.fn();
const mockDataSourceCreateQueryBuilder = vi.fn();
const mockGetRepository = vi.fn();

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(async () => ({
    getRepository: mockGetRepository,
    createQueryBuilder: mockDataSourceCreateQueryBuilder,
  })),
}));

describe("todos service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRepository.mockReturnValue({
      create: mockCreate,
      save: mockSave,
      count: mockCount,
      createQueryBuilder: mockRepoCreateQueryBuilder,
    });
  });

  it("creates a todo with extended fields", async () => {
    const createdAt = new Date("2026-06-10T10:00:00.000Z");
    const updatedAt = new Date("2026-06-10T10:05:00.000Z");
    const dueDate = new Date("2026-06-20T17:00:00.000Z");
    const entity = {
      id: "todo-1",
      title: "Write tests",
      description: "Cover todo stats and validation",
      priority: "high",
      dueDate,
      completed: false,
      createdAt,
      updatedAt,
    } as Todo;

    mockCreate.mockReturnValue(entity);
    mockSave.mockResolvedValue(entity);

    const result = await createTodo({
      title: "Write tests",
      description: "Cover todo stats and validation",
      priority: "high",
      dueDate,
    });

    expect(mockCreate).toHaveBeenCalledWith({
      title: "Write tests",
      description: "Cover todo stats and validation",
      priority: "high",
      dueDate,
      completed: false,
    });
    expect(result).toEqual({
      id: "todo-1",
      title: "Write tests",
      description: "Cover todo stats and validation",
      priority: "high",
      dueDate: dueDate.toISOString(),
      completed: false,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  });

  it("aggregates todo stats", async () => {
    mockCount
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2);

    mockRepoCreateQueryBuilder
      .mockReturnValueOnce({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(1),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        getRawMany: vi.fn().mockResolvedValue([
          { priority: "low", count: "2" },
          { priority: "medium", count: "5" },
          { priority: "high", count: "3" },
        ]),
      });

    mockDataSourceCreateQueryBuilder.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      getRawOne: vi.fn().mockResolvedValue({ average: "3.75" }),
    });

    const result = await getTodoStats();

    expect(result).toEqual({
      total: 10,
      open: 6,
      completed: 4,
      overdue: 1,
      highPriority: 2,
      averageRating: 3.75,
      byPriority: {
        low: 2,
        medium: 5,
        high: 3,
      },
    });
  });
});

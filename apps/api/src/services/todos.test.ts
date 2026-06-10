import { describe, expect, it, vi, beforeEach } from "vitest";
import { Todo } from "../db/entities/Todo";
import { createTodo } from "./todos";

const mockSave = vi.fn();
const mockCreate = vi.fn();
const mockGetRepository = vi.fn();

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(async () => ({
    getRepository: mockGetRepository,
  })),
}));

describe("todos service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRepository.mockReturnValue({
      create: mockCreate,
      save: mockSave,
    });
  });

  it("creates a todo with title and completed fields", async () => {
    const createdAt = new Date("2026-06-10T10:00:00.000Z");
    const updatedAt = new Date("2026-06-10T10:05:00.000Z");
    const entity = {
      id: "todo-1",
      title: "Write tests",
      completed: false,
      createdAt,
      updatedAt,
    } as Todo;

    mockCreate.mockReturnValue(entity);
    mockSave.mockResolvedValue(entity);

    const result = await createTodo("Write tests");

    expect(mockCreate).toHaveBeenCalledWith({
      title: "Write tests",
      completed: false,
    });
    expect(mockSave).toHaveBeenCalledWith(entity);
    expect(result).toEqual({
      id: "todo-1",
      title: "Write tests",
      completed: false,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  });
});

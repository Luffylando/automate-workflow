import { beforeEach, describe, expect, it, vi } from "vitest";
import { TodoRating } from "../db/entities/TodoRating";
import {
  DuplicateRatingError,
  InvalidRatingValueError,
  rateTodo,
  TodoNotFoundError,
} from "./todo-ratings";

const mockSave = vi.fn();
const mockCreate = vi.fn();
const mockFindOneTodo = vi.fn();
const mockFindOneRating = vi.fn();
const mockGetRepository = vi.fn();

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(async () => ({
    getRepository: mockGetRepository,
  })),
}));

describe("todo-ratings service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetRepository.mockImplementation((entity) => {
      if (entity.name === "Todo") {
        return { findOne: mockFindOneTodo };
      }

      return {
        create: mockCreate,
        save: mockSave,
        findOne: mockFindOneRating,
      };
    });
  });

  it("creates a rating when the todo exists and the user has not rated it", async () => {
    const createdAt = new Date("2026-06-10T10:00:00.000Z");
    const entity = {
      id: "rating-1",
      userId: "user-1",
      todoId: "todo-1",
      value: 4,
      createdAt,
    } as TodoRating;

    mockFindOneTodo.mockResolvedValue({ id: "todo-1" });
    mockFindOneRating.mockResolvedValue(null);
    mockCreate.mockReturnValue(entity);
    mockSave.mockResolvedValue(entity);

    const result = await rateTodo("user-1", "todo-1", 4);

    expect(mockCreate).toHaveBeenCalledWith({
      userId: "user-1",
      todoId: "todo-1",
      value: 4,
    });
    expect(result).toEqual({
      id: "rating-1",
      userId: "user-1",
      todoId: "todo-1",
      value: 4,
      createdAt: createdAt.toISOString(),
    });
  });

  it("rejects invalid rating values", async () => {
    await expect(rateTodo("user-1", "todo-1", 0)).rejects.toBeInstanceOf(
      InvalidRatingValueError,
    );
    await expect(rateTodo("user-1", "todo-1", 6)).rejects.toBeInstanceOf(
      InvalidRatingValueError,
    );
    await expect(rateTodo("user-1", "todo-1", 3.5)).rejects.toBeInstanceOf(
      InvalidRatingValueError,
    );
  });

  it("rejects duplicate ratings from the same user", async () => {
    mockFindOneTodo.mockResolvedValue({ id: "todo-1" });
    mockFindOneRating.mockResolvedValue({
      id: "rating-1",
      userId: "user-1",
      todoId: "todo-1",
      value: 3,
    });

    await expect(rateTodo("user-1", "todo-1", 5)).rejects.toBeInstanceOf(
      DuplicateRatingError,
    );
  });

  it("rejects ratings for missing todos", async () => {
    mockFindOneTodo.mockResolvedValue(null);

    await expect(rateTodo("user-1", "todo-1", 5)).rejects.toBeInstanceOf(
      TodoNotFoundError,
    );
  });
});

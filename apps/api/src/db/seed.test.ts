import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_PASSWORD, seedDemoData } from "./seed";

const mockUserCount = vi.fn();
const mockTodoCount = vi.fn();
const mockRatingCount = vi.fn();
const mockUserFind = vi.fn();
const mockTodoFind = vi.fn();
const mockCreateUser = vi.fn();
const mockCreateTodo = vi.fn();
const mockUpdateTodo = vi.fn();
const mockRateTodo = vi.fn();

vi.mock("../config", () => ({
  config: {
    isProduction: false,
  },
}));

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(async () => ({
    getRepository: (entity: { name?: string }) => {
      if (entity.name === "User") {
        return {
          count: mockUserCount,
          find: mockUserFind,
        };
      }

      if (entity.name === "Todo") {
        return {
          count: mockTodoCount,
          find: mockTodoFind,
        };
      }

      return {
        count: mockRatingCount,
      };
    },
  })),
}));

vi.mock("../services/users", () => ({
  createUser: (...args: unknown[]) => mockCreateUser(...args),
}));

vi.mock("../services/todos", () => ({
  createTodo: (...args: unknown[]) => mockCreateTodo(...args),
  updateTodo: (...args: unknown[]) => mockUpdateTodo(...args),
}));

vi.mock("../services/todo-ratings", () => ({
  rateTodo: (...args: unknown[]) => mockRateTodo(...args),
}));

describe("seedDemoData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserCount.mockResolvedValue(0);
    mockTodoCount.mockResolvedValue(0);
    mockRatingCount.mockResolvedValue(0);
    mockCreateUser.mockResolvedValue({ id: "user-id" });
    mockCreateTodo.mockImplementation(async (input: { title: string }) => ({
      id: `todo-${input.title}`,
      title: input.title,
      completed: false,
    }));
    mockUpdateTodo.mockResolvedValue(null);
    mockUserFind.mockResolvedValue([
      { id: "user-1", email: "alex@example.com" },
      { id: "user-2", email: "sam@example.com" },
      { id: "user-3", email: "jordan@example.com" },
      { id: "user-4", email: "taylor@example.com" },
      { id: "user-5", email: "morgan@example.com" },
    ]);
    mockTodoFind.mockResolvedValue([
      { id: "todo-1", title: "Review dashboard layout" },
      { id: "todo-2", title: "Ship user management UI" },
      { id: "todo-3", title: "Add rating stars to todo cards" },
      {
        id: "todo-4",
        title: "Polish dark mode contrast on stat cards",
      },
      { id: "todo-5", title: "Write API integration tests" },
    ]);
  });

  it("seeds users, todos, and ratings when tables are empty", async () => {
    await seedDemoData();

    expect(mockCreateUser).toHaveBeenCalledTimes(5);
    expect(mockCreateUser).toHaveBeenCalledWith({
      name: "Alex Rivera",
      email: "alex@example.com",
      password: DEMO_PASSWORD,
      role: "user",
    });
    expect(mockCreateUser).toHaveBeenCalledWith({
      name: "Jordan Lee",
      email: "jordan@example.com",
      password: DEMO_PASSWORD,
      role: "admin",
    });

    expect(mockCreateTodo).toHaveBeenCalledTimes(10);
    expect(mockUpdateTodo).toHaveBeenCalled();
    expect(mockRateTodo).toHaveBeenCalledTimes(6);
  });

  it("skips seeding when data already exists", async () => {
    mockUserCount.mockResolvedValue(3);
    mockTodoCount.mockResolvedValue(4);
    mockRatingCount.mockResolvedValue(2);

    await seedDemoData();

    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(mockCreateTodo).not.toHaveBeenCalled();
    expect(mockRateTodo).not.toHaveBeenCalled();
  });

  it("does not seed in production", async () => {
    const { config } = await import("../config");
    vi.mocked(config).isProduction = true;

    await seedDemoData();

    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(mockCreateTodo).not.toHaveBeenCalled();
    expect(mockRateTodo).not.toHaveBeenCalled();

    vi.mocked(config).isProduction = false;
  });
});

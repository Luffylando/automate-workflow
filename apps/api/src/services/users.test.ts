import { describe, expect, it, vi, beforeEach } from "vitest";
import { User } from "../db/entities/User";
import { createUser, updateUserRole } from "./users";

const mockSave = vi.fn();
const mockCreate = vi.fn();
const mockFindOne = vi.fn();
const mockGetRepository = vi.fn();

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(async () => ({
    getRepository: mockGetRepository,
  })),
}));

describe("users service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRepository.mockReturnValue({
      create: mockCreate,
      save: mockSave,
      findOne: mockFindOne,
    });
  });

  it("creates a user with name, email, and role", async () => {
    const createdAt = new Date("2026-06-10T10:00:00.000Z");
    const entity = {
      id: "user-1",
      name: "Alex Rivera",
      email: "alex@example.com",
      role: "user",
      createdAt,
    } as User;

    mockCreate.mockReturnValue(entity);
    mockSave.mockResolvedValue(entity);

    const result = await createUser({
      name: "Alex Rivera",
      email: "Alex@Example.com",
      role: "user",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      name: "Alex Rivera",
      email: "alex@example.com",
      role: "user",
    });
    expect(mockSave).toHaveBeenCalledWith(entity);
    expect(result).toEqual({
      id: "user-1",
      name: "Alex Rivera",
      email: "alex@example.com",
      role: "user",
      createdAt: createdAt.toISOString(),
    });
  });

  it("updates a user role", async () => {
    const createdAt = new Date("2026-06-10T10:00:00.000Z");
    const entity = {
      id: "user-1",
      name: "Alex Rivera",
      email: "alex@example.com",
      role: "user",
      createdAt,
    } as User;

    mockFindOne.mockResolvedValue(entity);
    mockSave.mockImplementation(async (user: User) => ({
      ...user,
      role: "admin",
    }));

    const result = await updateUserRole("user-1", "admin");

    expect(mockFindOne).toHaveBeenCalledWith({ where: { id: "user-1" } });
    expect(entity.role).toBe("admin");
    expect(mockSave).toHaveBeenCalledWith(entity);
    expect(result).toEqual({
      id: "user-1",
      name: "Alex Rivera",
      email: "alex@example.com",
      role: "admin",
      createdAt: createdAt.toISOString(),
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminUser } from "../db/entities/AdminUser";
import { verifyAdminCredentials } from "./admins";

const mockFindOne = vi.fn();

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(async () => ({
    getRepository: () => ({
      findOne: mockFindOne,
    }),
  })),
}));

vi.mock("./password", () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

describe("admins service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns admin when credentials are valid", async () => {
    const admin = {
      id: "admin-1",
      email: "admin@localhost",
      passwordHash: "hash",
      createdAt: new Date(),
    } as AdminUser;

    mockFindOne.mockResolvedValue(admin);

    const { verifyPassword } = await import("./password");
    vi.mocked(verifyPassword).mockResolvedValue(true);

    await expect(
      verifyAdminCredentials("admin@localhost", "secret"),
    ).resolves.toEqual(admin);

    expect(mockFindOne).toHaveBeenCalledWith({
      where: { email: "admin@localhost" },
    });
  });

  it("returns null when password is invalid", async () => {
    mockFindOne.mockResolvedValue({
      id: "admin-1",
      email: "admin@localhost",
      passwordHash: "hash",
      createdAt: new Date(),
    });

    const { verifyPassword } = await import("./password");
    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(
      verifyAdminCredentials("admin@localhost", "wrong"),
    ).resolves.toBeNull();
  });

  it("returns null when admin does not exist", async () => {
    mockFindOne.mockResolvedValue(null);

    await expect(
      verifyAdminCredentials("missing@localhost", "secret"),
    ).resolves.toBeNull();
  });
});

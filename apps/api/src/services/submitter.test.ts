import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  lookupSubmitterEmail,
  lookupSubmitterEmailsByIds,
  resolveSubmitterEmail,
} from "./submitter";

const mockGetUserById = vi.fn();
const mockGetAdminById = vi.fn();

vi.mock("./users", () => ({
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
}));

vi.mock("./admins", () => ({
  getAdminById: (...args: unknown[]) => mockGetAdminById(...args),
}));

describe("submitter service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns stored submitter email when present", async () => {
    await expect(
      resolveSubmitterEmail("user-1", "  admin@example.com  "),
    ).resolves.toBe("admin@example.com");
    expect(mockGetUserById).not.toHaveBeenCalled();
  });

  it("looks up email from users when missing on the job", async () => {
    mockGetUserById.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    });

    await expect(
      resolveSubmitterEmail("user-1", null),
    ).resolves.toBe("user@example.com");
    expect(mockGetUserById).toHaveBeenCalledWith("user-1");
    expect(mockGetAdminById).not.toHaveBeenCalled();
  });

  it("falls back to legacy admin users when app user is missing", async () => {
    mockGetUserById.mockResolvedValue(null);
    mockGetAdminById.mockResolvedValue({
      id: "admin-1",
      email: "legacy-admin@example.com",
    });

    await expect(lookupSubmitterEmail("admin-1")).resolves.toBe(
      "legacy-admin@example.com",
    );
    expect(mockGetAdminById).toHaveBeenCalledWith("admin-1");
  });

  it("batch-resolves submitter emails by id", async () => {
    mockGetUserById.mockImplementation(async (id: string) => {
      if (id === "user-1") {
        return { id, email: "user@example.com" };
      }
      return null;
    });
    mockGetAdminById.mockImplementation(async (id: string) => {
      if (id === "admin-1") {
        return { id, email: "admin@example.com" };
      }
      return null;
    });

    const emails = await lookupSubmitterEmailsByIds(["user-1", "admin-1"]);

    expect(emails.get("user-1")).toBe("user@example.com");
    expect(emails.get("admin-1")).toBe("admin@example.com");
  });
});

import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password service", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("super-secret");
    expect(hash).toContain(":");

    await expect(verifyPassword("super-secret", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("rejects invalid stored hashes", async () => {
    await expect(verifyPassword("password", "not-a-valid-hash")).resolves.toBe(
      false,
    );
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createSessionToken,
  extractBearerToken,
  verifySessionToken,
} from "./auth";

vi.mock("../config", () => ({
  config: {
    sessionSecret: "test-session-secret-with-enough-length",
  },
}));

describe("auth service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates and verifies an admin JWT session token", async () => {
    const token = await createSessionToken(
      "admin-user-id",
      "admin@example.com",
      "admin",
    );

    const session = await verifySessionToken(token);
    expect(session).toEqual({
      role: "admin",
      sub: "admin-user-id",
      email: "admin@example.com",
    });
  });

  it("creates and verifies a user JWT session token", async () => {
    const token = await createSessionToken(
      "user-id",
      "user@example.com",
      "user",
    );

    const session = await verifySessionToken(token);
    expect(session).toEqual({
      role: "user",
      sub: "user-id",
      email: "user@example.com",
    });
  });

  it("rejects tokens with an invalid role", async () => {
    const { SignJWT } = await import("jose");
    const token = await new SignJWT({ role: "superuser", sub: "123" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("test-session-secret-with-enough-length"));

    await expect(verifySessionToken(token)).resolves.toBeNull();
  });

  it("extracts bearer tokens from authorization headers", () => {
    expect(extractBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(extractBearerToken("Basic abc")).toBeNull();
    expect(extractBearerToken(undefined)).toBeNull();
  });
});

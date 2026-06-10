import { SignJWT, jwtVerify } from "jose";
import { config } from "../config";
import type { AuthSession, UserRole } from "../types";

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

function getSessionSecret(): Uint8Array {
  return new TextEncoder().encode(config.sessionSecret);
}

export async function createSessionToken(
  userId: string,
  email: string,
  role: UserRole,
): Promise<string> {
  return new SignJWT({ role, sub: userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const role = payload.role;
    if (
      (role !== "admin" && role !== "user") ||
      typeof payload.sub !== "string"
    ) {
      return null;
    }

    const email =
      typeof payload.email === "string" ? payload.email : "admin@localhost";

    return { role, sub: payload.sub, email };
  } catch {
    return null;
  }
}

export function extractBearerToken(
  authorizationHeader?: string,
): string | null {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token || null;
}

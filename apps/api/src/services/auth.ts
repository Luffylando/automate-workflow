import { SignJWT, jwtVerify } from "jose";
import { config } from "../config";
import type { AdminSession } from "../types";

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

function getSessionSecret(): Uint8Array {
  return new TextEncoder().encode(config.sessionSecret);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin", sub: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    if (payload.role !== "admin") {
      return null;
    }
    return { role: "admin", sub: String(payload.sub ?? "admin") };
  } catch {
    return null;
  }
}

export function verifyAdminPassword(password: string): boolean {
  return password === config.adminPassword;
}

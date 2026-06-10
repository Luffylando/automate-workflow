import { NextResponse } from "next/server";
import {
  createSession,
  getAdminPassword,
  sessionCookieOptions,
} from "@/lib/auth";
import { jsonError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password?.trim();

    if (!password) {
      return jsonError("Password is required", 400);
    }

    if (password !== getAdminPassword()) {
      return jsonError("Invalid credentials", 401);
    }

    const token = await createSession();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";
    return jsonError(message, 500);
  }
}

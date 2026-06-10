import { jsonError } from "@/lib/api";
import { listUsers } from "@/lib/users";

export async function GET() {
  try {
    const users = await listUsers();
    return Response.json({ users });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch users";
    return jsonError(message, 500);
  }
}

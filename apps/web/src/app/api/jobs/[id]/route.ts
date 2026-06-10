import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { getJob } from "@/lib/jobs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const job = await getJob(id);

    if (!job) {
      return jsonError("Job not found", 404);
    }

    return Response.json(job);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    const message =
      error instanceof Error ? error.message : "Failed to fetch job";
    return jsonError(message, 500);
  }
}

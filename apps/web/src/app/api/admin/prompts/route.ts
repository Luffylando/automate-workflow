import { after, NextResponse } from "next/server";
import { processJob } from "@/lib/agent-runner";
import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { createJob } from "@/lib/jobs";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = (await request.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return jsonError("Prompt is required", 400);
    }

    if (prompt.length > 4000) {
      return jsonError("Prompt must be 4000 characters or fewer", 400);
    }

    const rateLimit = checkRateLimit(session.sub);
    if (!rateLimit.allowed) {
      return jsonError(
        `Rate limit exceeded. Try again in ${rateLimit.retryAfterSeconds}s.`,
        429,
      );
    }

    const job = await createJob(prompt);

    after(() => {
      void processJob(job.id);
    });

    return NextResponse.json({ jobId: job.id, status: job.status });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    const message =
      error instanceof Error ? error.message : "Failed to create job";
    return jsonError(message, 500);
  }
}

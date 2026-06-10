const PROMPTS_PER_HOUR = 5;
const WINDOW_MS = 60 * 60 * 1000;

const promptTimestamps = new Map<string, number[]>();

export function checkRateLimit(adminId: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const recent = (promptTimestamps.get(adminId) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );

  if (recent.length >= PROMPTS_PER_HOUR) {
    const oldest = recent[0];
    const retryAfterSeconds = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  recent.push(now);
  promptTimestamps.set(adminId, recent);
  return { allowed: true };
}

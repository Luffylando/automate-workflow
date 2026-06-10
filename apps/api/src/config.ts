function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function resolveSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    if (!secret || secret.length < 32) {
      throw new Error(
        "SESSION_SECRET must be set to at least 32 characters in production",
      );
    }
    return secret;
  }

  return secret ?? "dev-session-secret-change-me";
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? "0.0.0.0",
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://automate:automate@localhost:5432/automate_workflow",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@localhost",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin123",
  sessionSecret: resolveSessionSecret(),
  cursorApiKey: process.env.CURSOR_API_KEY ?? "",
  githubRepoUrl: process.env.GITHUB_REPO_URL ?? "",
  cursorModel: process.env.CURSOR_MODEL ?? "composer-2.5",
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  isProduction: process.env.NODE_ENV === "production",
};

export function requireCursorConfig(): {
  apiKey: string;
  repoUrl: string;
  model: string;
} {
  return {
    apiKey: requireEnv("CURSOR_API_KEY"),
    repoUrl: requireEnv("GITHUB_REPO_URL"),
    model: config.cursorModel,
  };
}

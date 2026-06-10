function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? "0.0.0.0",
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://automate:automate@localhost:5432/automate_workflow",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin123",
  sessionSecret: process.env.SESSION_SECRET ?? "dev-session-secret-change-me",
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

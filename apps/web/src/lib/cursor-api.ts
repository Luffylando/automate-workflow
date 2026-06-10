const CURSOR_API_BASE = "https://api.cursor.com";

export type CursorRunStatus =
  | "CREATING"
  | "RUNNING"
  | "FINISHED"
  | "ERROR"
  | "CANCELLED"
  | "EXPIRED";

export interface CursorGitBranch {
  repoUrl: string;
  branch?: string;
  prUrl?: string;
}

export interface CursorRun {
  id: string;
  agentId: string;
  status: CursorRunStatus;
  createdAt: string;
  updatedAt: string;
  durationMs?: number;
  result?: string;
  git?: {
    branches: CursorGitBranch[];
  };
}

interface CreateAgentResponse {
  agent: { id: string };
  run: { id: string };
}

function getCursorApiKey(): string {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("CURSOR_API_KEY is not configured");
  }
  return apiKey;
}

function getAuthHeader(): string {
  const apiKey = getCursorApiKey();
  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}

async function cursorRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${CURSOR_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Cursor API ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

export function getGithubRepoUrl(): string {
  const repoUrl = process.env.GITHUB_REPO_URL?.trim();
  if (!repoUrl) {
    throw new Error("GITHUB_REPO_URL is not configured");
  }
  return repoUrl;
}

export function buildAgentPrompt(userPrompt: string): string {
  return `You are modifying the automate-workflow monorepo on GitHub.

User request:
${userPrompt}

Requirements:
- Update apps/web and add apps/api or packages/ as needed
- Follow AGENTS.md at the repository root
- Add or update tests when behavior changes
- Do not commit secrets or credentials
- Ensure pnpm build passes from the repo root
`;
}

export async function createCloudAgent(prompt: string): Promise<{
  agentId: string;
  runId: string;
}> {
  const modelId = process.env.CURSOR_MODEL?.trim() || "composer-2.5";
  const repoUrl = getGithubRepoUrl();

  const response = await cursorRequest<CreateAgentResponse>("/v1/agents", {
    method: "POST",
    body: JSON.stringify({
      prompt: { text: buildAgentPrompt(prompt) },
      model: { id: modelId },
      repos: [{ url: repoUrl }],
      autoCreatePR: true,
      skipReviewerRequest: true,
    }),
  });

  return {
    agentId: response.agent.id,
    runId: response.run.id,
  };
}

export async function getRun(
  agentId: string,
  runId: string,
): Promise<CursorRun> {
  return cursorRequest<CursorRun>(`/v1/agents/${agentId}/runs/${runId}`);
}

const TERMINAL_STATUSES = new Set<CursorRunStatus>([
  "FINISHED",
  "ERROR",
  "CANCELLED",
  "EXPIRED",
]);

export async function waitForRun(
  agentId: string,
  runId: string,
  options: { pollMs?: number; timeoutMs?: number } = {},
): Promise<CursorRun> {
  const pollMs = options.pollMs ?? 5000;
  const timeoutMs = options.timeoutMs ?? 30 * 60 * 1000;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const run = await getRun(agentId, runId);
    if (TERMINAL_STATUSES.has(run.status)) {
      return run;
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }

  throw new Error("Agent run timed out after 30 minutes");
}

export function extractPrUrl(run: CursorRun): string | undefined {
  return run.git?.branches?.find((branch) => branch.prUrl)?.prUrl;
}

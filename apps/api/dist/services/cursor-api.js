"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAgentPrompt = buildAgentPrompt;
exports.createCloudAgent = createCloudAgent;
exports.getRun = getRun;
exports.waitForRun = waitForRun;
exports.extractPrUrl = extractPrUrl;
const config_1 = require("../config");
const CURSOR_API_BASE = "https://api.cursor.com";
function getAuthHeader(apiKey) {
    return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}
async function cursorRequest(path, apiKey, options = {}) {
    const response = await fetch(`${CURSOR_API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: getAuthHeader(apiKey),
            ...options.headers,
        },
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Cursor API ${response.status}: ${body}`);
    }
    return response.json();
}
function buildAgentPrompt(userPrompt) {
    return `You are modifying the automate-workflow monorepo on GitHub.

User request:
${userPrompt}

Requirements:
- Update apps/web and apps/api as needed
- Follow AGENTS.md at the repository root
- Add or update tests when behavior changes
- Do not commit secrets or credentials
- Ensure pnpm build passes from the repo root
`;
}
async function createCloudAgent(prompt) {
    const { apiKey, repoUrl, model } = (0, config_1.requireCursorConfig)();
    const response = await cursorRequest("/v1/agents", apiKey, {
        method: "POST",
        body: JSON.stringify({
            prompt: { text: buildAgentPrompt(prompt) },
            model: { id: model },
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
async function getRun(agentId, runId) {
    const { apiKey } = (0, config_1.requireCursorConfig)();
    return cursorRequest(`/v1/agents/${agentId}/runs/${runId}`, apiKey);
}
const TERMINAL_STATUSES = new Set([
    "FINISHED",
    "ERROR",
    "CANCELLED",
    "EXPIRED",
]);
async function waitForRun(agentId, runId, options = {}) {
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
function extractPrUrl(run) {
    return run.git?.branches?.find((branch) => branch.prUrl)?.prUrl;
}

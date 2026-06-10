"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const github_1 = require("./github");
(0, vitest_1.describe)("github service", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.stubEnv("GITHUB_TOKEN", "ghp_test_token");
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.unstubAllEnvs();
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.describe)("parsePullRequestUrl", () => {
        (0, vitest_1.it)("parses a GitHub pull request URL", () => {
            (0, vitest_1.expect)((0, github_1.parsePullRequestUrl)("https://github.com/org/repo/pull/42")).toEqual({
                owner: "org",
                repo: "repo",
                number: 42,
            });
        });
        (0, vitest_1.it)("returns null for invalid URLs", () => {
            (0, vitest_1.expect)((0, github_1.parsePullRequestUrl)("https://example.com/pull/1")).toBeNull();
        });
    });
    (0, vitest_1.describe)("markPullRequestReady", () => {
        (0, vitest_1.it)("marks a draft pull request as ready", async () => {
            const fetchMock = vitest_1.vi.fn().mockResolvedValue({
                ok: true,
                text: async () => "",
            });
            vitest_1.vi.stubGlobal("fetch", fetchMock);
            const result = await (0, github_1.markPullRequestReady)("https://github.com/org/repo/pull/42");
            (0, vitest_1.expect)(result).toBe(true);
            (0, vitest_1.expect)(fetchMock).toHaveBeenCalledWith("https://api.github.com/repos/org/repo/pulls/42", vitest_1.expect.objectContaining({
                method: "PATCH",
                body: JSON.stringify({ draft: false }),
            }));
        });
        (0, vitest_1.it)("returns false when GITHUB_TOKEN is not configured", async () => {
            vitest_1.vi.stubEnv("GITHUB_TOKEN", "");
            const fetchMock = vitest_1.vi.fn();
            vitest_1.vi.stubGlobal("fetch", fetchMock);
            const result = await (0, github_1.markPullRequestReady)("https://github.com/org/repo/pull/42");
            (0, vitest_1.expect)(result).toBe(false);
            (0, vitest_1.expect)(fetchMock).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)("throws when GitHub rejects the request", async () => {
            const fetchMock = vitest_1.vi.fn().mockResolvedValue({
                ok: false,
                status: 403,
                text: async () => "Forbidden",
            });
            vitest_1.vi.stubGlobal("fetch", fetchMock);
            await (0, vitest_1.expect)((0, github_1.markPullRequestReady)("https://github.com/org/repo/pull/42")).rejects.toThrow("GitHub API 403: Forbidden");
        });
    });
});

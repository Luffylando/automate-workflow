import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { markPullRequestReady, parsePullRequestUrl } from "./github";

describe("github service", () => {
  beforeEach(() => {
    vi.stubEnv("GITHUB_TOKEN", "ghp_test_token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("parsePullRequestUrl", () => {
    it("parses a GitHub pull request URL", () => {
      expect(
        parsePullRequestUrl("https://github.com/org/repo/pull/42"),
      ).toEqual({
        owner: "org",
        repo: "repo",
        number: 42,
      });
    });

    it("returns null for invalid URLs", () => {
      expect(parsePullRequestUrl("https://example.com/pull/1")).toBeNull();
    });
  });

  describe("markPullRequestReady", () => {
    it("marks a draft pull request as ready", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "",
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await markPullRequestReady(
        "https://github.com/org/repo/pull/42",
      );

      expect(result).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.github.com/repos/org/repo/pulls/42",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ draft: false }),
        }),
      );
    });

    it("returns false when GITHUB_TOKEN is not configured", async () => {
      vi.stubEnv("GITHUB_TOKEN", "");
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      const result = await markPullRequestReady(
        "https://github.com/org/repo/pull/42",
      );

      expect(result).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("throws when GitHub rejects the request", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => "Forbidden",
      });
      vi.stubGlobal("fetch", fetchMock);

      await expect(
        markPullRequestReady("https://github.com/org/repo/pull/42"),
      ).rejects.toThrow("GitHub API 403: Forbidden");
    });
  });
});

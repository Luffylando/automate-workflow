"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePullRequestUrl = parsePullRequestUrl;
exports.markPullRequestReady = markPullRequestReady;
function parsePullRequestUrl(prUrl) {
    const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (!match) {
        return null;
    }
    return {
        owner: match[1],
        repo: match[2],
        number: Number(match[3]),
    };
}
async function markPullRequestReady(prUrl) {
    const token = process.env.GITHUB_TOKEN?.trim() ?? "";
    if (!token) {
        return false;
    }
    const parsed = parsePullRequestUrl(prUrl);
    if (!parsed) {
        throw new Error(`Invalid pull request URL: ${prUrl}`);
    }
    const response = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.number}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ draft: false }),
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`GitHub API ${response.status}: ${body}`);
    }
    return true;
}

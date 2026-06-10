# Automate Workflow

Prompt-driven full-stack platform. Admins describe features in natural language; a Cursor Cloud Agent modifies the GitHub repo and opens a pull request.

## Current status

| Phase | Status |
|-------|--------|
| 1 — Admin prompt UI + job tracking | Done |
| 2 — Cursor Cloud Agent API → PR | Done |
| 3+ — User stories (users, styling, DB) | Next |

## Quick start

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local — set CURSOR_API_KEY and GITHUB_REPO_URL for Phase 2
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), sign in at `/login`, and submit a prompt from the admin console.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | Yes | Admin sign-in password |
| `SESSION_SECRET` | Yes | JWT signing secret (32+ chars) |
| `CURSOR_API_KEY` | Phase 2+ | From [Cursor Dashboard → Integrations](https://cursor.com/dashboard/integrations) |
| `GITHUB_REPO_URL` | Phase 2+ | Full GitHub URL, e.g. `https://github.com/org/automate-workflow` |
| `CURSOR_MODEL` | No | Defaults to `composer-2.5` |

The GitHub repo must be connected to Cursor (Dashboard → Cloud Agents → Repositories).

## How it works

1. Admin submits a prompt → job created (`queued`)
2. Background worker calls the [Cursor Cloud Agents API](https://cursor.com/docs/cloud-agent/api/endpoints) against `GITHUB_REPO_URL`
3. Agent edits code per `AGENTS.md` and opens a PR (`autoCreatePR`)
4. Job updates to `done` with PR link, or `failed` with error
5. Merge the PR → deploy picks up changes

## API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | Public | Admin sign-in |
| `/api/auth/logout` | POST | Public | Clear session |
| `/api/auth/me` | GET | Public | Current session |
| `/api/admin/prompts` | POST | Admin | Submit prompt → `{ jobId }` |
| `/api/jobs/:id` | GET | Admin | Poll job status |

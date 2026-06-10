# Agent instructions — automate-workflow

You are modifying the **automate-workflow** monorepo. Follow these rules on every change.

## Repository layout

```
automate-workflow/
├── apps/web/          # Next.js frontend + API routes (App Router)
├── packages/shared/   # Shared types (create when needed)
├── infra/             # Docker, migrations (create when needed)
└── AGENTS.md          # This file
```

## Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **API:** Next.js route handlers under `apps/web/src/app/api/`
- **Package manager:** pnpm workspaces

## Coding rules

1. Keep changes minimal and focused on the user request.
2. Match existing naming, file structure, and patterns in the repo.
3. Put new API routes in `apps/web/src/app/api/`.
4. Put reusable logic in `apps/web/src/lib/`.
5. Put UI components in `apps/web/src/components/`.
6. Never commit secrets (`.env`, API keys, passwords).
7. Add or update tests when behavior changes meaningfully.
8. Run `pnpm build` from the repo root before finishing.

## Backend features

When the user asks for a new resource (users, todos, etc.):

1. Define TypeScript types in `apps/web/src/lib/` or `packages/shared/`.
2. Add API routes under `apps/web/src/app/api/<resource>/`.
3. Start with in-memory or file storage if no database exists yet.
4. Wire the frontend to call the new APIs.

## Pull request

Summarize what changed, which files were touched, and how to verify locally (`pnpm dev`).

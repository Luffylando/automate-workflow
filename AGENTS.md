# Agent instructions — automate-workflow

You are modifying the **automate-workflow** monorepo. Follow these rules on every change.

## Repository layout

```
automate-workflow/
├── apps/web/          # Next.js frontend
├── apps/api/          # Fastify backend + TypeORM + PostgreSQL
├── docker-compose.yml # Local Postgres
└── AGENTS.md          # This file
```

## Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Fastify, TypeORM, PostgreSQL
- **Package manager:** pnpm workspaces

## Coding rules

1. Keep changes minimal and focused on the user request.
2. Match existing naming, file structure, and patterns in the repo.
3. Put API routes in `apps/api/src/routes/`.
4. Put business logic in `apps/api/src/services/`.
5. Put TypeORM entities in `apps/api/src/db/entities/`.
6. Put UI components in `apps/web/src/components/`.
7. Never commit secrets (`.env`, API keys, passwords).
8. Add or update tests when behavior changes meaningfully.
9. Run `pnpm verify` from the repo root before finishing (build, test, and dev smoke).
10. CI runs the same checks on push/PR via `.github/workflows/ci.yml`.

## Backend features

When the user asks for a new resource (users, todos, etc.):

1. Add a TypeORM entity in `apps/api/src/db/entities/`.
2. Add service functions in `apps/api/src/services/`.
3. Expose routes in `apps/api/src/routes/`.
4. Wire the frontend to call `/api/<resource>` (proxied to Fastify).

## Pull request

Summarize what changed, which files were touched, and how to verify locally (`pnpm dev`).

# Automate Workflow

Prompt-driven full-stack platform. Admins describe features in natural language; a Cursor Cloud Agent modifies the GitHub repo and opens a pull request.

## Architecture

| App | Role | Port |
|-----|------|------|
| `apps/web` | Next.js frontend | 3000 |
| `apps/api` | Fastify + TypeORM + PostgreSQL | 3001 |
| `postgres` | Database (Docker) | 5432 |

The frontend proxies `/api/*` to the Fastify backend.

## Quick start

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Edit apps/api/.env — admin password, session secret, Cursor + GitHub vars
pnpm dev
```

This starts Postgres, the API, and the web app.

Open [http://localhost:3000](http://localhost:3000), sign in at `/login`, and submit a prompt from the admin console.

## Environment variables

### `apps/api/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `ADMIN_PASSWORD` | Yes | Admin sign-in password |
| `SESSION_SECRET` | Yes | JWT signing secret (32+ chars) |
| `CURSOR_API_KEY` | For agents | From [Cursor Dashboard → Integrations](https://cursor.com/dashboard/integrations) |
| `GITHUB_REPO_URL` | For agents | Full GitHub URL |
| `CURSOR_MODEL` | No | Defaults to `composer-2.5` |
| `PORT` | No | Defaults to `3001` |

### `apps/web/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `API_URL` | No | Defaults to `http://localhost:3001` |

## API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | Public | Admin sign-in |
| `/api/auth/logout` | POST | Public | Clear session |
| `/api/auth/me` | GET | Public | Current session |
| `/api/todos` | GET | Public | List todos from Postgres |
| `/api/todos` | POST | Public | Create a todo |
| `/api/todos/:id` | GET | Public | Get a todo |
| `/api/todos/:id` | PATCH | Public | Update a todo |
| `/api/todos/:id` | DELETE | Public | Delete a todo |
| `/api/admin/prompts` | POST | Admin | Submit prompt → `{ jobId }` |
| `/api/jobs/:id` | GET | Admin | Poll job status |

## Database

Todos and jobs are stored in PostgreSQL via TypeORM.

```bash
pnpm db:up    # start Postgres
pnpm db:down  # stop Postgres
```

Default local connection:

```
postgresql://automate:automate@localhost:5432/automate_workflow
```

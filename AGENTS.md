# AGENTS.md — Tokō

Guidance for AI coding agents working in this repository. Human-facing
product/design rules live in `CLAUDE.md`; read it too — its ADHD-audience
design principles are binding.

## Project

Tokō is an ADHD-child management web app for French-speaking parents.
pnpm + Turborepo monorepo: React 19 SPA (`apps/web`), Hono API (`apps/api`),
a stdio MCP server (`apps/mcp`), shared Drizzle schema (`packages/db`) and
shared Zod validators (`packages/validators`).

## Setup & commands

```bash
pnpm install          # install workspace deps
pnpm dev              # run API + web
pnpm build            # build everything
pnpm typecheck        # type-check all packages — run before committing
pnpm test             # Vitest unit tests
pnpm lint             # lint
pnpm db:generate      # generate a Drizzle migration after a schema change
```

## Conventions

- **Language:** all parent-facing UI text is in French. The `/developers`
  page is also French (it targets the French-speaking parent).
- **Validation:** Zod schemas in `packages/validators/src/`, shared by API
  routes and the web forms.
- **DB:** Drizzle tables in `packages/db/src/schema/`, one file per domain.
  After editing a schema, run `pnpm db:generate` and commit the SQL.
- **Ownership:** every child-scoped query must be filtered by the owning
  parent — never trust an id from the request alone.
- **API routes:** Hono handlers in `apps/api/src/routes/`, validated with a
  Zod schema, returning 422 on invalid input.
- Run `pnpm typecheck` before committing.

## Agent access (runtime)

Parents can connect their own AI assistant to Tokō through the MCP server
in `apps/mcp`. It authenticates with an agent access key (`toko_sk_…`) the
parent issues from the `/developers` page.

These keys are **read-only** and confined to an endpoint allowlist defined
in `apps/api/src/lib/agent-access.ts`. When adding a new API route, it is
unreachable by agent keys until explicitly added to that allowlist — keep
the allowlist, the OpenAPI document (`apps/api/src/lib/openapi-spec.ts`) and
the MCP tools (`apps/mcp/src/index.ts`) in sync.

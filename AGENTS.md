# AGENTS.md — Tokō

Guidance for AI coding agents working in this repository. Everything below
applies to any coding agent (Claude Code, Codex, Copilot…) that touches this
repo. The ADHD-audience design principles below are binding.

## Communication Style

Think in big pictures, answer in few words. Skip filler, context restatement, and over-explanation.

## Project

Tokō is an ADHD-child management web app for French-speaking parents.
pnpm + Turborepo monorepo: React 19 SPA (`apps/web`), Hono API (`apps/api`),
a stdio MCP server (`apps/mcp`), a read-only CLI (`apps/cli`), shared Drizzle
schema (`packages/db`) and shared Zod validators (`packages/validators`).

| Package | Chemin | Rôle |
|---------|--------|------|
| `@focusflow/web` | `apps/web` | Frontend React 19 + TanStack Router + Tailwind |
| `@focusflow/api` | `apps/api` | API Hono + Better Auth + Stripe |
| `@focusflow/db` | `packages/db` | Schéma Drizzle ORM + migrations PostgreSQL |
| `@focusflow/validators` | `packages/validators` | Schémas Zod partagés frontend/backend |

Dépendances : `web` → `validators`, `api` → `db` + `validators`

## Audience & Design Principles

**Tokō est conçu pour des parents atteints de TDAH qui gèrent des enfants atteints de TDAH.** Les utilisateurs et les personnes dont ils s'occupent vivent avec un trouble du déficit de l'attention. Cela impose une exigence non négociable sur chaque décision de design, de produit et de code lié à l'UI :

- **Simplicité maximale** : chaque écran, formulaire, dialogue et message doit être le plus simple et compréhensible possible. En cas de doute, retirer plutôt qu'ajouter.
- **Charge cognitive minimale** : une seule action principale par écran. Pas de jargon, pas d'options superflues, pas de paramètres cachés derrière plusieurs niveaux de menus.
- **Lisibilité immédiate** : phrases courtes, vocabulaire courant, hiérarchie visuelle claire (titres, espacement, contraste). Préférer les libellés explicites aux icônes seules.
- **Étapes courtes** : découper les flux longs en petites étapes prévisibles, avec un état clairement visible (où je suis, ce qu'il reste à faire).
- **Tolérance aux erreurs** : confirmations explicites pour les actions destructrices, possibilité d'annuler, messages d'erreur en langage humain qui expliquent quoi faire ensuite.
- **Cohérence** : mêmes patterns d'interaction partout (boutons, formulaires, navigation) pour éviter la surcharge d'apprentissage.
- **Pas de surprises** : éviter les animations agressives, les notifications intrusives, les changements de mise en page imprévus.

Ces principes priment sur l'esthétique, l'exhaustivité fonctionnelle et la densité d'information. Si une fonctionnalité ne peut pas être présentée simplement, la repenser plutôt que d'ajouter de la complexité visible.

## Tech Stack

- **Frontend:** React 19, TypeScript 5.7, Vite 6, TailwindCSS 4, TanStack Router (file-based), TanStack React Query, Zustand, shadcn/ui components, Recharts
- **Backend:** Node.js 22, Hono 4, Better Auth 1.5, Drizzle ORM 0.45, Stripe
- **Database:** PostgreSQL 16 with Drizzle ORM migrations
- **Validation:** Zod (shared between frontend and backend via @focusflow/validators)
- **Tests:** Vitest (unit), Playwright (E2E)
- **Build:** pnpm 9.15, Turborepo, Docker multi-stage

## Project Structure

```
toko/
├── apps/
│   ├── api/              # Hono backend API
│   │   └── src/
│   │       ├── index.ts          # Server entrypoint (serves frontend in prod)
│   │       ├── app.ts            # Hono app with middleware
│   │       ├── routes/           # Route handlers (children, symptoms, medications, journal, appointments, barkley, billing, stats, report, account)
│   │       ├── middleware/       # Auth middleware, error handler
│   │       └── lib/              # Auth config, Stripe client
│   └── web/              # React frontend (SPA)
│       └── src/
│           ├── routes/           # TanStack Router file-based routes
│           ├── components/       # UI components (ui/ = shadcn, feature-specific)
│           ├── hooks/            # React Query custom hooks per feature
│           ├── stores/           # Zustand stores (ui-store)
│           └── lib/              # API client, auth client, query client, utils
├── packages/
│   ├── db/               # @focusflow/db — Drizzle schema, migrations, seed
│   │   ├── src/schema/           # Table definitions (children, symptoms, medication, journal, appointments, barkley, subscriptions)
│   │   └── drizzle/              # SQL migration files
│   └── validators/       # @focusflow/validators — Zod schemas shared FE/BE
│       └── src/                  # One file per domain (child, symptom, medication, journal, appointment, barkley, account)
├── e2e/                  # Playwright E2E tests
├── .github/workflows/    # CI (ci.yml) and Release (release.yml)
├── deploy/               # Production deploy script
├── compose.yml           # Production Docker Compose (app + Postgres + Traefik)
├── compose.local.yml     # Local dev Postgres only
└── Dockerfile            # Multi-stage Docker build
```

## Commands

```bash
# Development
pnpm install              # Install all dependencies
pnpm dev                  # Start all services (API + Web via Turborepo)
pnpm build                # Build all packages and apps
pnpm test                 # Run unit tests (Vitest)
pnpm lint                 # Lint all packages
pnpm typecheck            # Type-check all packages — run before committing

# Database
pnpm db:generate          # Generate Drizzle migrations from schema changes
pnpm db:migrate           # Run pending migrations

# E2E Tests
pnpm test:e2e             # Run Playwright tests
pnpm test:e2e:ui          # Run Playwright with UI mode

# Docker / Release
pnpm docker:build         # Build Docker image
pnpm release              # Build + Docker build + tag + push
pnpm version:patch        # Bump patch version across all packages
pnpm version:minor        # Bump minor version across all packages

# Local Postgres
docker compose -f compose.local.yml up -d
```

## Code Conventions

- **Language:** All user-facing text is in French. The `/developers` page is
  also French (it targets the French-speaking parent).
- **Routing:** TanStack Router file-based routing in `apps/web/src/routes/`
- **State:** Zustand for UI state (sidebar, active child), React Query for server state
- **API client:** Fetch-based REST client in `apps/web/src/lib/api-client.ts`
- **Auth:** Better Auth with session cookies, middleware in `apps/api/src/middleware/auth.ts`
- **Validation:** Always Zod schemas in `packages/validators/src/`, used by both API routes and frontend forms
- **DB schema:** Drizzle tables in `packages/db/src/schema/`, one file per domain.
  One migration per change: after editing a schema, run `pnpm db:generate` and
  commit the SQL.
- **API routes:** Hono handlers in `apps/api/src/routes/`, one file per domain,
  validated with a Zod schema, returning 422 on invalid input.
- **Ownership:** Child data is shared through `child_access` (roles `owner` /
  `co_parent`) — every child-scoped query must verify access with
  `assertChildAccess(userId, childId)` from `apps/api/src/lib/child-access.ts`
  (`assertChildOwner` for owner-only actions, `listAccessibleChildIds` for
  lists); never trust an id from the request alone.
- **Components:** shadcn/ui style components in `apps/web/src/components/ui/`
- **Feature hooks:** One file per domain in `apps/web/src/hooks/` (e.g., `use-symptoms.ts`)
- **Route protection:** `_authenticated.tsx` layout with `beforeLoad` session check
- **Error handling:** Centralized `AppError` class in API, Zod validation returns 422

## Agent access (runtime)

Parents can connect their own AI assistant to Tokō through the MCP server
(`apps/mcp`, for shell-less chat assistants) or the `toko` CLI (`apps/cli`,
for terminal/coding agents). Both authenticate with an agent access key
(`toko_sk_…`) the parent issues from the `/developers` page.

These keys are **read-only** and confined to an endpoint allowlist defined
in `apps/api/src/lib/agent-access.ts`. When adding a new API route, it is
unreachable by agent keys until explicitly added to that allowlist — keep
the allowlist, the OpenAPI document (`apps/api/src/lib/openapi-spec.ts`), the
MCP tools (`apps/mcp/src/index.ts`) and the CLI commands
(`apps/cli/src/index.ts`) in sync.

## Git Workflow

- **Branch:** feature branches merged to `main`
- **Commit style:** Conventional Commits (`feat:`, `fix:`, `chore:`, `feat!:`)
- **CI:** Runs typecheck + tests + secret leak scan on every PR/push to main
- **Release:** Automatic on push to main — version bump, Docker build, deploy
- Run `pnpm typecheck` before committing.

### Development Workflow

1. Créer une branche feature depuis `main`
2. Développer avec `pnpm dev`
3. Ajouter les schémas Zod si nouvelle entité
4. Ajouter/modifier le schéma Drizzle + générer la migration
5. Vérifier : `pnpm typecheck && pnpm test`
6. Commit conventionnel, push, ouvrir une PR vers `main`
7. Le CI vérifie le typage, les tests et les fuites de secrets
8. Après merge : release automatique (version bump + Docker + deploy)

## Important Notes

- The API serves the built frontend in production (single container)
- Migrations run automatically at API startup via `@focusflow/db` `migrate()`
- Internal packages (`@focusflow/db`, `@focusflow/validators`) are not pre-built — tsx transpiles at runtime
- Ne jamais commiter de secrets dans le frontend (le CI vérifie)
- Environment variables: see `.env.example` for required configuration
- Demo account: `demo@toko.app` / `demo1234` (used in E2E tests)

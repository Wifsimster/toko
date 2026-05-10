# Tokō — Claude Code Instructions

## Project Overview

Tokō is an ADHD child management web application for French-speaking parents. It's a pnpm + Turborepo monorepo with a React frontend, Hono API backend, shared Drizzle ORM database package, and shared Zod validators.

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

## Useful Commands

```bash
# Development
pnpm install              # Install all dependencies
pnpm dev                  # Start all services (API + Web via Turborepo)
pnpm build                # Build all packages and apps
pnpm test                 # Run unit tests (Vitest)
pnpm lint                 # Lint all packages
pnpm typecheck            # Type-check all packages

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

- **Language:** All user-facing text is in French
- **Routing:** TanStack Router file-based routing in `apps/web/src/routes/`
- **State:** Zustand for UI state (sidebar, active child), React Query for server state
- **API client:** Fetch-based REST client in `apps/web/src/lib/api-client.ts`
- **Auth:** Better Auth with session cookies, middleware in `apps/api/src/middleware/auth.ts`
- **Validation:** Zod schemas in `packages/validators/src/`, used by both API routes and frontend forms
- **DB schema:** Drizzle tables in `packages/db/src/schema/`, one file per domain
- **Components:** shadcn/ui style components in `apps/web/src/components/ui/`
- **Feature hooks:** One file per domain in `apps/web/src/hooks/` (e.g., `use-symptoms.ts`)
- **Route protection:** `_authenticated.tsx` layout with `beforeLoad` session check
- **Error handling:** Centralized `AppError` class in API, Zod validation returns 422

## Git Workflow

- **Branch:** feature branches merged to `main`
- **Commit style:** Conventional Commits (`feat:`, `fix:`, `chore:`, `feat!:`)
- **CI:** Runs typecheck + tests + secret leak scan on every PR/push to main
- **Release:** Automatic on push to main — version bump, Docker build, deploy

## Important Notes

- The API serves the built frontend in production (single container)
- Migrations run automatically at API startup via `@focusflow/db` `migrate()`
- All child data is scoped by `parentId` — always verify user ownership in queries
- Internal packages (`@focusflow/db`, `@focusflow/validators`) are not pre-built — tsx transpiles at runtime
- Environment variables: see `.env.example` for required configuration
- Demo account: `demo@toko.app` / `demo1234` (used in E2E tests)

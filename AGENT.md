# Tokō — Agent Instructions

## Project Summary

Tokō est une application web de suivi TDAH pour les parents. Monorepo pnpm + Turborepo avec frontend React, API Hono, base PostgreSQL via Drizzle ORM et schémas Zod partagés.

## Monorepo Structure

| Package | Chemin | Rôle |
|---------|--------|------|
| `@focusflow/web` | `apps/web` | Frontend React 19 + TanStack Router + Tailwind |
| `@focusflow/api` | `apps/api` | API Hono + Better Auth + Stripe |
| `@focusflow/db` | `packages/db` | Schéma Drizzle ORM + migrations PostgreSQL |
| `@focusflow/validators` | `packages/validators` | Schémas Zod partagés frontend/backend |

Dépendances : `web` → `validators`, `api` → `db` + `validators`

## Essential Commands

```bash
pnpm install                  # Install dependencies
pnpm dev                      # Start dev (API + Web)
pnpm build                    # Build all
pnpm test                     # Unit tests (Vitest)
pnpm typecheck                # Type-check all packages
pnpm db:generate              # Generate migrations after schema change
pnpm db:migrate               # Run migrations
pnpm test:e2e                 # E2E tests (Playwright)
docker compose -f compose.local.yml up -d  # Start local Postgres
```

## Code Conventions

- **Langue :** Tout texte utilisateur en français
- **Commits :** Conventional Commits (`feat:`, `fix:`, `chore:`)
- **Validation :** Toujours via Zod dans `packages/validators`
- **DB :** Schéma Drizzle dans `packages/db/src/schema/`, une migration par changement
- **Routes API :** Un fichier par domaine dans `apps/api/src/routes/`
- **Routes Web :** File-based routing TanStack Router dans `apps/web/src/routes/`
- **Hooks :** Un fichier par domaine dans `apps/web/src/hooks/`
- **Components UI :** Style shadcn/ui dans `apps/web/src/components/ui/`
- **Sécurité :** Toujours vérifier `parentId === user.id` dans les requêtes enfant

## Development Workflow

1. Créer une branche feature depuis `main`
2. Développer avec `pnpm dev`
3. Ajouter les schémas Zod si nouvelle entité
4. Ajouter/modifier le schéma Drizzle + générer la migration
5. Vérifier : `pnpm typecheck && pnpm test`
6. Commit conventionnel, push, ouvrir une PR vers `main`
7. Le CI vérifie le typage, les tests et les fuites de secrets
8. Après merge : release automatique (version bump + Docker + deploy)

## Important Notes

- Les packages internes ne sont pas pré-build : tsx transpile au runtime
- Les migrations s'exécutent automatiquement au démarrage de l'API
- En production, l'API sert le frontend buildé (conteneur unique)
- Ne jamais commiter de secrets dans le frontend (le CI vérifie)
- Compte démo E2E : `demo@toko.app` / `demo1234`
- Variables d'environnement : voir `.env.example`

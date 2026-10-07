# Tokō verification map

This directory is the maintained source for verifying what a parent sees in the Tokō web app. Read this index before you drive the app, then use the matching feature file as the recipe. Every file uses `C=.claude/skills/verify/scripts/control-toko.mjs`.

Scope: `apps/web` and `apps/api`. The Expo client (`apps/mobile`), the MCP server and the CLI are out of scope.

## Baseline preconditions

- `$C launch` returned `"ok": true`, and `$C doctor` exits 0.
- The database is the throwaway `toko-verify-pg` container. It holds:
  - the seeded parent `demo@toko.app` / `demo1234` ("Parent Démo"), with an active subscription row
  - two synthetic children: Lucas (6-8) and Emma (0-5)
  - 21 days of fake symptoms, journal, Barkley and crisis-list data
  - a symptom reading for today on the seeded children
- The rate limiter is bypassed unless the run used `launch --rate-limit on`.
- No third party is reachable with a working key: Stripe and Google are fake, and Resend, VAPID and Koe are empty.
- Never drive an instance that this run did not start.

## Driving conventions

- Run `$C login` first. Parent pages redirect to `/login` without a session.
- Every page is scoped to the active child, which is picked in the sidebar combobox. `symptom` and `journal` take `--child <name>`.
- Prefer ARIA roles and accessible names over CSS. UI strings are French and hard-coded in `apps/web/src`. `$C snapshot --selector "[role=dialog]"` shows only an open dialog.
- Child data is synthetic only. Use the seeded children or names like "Pilote Fictif".
- Run `--dry-run` first on anything that writes when you only need the plan.

## Proof and skip reporting

- Capture the user action and the resulting state: the before/after screenshots and the HTTP response, not only the final screen.
- Every mutation needs a second, read-only view: `$C db "select ..."` and/or `$C api /api/...` or the page that lists it.
- Record the feature file and the entry point with every artifact. Evidence lives in `$TOKO_EVIDENCE_DIR/<runId>/`, with every command's JSON in `transcript.txt`.
- For an entry point you could not reach, report the command you tried and the unmet precondition. Never report it as verified through another path.

## Feature entry contract

Each feature file has an H1 and one paragraph, then exactly four H2s in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-toko` (opens with `Preconditions:`), `Gotchas`.

## Features

- [Sign-in and session](./auth.md): `/login` with e-mail and password, the session guard, and sign-out. Driven on `a77b544`.
- [Children](./children.md): adding a child (name, age range, RGPD consent), the sidebar selector, and name encryption at rest. Driven on `a77b544`.
- [Daily symptoms](./symptoms.md): the "Nouveau relevé" dialog in create and update modes. Driven on `a77b544`.
- [Journal](./journal.md): writing an entry with tags, and the list on `/journal`. Driven on `a77b544`.
- [Consultation report](./report.md): `/report`, the period picker and the document preview. The preview was checked against entered data on `a77b544`. PDF and e-mail are not scripted.
- [Billing](./billing.md): **not drivable** with fake Stripe keys. The file documents why and what would unlock it.

## Not scripted yet

These routes exist under `apps/web/src/routes/_authenticated/`. Reach them with `$C goto <path>`, `$C snapshot` and the generic `click`/`fill`. Add a feature file the first time you prove one.

- `/dashboard`: the time-of-day greeting, parent mood buttons, the "Suivi rapide" evening note, and trend cards
- `/suivi`, `/insights`: tracking hub and trends
- `/barkley`, `/barkley/formation`, `/rewards`: Barkley program and reward board
- `/routines`, `/timer`, `/crisis-list`, `/medications`
- `/connaissances`, `/lexique`, `/nouveautes`: articles, glossary, release notes
- `/account`: profile, co-parent invitations (`/invite/$token`), agent keys on `/developers`
- `/admin-analytics`, `/admin-settings`, `/admin-users`: these need `user.is_admin = true`, which the demo parent does not have
- public pages: `/`, `/tarifs`, `/ressources`, `/quiz`, `/formation`, and the legal pages

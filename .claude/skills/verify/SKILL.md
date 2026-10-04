---
name: verify
description: Launch and drive Tokō (React SPA + Hono API) like a parent, on a throwaway Postgres with the seeded synthetic demo account. Captures proof (screenshots, ARIA snapshots, API responses, DB rows, console/network logs). Use to prove any web or API change, or to reproduce a bug, before claiming it works. Expo mobile is out of scope.
---

# Verify Tokō

This skill covers the web app (`apps/web`) and the API (`apps/api`), the surfaces a parent uses in a browser. The Expo client (`apps/mobile`), the MCP server (`apps/mcp`) and the CLI (`apps/cli`) are out of scope. A mobile-width screenshot (`screenshot --mobile`) shows the responsive web layout, not the Expo app.

Everything goes through one CLI, `control-toko`. Each call prints one JSON object (`ok`, data, and on failure `error` + `fix`). Run it from the repo root:

```bash
C=.claude/skills/verify/scripts/control-toko.mjs
$C --help              # command groups
$C <command> --help    # flags, side effects, what it proves
```

Prerequisites:

- Docker and Node 22.
- Dependencies for the API and the web app (no Expo):

  ```bash
  pnpm install --frozen-lockfile --filter '@focusflow/api...' --filter '@focusflow/web...' --filter toko
  pnpm exec playwright install chromium-headless-shell
  ```

## Launch

```bash
export TOKO_EVIDENCE_DIR=/somewhere/outside/the/checkout   # recommended (see Evidence)
$C launch --dry-run    # plan only; touches nothing
$C launch              # about 7 s
```

`launch` does the following, in order:

1. It starts the container `toko-verify-pg`: `postgres:16-alpine` on tmpfs, `127.0.0.1:38632`, labelled `toko-verify=1`. The data dies with the container.
2. It starts the API from source (`node --import tsx src/index.ts`) on `:38601` with `NODE_ENV=development`. Startup runs the migrations, then `seedDemoUser()` creates `demo@toko.app` / `demo1234` with two synthetic children (Lucas 6-8, Emma 0-5) and 21 days of fake records. The env is a whitelist:
   - fresh random `DB_ENCRYPTION_KEY` and `BETTER_AUTH_SECRET` on every launch
   - fake Stripe and Google values that satisfy `lib/env.ts`
   - Resend, VAPID, Koe and cron empty
   - no `.env` file is read
3. It starts the Vite dev server for `apps/web` on `:38602`, through a generated config (`apps/web/.verify-run.vite.config.mjs`, gitignored). The config proxies `/api` to `:38601`, so the browser sees one origin, as in production.
4. It starts a headless Chromium daemon on CDP `:38622` (`fr-FR`, `Europe/Paris`, service workers blocked so the PWA cache cannot answer for the API). The daemon records console messages and HTTP traffic to JSONL.

`launch` is ready when it returns `"ok": true`.

The rate limiter is bypassed by default (`RATE_LIMIT_BYPASS=1`, as CI e2e does). The API allows 120 requests/min per signed-in parent, 600 per IP, and a separate 300 per IP for `get-session`. One full dashboard load makes 13 API calls, so the harness trips the per-parent limit within a minute. Use `launch --rate-limit on` to test the limiter itself (see [`features/auth.md`](features/auth.md)).

Isolation: one instance per host. Ports 38601, 38602, 38632 and 38622 are fixed. `launch` refuses to start when a port is busy, when the container exists, or when `.verify-run/state.json` exists. Never point the CLI at an instance you did not launch.

## Doctor

```bash
$C doctor   # read-only; exit 0 only when every required check passes
```

`doctor` checks:

- the recorded PIDs are alive
- the labelled container is running
- `/api/health/jobs` answers, directly and through the Vite proxy
- the SPA serves `/login`
- the demo parent exists with at least two children
- CDP answers
- the API process env holds the fake Stripe key and empty Resend/VAPID/Koe values

It never calls `/api/health`, because that route pings Stripe.

## Drive

Sign in first; every parent page needs a session.

| Goal | Command |
|---|---|
| Sign in through the real `/login` form | `$C login` |
| Add a child (synthetic name) | `$C child add --name "Pilote Fictif" [--age 9-11]` |
| Log today's symptoms, create or update | `$C symptom log [--child <name>] [--preset calme\|difficile] [--context ..] [--notes ..]` |
| Journal entry with tags | `$C journal add --text ".." [--child <name>] [--tags "Victoire,École"]` |
| Navigate | `$C goto /report` |
| Generic click, fill and key | `$C click --role button --name "^Écrire$" --within main`, `$C fill --label "^Notes$" --value ".."`, `$C key Escape` |
| ARIA tree and PNG | `$C snapshot [--selector body\|[role=dialog]]`, `$C screenshot --name x [--full-page] [--mobile]` |
| Second reads | `$C api /api/children` (GET with the browser's session), `$C db "select ..."` (read-only transaction) |
| Browser console and HTTP log | `$C console --level error`, `$C network-log --filter /api/ --status-min 400` |

Commands with side effects accept `--dry-run`: `launch`, `teardown`, `login`, `child add`, `symptom log`, `journal add`, `click` and `fill`. `click` prints the non-GET `/api` calls it triggered.

Child data is synthetic only. Use the seeded children or obviously fake names ("Pilote Fictif"). Never type a real child's name or health detail, not even locally.

The feature map in [`features/README.md`](features/README.md) has one recipe per feature, plus the routes that are not scripted yet.

## Evidence

- Location: `$TOKO_EVIDENCE_DIR/<runId>/`. The default is `.verify-evidence/<runId>/` (gitignored), which dies with `git worktree remove`, so set the variable outside the checkout.
- File names are `<timestamp>_<label>.png` and `.aria.yml`. `transcript.txt` has every CLI call and its full JSON output. Teardown copies the API, Vite and browser logs plus `console.jsonl` and `network.jsonl` into `<runId>/run-logs/`.
- Proof standards:
  - Drive the UI: a dialog, its fields, its submit button. Never POST to `/api/*` to "prove" a UI change. `api` is GET-only on purpose.
  - Capture the action and its result: the before/after screenshots and the HTTP response, which `child`, `symptom` and `journal` print.
  - Check every mutation with a second read: the DB row (`db`), and the API or page showing it (`api`, the `visibleOnJournalPage` flag).
  - For a bug, reproduce it on the same surface first, then show it gone.

## Cleanup

```bash
$C teardown --dry-run
$C teardown
```

`teardown`:

- kills only the recorded process groups
- removes `toko-verify-pg` only if it carries the label
- deletes `.verify-run/` and the generated Vite config
- keeps the evidence
- reports `portsStillOpen`, which must be `[]`

Run it after a failed iteration too.

## Helpers

`scripts/control-toko.mjs` is the only helper. It is a Node ESM script with no dependencies of its own. It loads Playwright from the repo's `@playwright/test` and runs `psql` inside the container. It hosts the `__browserd` daemon that `launch` spawns.

## Gotchas

- **Past a rate limit the parent stays signed in.** The recipe is in `features/auth.md`. The data calls return 429 and the page shows a retry state.
- The limiter's IP key differs between `localhost` (`::1`) and `127.0.0.1`. The Vite proxy reaches the API on `127.0.0.1`.
- `/api/health` pings Stripe (`balance.retrieve`, cached for 5 min). With the fake key it logs `stripe_health_probe_failed`. Do not poll it.
- Billing (`/account`, the upsell cards, checkout) calls Stripe with the fake key and fails. It is not drivable here (see `features/billing.md`).
- On `/login`, the console shows `[Better Auth] Error verifying passkey NotSupportedError`: headless Chromium has no WebAuthn conditional UI. It is harmless. Password sign-in is unaffected.
- The seeded demo has a symptom reading for today, so `symptom log` on Lucas or Emma runs in update mode (PATCH, presets hidden). A child you just added runs in create mode (POST).
- `children.name` is AES-256-GCM ciphertext (`enc::v1::`). Journal text and symptom notes are stored in plaintext.
- Sign-in is limited to 10/min by Better Auth. A tight loop of `login` calls returns 429.

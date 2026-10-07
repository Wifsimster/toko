# Sign-in and session

Parents sign in with e-mail and password on `/login` (Better Auth, session cookie). Google sign-in, passkeys and TOTP 2FA also exist. Every page under `_authenticated` runs `getCachedSession()` in `beforeLoad` and redirects to `/login` when the session is null.

## Sub-features

- `login-password`: the e-mail and password form, then the "Se connecter" button. It POSTs `/api/auth/sign-in/email`. Better Auth allows 10 attempts/min.
- `session-guard`: `apps/web/src/routes/_authenticated.tsx` and `getCachedSession()` in `apps/web/src/lib/auth-client.ts`.
- `login-google`, `login-passkey`, `2fa`: present, but not drivable here (fake Google client, no WebAuthn authenticator in headless Chromium).
- `logout`: "Menu utilisateur" in the sidebar footer, then the menu item "Déconnexion". Opening a parent page afterwards redirects to `/login`.

## How to get to it (user POV)

- Open any parent page while signed out. It redirects to `/login`.
- From the landing page `/`, use the sign-in link.

## Driving it with control-toko

Preconditions:

- A fresh `$C launch`, and `$C doctor` exits 0.

- **Sign in.** Run `$C login`. The result has `signIn: [{path: "/api/auth/sign-in/email", status: 200}]`, a `url` ending with `/dashboard`, and `sessionUser.email` equal to `demo@toko.app`, read back from `/api/auth/get-session`. The evidence is `after-login.png`. The command also marks the onboarding tour as done in `localStorage` (`toko-ui`), as `e2e/auth.setup.ts` does.
- **Session row.** Run `$C db "select count(*) from session where expires_at > now()"`. It returns at least 1.
- **A rate limit never signs the parent out.** Limits: 120 req/min per signed-in parent, 600 req/min per IP, and a separate 300 req/min per IP for `get-session`.
  1. Run `$C teardown`, then `$C launch --rate-limit on`, then `$C login`.
  2. Per-parent limit: run `$C goto /dashboard` 11 times (13 API calls each). From about the tenth load, the data calls return 429. The URL stays `/dashboard`, and the page shows "Impossible de charger vos enfants pour le moment" with "Réessayer", not the "Bienvenue" first-child screen. `$C network-log --filter get-session` shows only 200s.
  3. Session bucket: run `for i in $(seq 1 310); do curl -s -o /dev/null http://127.0.0.1:38602/api/auth/get-session; done`. A sidebar link (`$C click --role link --name "^Suivi$"`) still navigates: the client keeps the last good session. A full load (`$C goto /dashboard`) retries 3 times (0.5 s, 1 s, 2 s), then shows "Tokō ne répond pas pour le moment" with "Réessayer". It never lands on `/login`.

## Gotchas

- Better Auth's `getSession()` resolves `{data: null, error}` on an HTTP error. `apps/web/src/lib/session-cache.ts` reads `error` and only treats a successful null (or a 401) as signed out.
- The console shows `[Better Auth] Error verifying passkey NotSupportedError` on `/login`. That is the conditional-UI passkey probe in headless Chromium. Ignore it.
- A tight loop of `login` calls hits the 10/min sign-in limit, even with `RATE_LIMIT_BYPASS` (Better Auth has its own limiter).

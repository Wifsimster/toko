# Sign-in and session

Parents sign in with e-mail and password on `/login` (Better Auth, session cookie). Google sign-in, passkeys and TOTP 2FA also exist. Every page under `_authenticated` runs `getCachedSession()` in `beforeLoad` and redirects to `/login` when the session is null.

## Sub-features

- `login-password`: the e-mail and password form, then the "Se connecter" button. It POSTs `/api/auth/sign-in/email`. Better Auth allows 10 attempts/min.
- `session-guard`: `apps/web/src/routes/_authenticated.tsx` and `getCachedSession()` in `apps/web/src/lib/auth-client.ts`.
- `login-google`, `login-passkey`, `2fa`: present, but not drivable here (fake Google client, no WebAuthn authenticator in headless Chromium).
- `logout`: "Menu utilisateur" in the sidebar footer.

## How to get to it (user POV)

- Open any parent page while signed out. It redirects to `/login`.
- From the landing page `/`, use the sign-in link.

## Driving it with control-toko

Preconditions:

- A fresh `$C launch`, and `$C doctor` exits 0.

- **Sign in.** Run `$C login`. The result has `signIn: [{path: "/api/auth/sign-in/email", status: 200}]`, a `url` ending with `/dashboard`, and `sessionUser.email` equal to `demo@toko.app`, read back from `/api/auth/get-session`. The evidence is `after-login.png`. The command also marks the onboarding tour as done in `localStorage` (`toko-ui`), as `e2e/auth.setup.ts` does.
- **Session row.** Run `$C db "select count(*) from session where expires_at > now()"`. It returns at least 1.
- **The guard bounces on a 429 (bug).**
  1. Run `$C teardown`, then `$C launch --rate-limit on`, then `$C login`.
  2. Run `for i in $(seq 1 121); do curl -s -o /dev/null http://127.0.0.1:38602/api/health/jobs; done`.
  3. Run `$C goto /dashboard`. The result is `url: .../login`, `h1: "Bon retour sur Tokō"`. `$C network-log --filter get-session` shows the 429, and the `session` row is still valid.

## Gotchas

- `getSession()` resolves `{data: null}` on any HTTP error, including a 429. The guard treats that as "logged out", and the null stays cached for the session TTL.
- The console shows `[Better Auth] Error verifying passkey NotSupportedError` on `/login`. That is the conditional-UI passkey probe in headless Chromium. Ignore it.
- A tight loop of `login` calls hits the 10/min sign-in limit, even with `RATE_LIMIT_BYPASS` (Better Auth has its own limiter).

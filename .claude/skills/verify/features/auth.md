# Sign-in and session

Parents sign in with e-mail and password on `/login` (Better Auth, session cookie). Google sign-in, passkeys and TOTP 2FA also exist. Every page under `_authenticated` runs `getCachedSession()` in `beforeLoad` and redirects to `/login` when the session is null.

## Sub-features

- `login-password`: the e-mail and password form, then the "Se connecter" button. It POSTs `/api/auth/sign-in/email`. In production Better Auth allows 10 attempts/min; its limiter is off outside production, so not in this harness. An account whose address is not confirmed gets `403 EMAIL_NOT_VERIFIED` (only after a correct password): the form shows "Votre adresse e-mail n'est pas encore confirmée" and a "Renvoyer l'e-mail" button (60 s cooldown).
- `signup-verify`: the "Inscription" tab POSTs `/api/auth/sign-up/email`, which returns 200 with `token: null` and no session, the same body whether the address already has an account or not (`requireEmailVerification`). The page swaps to "Vérifiez votre boîte mail" with "Renvoyer l'e-mail" (disabled for 60 s) and "Retour à la connexion". New address: "Confirmez votre adresse e-mail" mail. Existing verified address: "Vous avez déjà un compte" mail (link to `/login` only). Existing unconfirmed address: "Finalisez votre compte" mail, a password-reset link (`/reset-password?token=`), never a verification link: the reset replaces the password, confirms the address and revokes every session (pre-registration takeover guard). The verification link (`/api/auth/verify-email`, valid 24 h) confirms the address and lands on `/login?verified=1` ("Votre adresse e-mail est confirmée…") without signing anyone in (`autoSignInAfterVerification: false`); an expired or invalid link lands on `/login?verified=1&error=…` ("Ce lien n'est plus valable…"). The Mō onboarding opens after the first sign-in. Resend limits: 60 s client cooldown; the API rule `/send-verification-email` 5/min per IP applies in production only (Better Auth's limiter is off in development, so this harness gets 200 every time, even with `--rate-limit on`).
- `reset-recovery`: a password reset takes the account back. Better Auth replaces the password and deletes every session; `onPasswordReset` (`apps/api/src/lib/account-recovery.ts`) first deletes every session, then revokes agent keys and deletes passkeys, 2FA trusted devices, push subscriptions, pending co-parent invitations sent by the account, and the 2FA of an account whose address was not confirmed yet, in one transaction. Credential-creating routes (agent keys, push, invitations) lock their session row FOR SHARE (`lib/live-session.ts`), so a key minted during the reset is either refused (401) or revoked by it. There is no session cookie cache, so a revoked session gets 401 on its next request (with the browser's cookies, no cache bypass).
- `session-guard`: `apps/web/src/routes/_authenticated.tsx` and `getCachedSession()` in `apps/web/src/lib/auth-client.ts`.
- `login-google`, `login-passkey`, `2fa`: present, but not drivable here (fake Google client, no WebAuthn authenticator in headless Chromium).
- `logout`: "Menu utilisateur" in the sidebar footer, then the menu item "Déconnexion". Opening a parent page afterwards redirects to `/login`. In this harness the sign-out call fires about 2 s after the click (see Gotchas).

## How to get to it (user POV)

- Open any parent page while signed out. It redirects to `/login`.
- From the landing page `/`, use the sign-in link.

## Driving it with control-toko

Preconditions:

- A fresh `$C launch`, and `$C doctor` exits 0.

- **Sign in.** Run `$C login`. The result has `signIn: [{path: "/api/auth/sign-in/email", status: 200}]`, a `url` ending with `/dashboard`, and `sessionUser.email` equal to `demo@toko.app`, read back from `/api/auth/get-session`. The evidence is `after-login.png`. The command also marks the onboarding tour as done in `localStorage` (`toko-ui`), as `e2e/auth.setup.ts` does.
- **Sign up, confirm, first visit.** Drive the form, never `login`. Two state traps:
  - Start signed out (log out first). With another parent signed in, "Renvoyer l'e-mail" sends `send-verification-email` with that parent's session and gets 400 (no message; the cooldown restarts).
  - `login` marks the onboarding as seen in the browser's `localStorage` (`toko-ui`), for every account. Step 6 only shows the onboarding when `login` has not run since this `launch`; otherwise reopen it from the menu (see `onboarding.md`).
  1. `$C goto "/login?mode=register"`, then `$C fill --label "^Prénom$" --value "Pilote Fictif"`, `$C fill --label "^Email$" --value "pilote.fictif@example.test"`, `$C fill --label "^Mot de passe$" --value "motdepasse-verif"`, `$C click --role checkbox --name "18 ans"`, `$C click --role button --name "^Créer mon compte$"`. The click prints `POST /api/auth/sign-up/email` 200 with `"token": null`; the page shows "Vérifiez votre boîte mail"; `$C api /api/auth/get-session` returns `null`.
  2. Same steps with `demo@toko.app`: same 200 body (same keys, same order), same screen, and the demo row is unchanged (`$C db "select name from \"user\" where email='demo@toko.app'"`).
  3. `$C mail` lists both mails: "Confirmez votre adresse e-mail" with the verify link, "Vous avez déjà un compte" with only `/login`.
  4. Sign in as the new parent through `/login` (fill + click, not `login`): `POST /api/auth/sign-in/email` 403 `EMAIL_NOT_VERIFIED`, the message and "Renvoyer l'e-mail". Click it: `POST /api/auth/send-verification-email` 200, "C'est renvoyé.", one more mail.
  5. `$C goto "$($C mail --to pilote.fictif@example.test --last | jq -r '.mails[0].links[0]')"` lands on `/login?verified=true` (the API redirects to `?verified=1`; the router rewrites it) with "Votre adresse e-mail est confirmée", `$C api /api/auth/get-session` is still `null`, and `$C db "select email_verified from \"user\" where email='pilote.fictif@example.test'"` is `true`.
  6. Sign in through the form (fill + click "Se connecter"): `/dashboard` with the onboarding open (`$C snapshot --selector "[data-testid=onboarding]"` shows "Commencer").
- **Pre-registration takeover is closed.** Sign up `victime@example.test` with password A ("attacker"), then again with password B ("victim"): `$C mail --to victime@example.test` shows "Confirmez votre adresse e-mail" then "Finalisez votre compte" (reset link). Open the reset link, choose password C: signing in with A gets 401, with C 200. Following a verification link never sets a session.
- **Session row.** Run `$C db "select count(*) from session where expires_at > now()"`. It returns at least 1.
- **A rate limit never signs the parent out.** Limits: 120 req/min per signed-in parent, 600 req/min per IP, and a separate 300 req/min per IP for `get-session`.
  1. Run `$C teardown`, then `$C launch --rate-limit on`, then `$C login`.
  2. Per-parent limit: run `$C goto /dashboard` 11 times (13 API calls each). From about the tenth load, the data calls return 429. The URL stays `/dashboard`, and the page shows "Impossible de charger vos enfants pour le moment" with "Réessayer", not the "Bienvenue" first-child screen. `$C network-log --filter get-session` shows only 200s.
  3. Session bucket: run `for i in $(seq 1 310); do curl -s -o /dev/null http://127.0.0.1:38602/api/auth/get-session; done` (port 38602 is slot 0; add `slot × 100` otherwise). A sidebar link (`$C click --role link --name "^Suivi$"`) still navigates: the client keeps the last good session. A full load (`$C goto /dashboard`) retries 3 times (0.5 s, 1 s, 2 s), then shows "Tokō ne répond pas pour le moment" with "Réessayer". It never lands on `/login`.

## Gotchas

- Better Auth's `getSession()` resolves `{data: null, error}` on an HTTP error. `apps/web/src/lib/session-cache.ts` reads `error` and only treats a successful null (or a 401) as signed out.
- The console shows `[Better Auth] Error verifying passkey NotSupportedError` on `/login`. That is the conditional-UI passkey probe in headless Chromium. Ignore it.
- Better Auth's own limiter (10/min sign-in, 5/min `/send-verification-email`, …) only runs in production. `RATE_LIMIT_BYPASS` and `--rate-limit on` only drive Tokō's own limiters; this harness cannot show Better Auth's 429s.
- **Sign-out lands about 2 s after the click.** `handleSignOut()` in `user-menu.tsx` first awaits `releasePushSubscriptionForSignOut()`, which races a 2 s timeout. The harness blocks service workers, so `navigator.serviceWorker.ready` never resolves and the timeout always runs out. A `$C goto` right after the click navigates away before `POST /api/auth/sign-out` is sent, and the session survives. Wait 3 s, then check `$C network-log --filter sign-out` (200) and `$C db "select count(*) from session where expires_at > now()"` (0) before `$C goto /journal` (redirects to `/login`). Re-checked on `7bd82c0`.

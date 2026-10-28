# Billing

Tokō Famille (monthly or annual) and Tokō Formation (one-shot) through Stripe Checkout and the Billing Portal, plus the "Tarif solidaire" request. Prices are resolved at runtime by lookup key (`toko_famille_monthly`, ...). The webhook (`/api/stripe/webhook`) updates `subscription`.

## Sub-features

- `billing-status`: `GET /api/billing/status`, called on the dashboard, `/report`, "Mon compte" and every `PremiumGate` (one shared query).
- `billing-checkout`, `billing-portal`: Stripe redirects. Pause, cancel and resume also go through Stripe.
- `billing-webhook`: signature-checked events.
- `solidarity-request`: the "Tarif solidaire" card on "Mon compte", shown only to a parent without an active plan. "Envoyer la demande" POSTs `/api/solidarity` (201), writes a `solidarity_requests` row with status `pending` (a second request gets 409), and e-mails `SOLIDARITY_NOTIFY_EMAIL` (`solidarity@toko-verify.test`, caught by the outbox). The card then reads "Demande en cours d'examen".

## How to get to it (user POV)

- `/tarifs`, the upsell cards (report, Barkley formation), and "Mon compte".

## Driving it with control-toko

Preconditions:

- The Stripe flows are not drivable with this harness. `launch` sets `STRIPE_SECRET_KEY=sk_test_toko_verify_fake`, so every Stripe call fails with "Invalid API Key": a checkout button ("Débloquer le suivi médical", "Essayer Famille…") gets `POST /api/billing/checkout` 500 and an error toast.

- **What works.** The demo parent's `subscription` row makes premium pages render. `$C api /api/billing/status` shows the status the UI uses.
- **Tarif solidaire.** Needs a free parent: sign one up (`auth.md`), then `$C goto /account` and `$C click --role button --name "^Envoyer la demande$"`. The click prints `POST /api/solidarity` 201. Then `$C db "select status from solidarity_requests"` (`pending`) and `$C mail --to solidarity@toko-verify.test` ("Nouvelle demande de tarif solidaire de …").
- **What would unlock it.** Choose one:
  - a Stripe **test-mode** key, plus `stripe listen` forwarding to `:38601/api/stripe/webhook`. That needs the human's approval and a key from the operator, never a production key.
  - a local Stripe mock: `stripe-mock` does not cover Checkout sessions, so this is a partial unlock at best.

## Gotchas

- `/api/health` calls `stripe.balance.retrieve()`, cached for 5 min. With the fake key it logs `stripe_health_probe_failed`. The harness never calls it.

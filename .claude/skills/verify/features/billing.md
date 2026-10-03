# Billing

Tokō Famille (monthly or annual) and Tokō Formation (one-shot) through Stripe Checkout and the Billing Portal, plus the "Tarif solidaire" request. Prices are resolved at runtime by lookup key (`toko_famille_monthly`, ...). The webhook (`/api/stripe/webhook`) updates `subscription`.

## Sub-features

- `billing-status`: `GET /api/billing/status`, called on every dashboard load.
- `billing-checkout`, `billing-portal`: Stripe redirects.
- `billing-webhook`: signature-checked events.
- `solidarity-request`: a form that e-mails `SOLIDARITY_NOTIFY_EMAIL`, which is a fake address here, with Resend empty.

## How to get to it (user POV)

- `/tarifs`, the upsell cards (report, Barkley formation), and "Mon compte".

## Driving it with control-toko

Preconditions:

- Not drivable with this harness. `launch` sets `STRIPE_SECRET_KEY=sk_test_toko_verify_fake`, so every Stripe call fails with "Invalid API Key".

- **What works.** The demo parent's `subscription` row makes premium pages render. `$C api /api/billing/status` shows the status the UI uses.
- **What would unlock it.** Choose one:
  - a Stripe **test-mode** key, plus `stripe listen` forwarding to `:38601/api/stripe/webhook`. That needs the human's approval and a key from the operator, never a production key.
  - a local Stripe mock: `stripe-mock` does not cover Checkout sessions, so this is a partial unlock at best.

## Gotchas

- `/api/health` calls `stripe.balance.retrieve()`, cached for 5 min. With the fake key it logs `stripe_health_probe_failed`. The harness never calls it.

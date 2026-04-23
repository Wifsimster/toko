# Hosting — EU only (business rule F1)

## Why

Toko stores pseudonymized behavioural data about ADHD children. To comply
with GDPR and the platform's privacy posture (anonymization by design,
no data transfer outside the EU), all production infrastructure must run
inside the European Union.

## Required

| Component | Requirement | Notes |
|---|---|---|
| Application runtime | EU-region VM or container platform | Scaleway (Paris/Amsterdam), OVH, Clever Cloud, Hetzner (EU), Fly.io Paris region |
| PostgreSQL | EU-region managed or self-hosted | Same providers as above. Neon, Supabase and PlanetScale are acceptable only with EU region pinned at project creation |
| Object storage (if ever) | EU-region bucket | Scaleway, OVH, Infomaniak kDrive |
| Email (Resend) | EU endpoint | Resend auto-routes; confirm `EU_REGION` env is set when exposed |
| Stripe | Stripe Ireland (already default for EU merchants) | No action |
| Monitoring / logs | EU-region | Self-host or Axiom EU / Grafana Cloud EU |

## Forbidden

- AWS `us-*`, `ap-*`, `ca-*` regions
- Google Cloud `us-*`, `asia-*`, `southamerica-*`
- Azure non-EU regions
- Vercel without `FRA1` / `CDG1` pin
- Any SaaS whose Terms of Service allow "data may be transferred outside the EU" without a DPA clause restricting to EU sub-processors

## Verification checklist (before each deploy)

1. `compose.yml` — the managed DB URL points to an EU region
2. Traefik / reverse proxy — runs on the same EU VM
3. Docker image registry — GitHub Container Registry is fine (it's global but only pulls, no data stored)
4. DNS — any provider is fine
5. CDN for static assets — Cloudflare EU is fine if routing is pinned; otherwise host behind the app server

## Audit trail

Any change that could introduce a non-EU sub-processor must be reviewed
against this document and the current `docs/business-rules.md` (F1).

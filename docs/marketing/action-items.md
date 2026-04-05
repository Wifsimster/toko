# Marketing Action Items — Issue Drafts

From the marketing meeting (Inès / Malik / Noémie / Julien / Awa).
Each section below is a ready-to-paste GitHub issue.

Status legend: ✅ shipped · 🚧 todo (code) · 📣 todo (external)

---

## ✅ #1 — Rewrite landing page hero + trust signals
**Status:** Shipped in `claude/marketing-launch-package` (commit `e5dc48c`).

**Labels:** `marketing`, `landing-page`
**Owner:** Inès + Julien

### Context
The previous hero *« Suivez le TDAH de votre enfant, un jour à la fois »* describes the tool, not the transformation. No trust signals, no testimonials. Conversion diagnosed as poor in the marketing meeting.

### Acceptance criteria
- [x] New hero copy emphasizing parent transformation
- [x] Sub-title referencing the pédopsy consultation use-case
- [x] Trust bar: Barkley PEHP, RGPD UE, conçu avec parents
- [x] 3 parent testimonials section
- [x] Mention of Dr Russell Barkley

---

## 🚧 #2 — A/B test 3 hero variants
**Labels:** `marketing`, `experiment`, `analytics`
**Owner:** Julien (CRO)
**Depends on:** analytics tooling (PostHog or Plausible)

### Context
Three hero variants were proposed but not tested:
- **A (control)** — *« Suivez le TDAH de votre enfant, un jour à la fois »*
- **B (Julien)** — *« Comprenez enfin le TDAH de votre enfant — et parlez-en avec les bons mots à son médecin »*
- **C (Inès)** — *« Comprendre son enfant TDAH, un jour à la fois — et ne plus rester seul·e face aux crises. »*

Note: variant B is currently shipped as the default.

### Acceptance criteria
- [ ] Choose & integrate an experimentation tool (PostHog recommended — self-hostable, RGPD-friendly)
- [ ] Instrument 3 hero variants + traffic split (33/33/33)
- [ ] Primary KPI: CTR on primary CTA (`Commencer gratuitement`)
- [ ] Secondary KPI: completed signups within 30 min of landing
- [ ] Run for min. 2 weeks OR 95% confidence, whichever first
- [ ] Document the winning variant

---

## ✅ #3 — Publish first 3 KB articles as `/ressources/*`
**Status:** Shipped in `claude/marketing-launch-package`.

**Labels:** `content`, `seo`

Shipped articles (3 priority):
- `/ressources/dysregulation-emotionnelle-tdah`
- `/ressources/co-regulation-parent-enfant-tdah`
- `/ressources/troubles-sommeil-tdah-enfant`

---

## ✅ #4 — Publish remaining 3 KB articles
**Status:** Shipped in `claude/marketing-launch-package`.

**Labels:** `content`, `seo`

Shipped articles (3 remaining):
- `/ressources/deconnexion-emotionnelle-tdah`
- `/ressources/fonctions-executives-tdah-enfant`
- `/ressources/hypersensibilite-sensorielle-tdah`

---

## ✅ #5 — Pillar content "Crise TDAH enfant : guide complet"
**Status:** Shipped in `claude/marketing-launch-package`.

**Labels:** `content`, `seo`, `pillar`

Route: `/ressources/crise-tdah-enfant-guide-complet`
Target keyword: *"crise TDAH enfant que faire"*

**Follow-up:** extend to 3 500 words with FAQ schema, expert quotes, and internal link injection across all related articles. Current version: ~1 200 words.

---

## ✅ #6 — Pricing comparison table + 14j badge
**Status:** Shipped in `claude/marketing-launch-package`.

**Labels:** `marketing`, `pricing`, `landing-page`

Landing page now has: comparison table (10 rows), "14j offerts · sans CB" badge on Famille card, ≈60 €/an equivalent.

---

## 📣 #7 — Open partnership discussions with 3 associations
**Labels:** `marketing`, `partnerships`, `external`
**Owner:** Awa (Community)

### Context
3 priority targets identified:
1. **HyperSupers – TDAH France** (~10k adhérents)
2. **TDAH Belgique (asbl)**
3. **PANDA Québec** (Regroupement des associations PANDA)

Approach: non-commercial, offer value first (free KB content, RGPD data export for their webinars). No paid sponsorship.

### Acceptance criteria
- [ ] Draft outreach email template (French, warm tone, no hard sell)
- [ ] Send to HyperSupers national delegation
- [ ] Send to TDAH Belgique contact
- [ ] Send to PANDA Québec contact
- [ ] Track responses in a simple CRM or Notion doc
- [ ] Goal: secure 1 partnership discussion call within 4 weeks

---

## 📣 #8 — Launch "Parents-relais Tokō" ambassador program
**Labels:** `marketing`, `community`, `external`
**Owner:** Awa (Community) + Camille (Product)

### Context
Program design from the meeting:
- 20 parents selected for engagement
- Free Famille plan for 12 months
- Access to a private Slack/Discord with the product team
- Referral code: 1 month free for referee + referrer on Famille plan

### Acceptance criteria
- [ ] Define selection criteria (current users, social media presence, community engagement)
- [ ] Set up referral code system in Stripe
- [ ] Create a simple ambassador landing page or application form
- [ ] Set up private community channel
- [ ] Recruit via French TDAH Facebook groups
- [ ] Onboard first 20 ambassadors
- [ ] Publish 3 ambassador testimonials on landing page

---

## 📣 #9 — T1 Webinar "Tenir un journal TDAH utile en consultation"
**Labels:** `marketing`, `content`, `event`, `external`
**Owner:** Awa + Noémie

### Context
Format: 45 min presentation + 15 min Q&A, co-hosted with a partner orthophoniste.

Topic: how to transform 4 weeks of symptom tracking into a productive exchange with the pédopsychiatre.

### Acceptance criteria
- [ ] Identify & secure a partner orthophoniste or pédopsychiatre speaker
- [ ] Build presentation deck (15-20 slides)
- [ ] Choose platform (Zoom, Livestorm, YouTube Live)
- [ ] Landing page with registration form
- [ ] Email sequence: invite → reminder → thank you + replay
- [ ] Distribute replay to partner associations
- [ ] Target: 200 live attendees, 500 replay views in 30 days

---

## ✅ #10 — Build PDF consultation export (premium feature)
**Status:** Shipped in `claude/marketing-launch-package`.

**Labels:** `product`, `feature`, `premium`, `high-priority`
**Owner:** Product + Engineering

### Context
The flagship premium feature to differentiate the Famille plan beyond the "3 children" limit.

### Implementation
- Route: `/_authenticated/report/` (requires active subscription)
- Approach: **browser-native print-to-PDF** via print-optimized CSS and `window.print()` — no new dependencies, high-quality output, works offline
- Data sources: `useStats` (quarter), `useJournal`, `useChildren`, `useBillingStatus`
- Print styles in `apps/web/src/app.css` (`@media print` block): hides app chrome (header, sidebar, bottom nav, controls), A4 page layout with 1.5 × 1.8 cm margins, strips colors to black-on-white

### Acceptance criteria
- [x] ~~Select PDF library~~ — used browser-native print-to-PDF (no new deps)
- [x] Design PDF template (Tokō branded, medical-friendly typography)
- [x] Report route gated on `billing.data?.active`
- [x] Frontend download button in `/account` (new Rapport médical card) + in the report page itself
- [x] Paywall view when not subscribed (CTA to checkout / 14-day trial)
- [x] Landing page: "Export PDF pour le médecin" row on comparison table
- [ ] E2E test (Playwright)
- [ ] Documentation: one-pager for pédopsychiatres

### Content of the report
- Child profile (name, gender, age, period dates)
- 4 KPIs: journal entries, days tracked, crises, victories
- Symptom averages table (7 dimensions × moyenne × tendance × nb de relevés)
- Tendance calculation: diff between 1st and 2nd half of period, ±0.3 pt stability threshold
- Journal highlights: 10 most recent entries with mood emoji + tags + text
- Footer disclaimer: "ne constitue pas un diagnostic médical"

### Follow-ups (out of scope for v1)
- Editable annotations
- Multi-child consolidated reports
- Email delivery
- E2E Playwright test
- Pédopsy documentation one-pager

---

## Tracking board

| # | Item | Status | Owner |
|---|------|--------|-------|
| 1 | Landing rewrite | ✅ Shipped | Inès + Julien |
| 2 | A/B test hero | 🚧 Needs tooling | Julien |
| 3 | Publish KB (batch 1) | ✅ Shipped | Noémie |
| 4 | Publish KB (batch 2) | ✅ Shipped | Noémie |
| 5 | Pillar content | ✅ Shipped (v1) | Noémie |
| 6 | Pricing comparison | ✅ Shipped | Julien |
| 7 | Partnerships | 📣 External | Awa |
| 8 | Ambassador program | 📣 External | Awa + Camille |
| 9 | T1 webinar | 📣 External | Awa + Noémie |
| 10 | PDF consultation export | ✅ Shipped (v1) | Product + Eng |

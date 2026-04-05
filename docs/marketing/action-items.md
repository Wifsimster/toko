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

## 🚧 #10 — Build PDF consultation export (premium feature)
**Labels:** `product`, `feature`, `premium`, `high-priority`
**Owner:** Product + Engineering

### Context
This is identified as **the flagship premium feature** to differentiate the Famille plan beyond the "3 children" limit. API route `report` already exists as a scaffold.

### Scope
Generate a PDF summarizing a child's data over a chosen period (default 3 months):
- Profile summary (name, age, active since)
- Symptom trends (7 dimensions) with averages + sparklines
- Journal highlights (crises, victories, tags)
- Sleep patterns (if tracked)
- Crisis list overview

### Acceptance criteria
- [ ] Select PDF library (pdfkit, @react-pdf/renderer, or puppeteer)
- [ ] Design PDF template (Tokō branded, medical-friendly typography)
- [ ] API endpoint `GET /api/report/:childId/pdf?period=3m` (gated on `isActive` subscription)
- [ ] Frontend download button in `/account` or new `/report` page
- [ ] E2E test: authenticated user → generate → download → content renders
- [ ] Landing page: add as premium feature on comparison table (currently placeholder row exists)
- [ ] Documentation: one-pager for pédopsychiatres

### Out of scope
- Editable annotations
- Multi-child consolidated reports
- Email delivery (v2)

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
| 10 | PDF consultation export | 🚧 Planned | Product + Eng |

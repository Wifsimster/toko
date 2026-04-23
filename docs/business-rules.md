# TOKO — Règles métier

Règles fondatrices à respecter dans toute évolution produit et technique de l'application TOKO (assistant phygital pour le tunnel du soir des familles TDAH).

L'application est une **web app mobile-first**, pas une application mobile native.

---

## A. Anonymisation & données sensibles (BLOQUANT — contrat technique)

Principe : **pseudonymisation**, pas anonymisation stricte. L'identité existe mais est isolée du reste via chiffrement et scoping.

| ID | Règle | Implémentation |
|---|---|---|
| A1 | Données comportementales serveur : UUID uniquement, jamais de prénom | Schemas Drizzle : tables `symptoms`, `journal`, `medications`, etc. ne contiennent que `childId` UUID |
| A2 | Prénom enfant stocké chiffré | AES-256-GCM via Drizzle customType (`encryptedText`), clé dans `DB_ENCRYPTION_KEY` (implémenté) |
| A3 | Tranche d'âge uniquement, pas de date de naissance exacte | Enum `ageRange`: `0-5` \| `6-8` \| `9-11` \| `12-14` \| `15-17` (implémenté) |
| A5 | Pas de photo, voix, adresse, école, nom médecin en base | Aucun champ de ce type dans les schemas |
| A7 | IP purgée < 24h | Job `POST /api/jobs/purge-ips` (protégé par `CRON_SECRET`), nullifie `session.ip_address` pour tout session créé il y a > 24h (implémenté) |
| A8 | Stripe en direct via Stripe.js | Serveur ne voit jamais le nom porteur de carte |
| A11 | Appels IA serveur sur payload sans prénom | Sanitizer obligatoire avant tout appel LLM : UUID + événements uniquement |
| A12 | Rapport médecin généré côté client | Génération PDF en navigateur (jsPDF / pdf-lib), jamais d'endpoint serveur `/export/pdf` |
| A14 | CSP stricte anti-XSS | `script-src 'self'`, pas de `unsafe-inline`, pas de CDN tiers |

## B. Saisie & UX (anti-churn)

| ID | Règle | Implémentation |
|---|---|---|
| B1 | Toute interaction quotidienne ≤ 2 secondes | Test E2E chronométré |
| B2 | Hiérarchie input : passif > 1-clic > voix > texte | Texte libre jamais first-class dans l'UI |
| B3 | Bilan du soir = 3 smileys + 1 sous-choix max | Composant unique `<EveningCheck />` |
| B4 | Pas de notif 16h30–21h sauf urgence | Web Push (VAPID) si PWA installée, champ `priority: 'critical'` requis |
| B5 | Onboarding ≤ 5 min avant 1ʳᵉ valeur | Feature flag + analytics de completion |
| B6 | Chaque saisie parent → réponse IA actionnable immédiate | Réponse synchrone obligatoire, pas de "rapport plus tard" |
| B7 | Zéro message culpabilisant | Script `scripts/check-guilt-lexicon.mjs` exécuté en CI (rule implémentée) |
| B8 | PWA installable obligatoire | `manifest.json` + icônes + prompt "Ajouter à l'écran d'accueil" dès J2 |
| B9 | Fonctionnement offline du tunnel du soir | Service Worker + cache routines du jour + queue de sync |
| B10 | Touch targets ≥ 44×44 px | Audit Lighthouse mobile obligatoire en CI |
| B11 | Performance : LCP < 2.5s sur 4G | Budget perf dans la CI, bundle splitting agressif |

## C. Abonnement & monétisation

| ID | Règle | Implémentation |
|---|---|---|
| C1 | Essai 14 jours sans CB | Stripe Checkout avec `trial_period_days: 14` + `payment_method_collection: "if_required"` (implémenté) |
| C2 | Résiliation en 1 clic dans l'app | `POST /api/billing/cancel` → `cancel_at_period_end: true` + `POST /api/billing/resume` (implémenté) |
| C3 | Pause gratuite jusqu'à 3 mois/an | Colonnes `subscription.pausedUntil` + `pauseMonthsUsed` + `pauseYearRef`, endpoint `POST /api/billing/pause` avec quota calendaire + Stripe `pause_collection` (implémenté) |
| C4 | Prix verrouillé pour early adopters | Tag `subscription.cohort` posé au webhook `checkout.session.completed` (env `FOUNDING_COHORT_UNTIL`), jamais rewriteable sur `onConflictDoUpdate` (implémenté) |
| C5 | Aucune publicité, aucun tracker tiers | CSP stricte (`img-src 'self' data:`, `script-src 'self' stripe`), lint CI `pnpm lint:trackers` (implémenté) |
| C6 | Pas d'upsell pendant le tunnel du soir | `<PromoGate>` + hook `useIsTunnelHour` (16h30–21h00), à wrapper sur tout modal de conversion (implémenté) |

## D. IA & conseil

| ID | Règle | Implémentation |
|---|---|---|
| D1 | Jamais de diagnostic ni de posologie | Prompt système verrouillé + filtre sortie |
| D2 | Toute suggestion marquée "suggestion IA" + justifiée | Réponse structurée `{suggestion, evidence[]}` |
| D3 | Humain dans la boucle pour alertes critiques | Détection → flag manuel, pas d'action auto |
| D4 | Traçabilité des recommandations | Table `ai_recommendations` (UUID, modèle, prompt, inputs sanitizés, evidence, feedback parent) + helper `recordRecommendation` + endpoint `POST /api/ai/recommendations/:id/feedback` (implémenté) |
| D5 | Pas de chat libre enfant ↔ IA | Aucune surface enfant connectée à un LLM |

## E. Enfant

| ID | Règle | Implémentation |
|---|---|---|
| E1 | Aucune interface enfant sur téléphone | Audit : toutes les routes sous `_authenticated` sont parent-facing ; rewards/Barkley sont des outils de suivi parent. Conforme |
| E2 | Pas de streaks ni scores addictifs | Audit : pas de leaderboard (documenté dans `share.ts`) ; le `streak` dashboard mesure la régularité de suivi parent, pas la performance enfant. Conforme |
| E3 | Contenu audio validé avant prod | Aucun asset audio en prod. Tout ajout doit passer par une review pédopsy/orthophoniste + un PR dédié qui bloque merge sans validation documentée |
| E4 | Accès aux journaux comportementaux = parent-seul | PIN par défaut + WebAuthn (Touch ID / Face ID) si supporté |
| E5 | Écran parent verrouillable rapidement | `<LockOverlay />` + hook `useIdleLock` (5 min), bouton "Verrouiller" dans le menu utilisateur (implémenté) |

## F. Données & conformité

| ID | Règle | Implémentation |
|---|---|---|
| F1 | Hébergement UE uniquement | Infra Scaleway/OVH, pas d'AWS us-* |
| F2 | Export complet en 1 clic (PDF + JSON) | 100% généré en client, pas d'endpoint `/export` serveur qui verrait les données en clair |
| F3 | Suppression totale < 30 jours après résiliation | Colonne `user.deletion_scheduled_at` + endpoints `POST /api/account/schedule-deletion` et `/cancel-deletion` + cron `POST /api/jobs/purge-scheduled-deletions` (FK cascade efface toutes les données) — implémenté |
| F4 | Consentement parental explicite par fonctionnalité sensible | Table `consents` (append-only) + endpoints `GET/POST /api/account/consents`, `DELETE /api/account/consents/:type` — implémenté |
| F5 | Aucun PII dans les logs applicatifs | `apps/api/src/lib/safe-logger.ts` : redaction de champs sensibles + masquage des emails (implémenté, consommé par `error-handler` et `billing` webhooks) |
| F6 | Analytics self-hosted sans cookie | Aucun analytics chargé, lint CI `pnpm lint:trackers` bloque les endpoints SaaS (PostHog cloud, Matomo cloud…) — conforme par défaut |

## H. Qualité & mesure

| ID | Règle | Implémentation |
|---|---|---|
| H1 | KPI nord = minutes de calme gagnées/soir | Formule transparente (routinesOk + agitation + mood + focus + impulse, cap 40 min/jour), endpoint `GET /api/stats/:childId/calm-minutes` + `<CalmMinutesCard />` sur le dashboard (implémenté) |
| H2 | NPS segmenté 30j / 90j / 1 an | Table `nps_responses` (unique sur `user_id + cohort`) + endpoints `GET /api/account/nps-prompt` et `POST /api/account/nps` (implémenté côté API) |
| H3 | Roadmap votée par la communauté bêta (an 1) | Module de vote, décisions publiques |
| H4 | Rapport annuel transparence (churn, incidents, IA) | Publication publique |

---

## Récapitulatif

| Cat | Domaine | Règles |
|---|---|---|
| A | Anonymisation & données sensibles | 9 |
| B | Saisie & UX | 11 |
| C | Abonnement & monétisation | 6 |
| D | IA & conseil | 5 |
| E | Enfant | 5 |
| F | Données & conformité | 6 |
| H | Qualité & mesure | 4 |

**Total : 46 règles.**

Les IDs non contigus (A4, A6, A9, A10, A13 absents ; saut vers H) sont volontairement préservés pour ne pas casser les références croisées dans la documentation future.

## Suivi d'implémentation

| Règle | Statut |
|---|---|
| A2 — prénom chiffré | ✅ Implémenté via `encryptedText` customType (AES-256-GCM) |
| A3 — tranche d'âge | ✅ Implémenté (migration `0017_age_range.sql`) |
| A7 — purge IP < 24h | ✅ Implémenté (`runPurgeIps`, route `/api/jobs/purge-ips`) |
| B7 — lexique sans culpabilisation | ✅ Lint CI (`pnpm lint:copy`) |
| C1 — essai 14j sans CB | ✅ `payment_method_collection: "if_required"` sur checkout |
| C2 — résiliation 1-clic | ✅ `POST /api/billing/cancel` + `/resume` |
| C3 — pause 3 mois/an | ✅ `POST /api/billing/pause` + quota annuel |
| C4 — prix verrouillé founding | ✅ `subscription.cohort` immuable à la création |
| C5 — pas de tracker tiers | ✅ CSP stricte + lint `check-no-trackers.mjs` |
| C6 — pas d'upsell 16h30-21h | ✅ `<PromoGate>` + `useIsTunnelHour` |
| D4 — traçabilité IA | ✅ Table `ai_recommendations` + helper sanitizer + endpoint feedback |
| F6 — analytics self-host | ✅ Aucun analytics chargé, lint barrière |
| H1 — KPI minutes de calme | ✅ Formule + endpoint + carte dashboard |
| H2 — NPS segmenté | ✅ Schéma + endpoints API (UI à faire) |
| E1, E2, E3 | ✅ Audit : conformes (aucune route enfant, pas de leaderboard, pas d'audio en prod) |
| E5 — verrouillage écran parent | ✅ `useIdleLock` + `<LockOverlay />` + bouton manuel |
| F3 — suppression < 30j | ✅ Schedule/cancel endpoints + cron `purge-scheduled-deletions` |
| F4 — consentements | ✅ Table `consents` append-only + endpoints `/api/account/consents` |
| F5 — pas de PII dans les logs | ✅ `safe-logger` avec redaction |
| A1, A5, A8, A11, A12, A14 | ✅ Déjà conformes |

### Déploiement production (A2)

- Générer la clé : `openssl rand -hex 32` → `DB_ENCRYPTION_KEY`
- Provisionner la variable d'environnement **avant** le premier démarrage
- Les prénoms existants en clair sont décodés tel quel (mode tolérant) ; ils seront chiffrés à la prochaine mise à jour de l'enfant ou via un script one-shot `scripts/migrate-encrypt-names.ts` (non fourni)
- **Ne pas roter la clé** sans script de ré-encryption — les données existantes deviendraient illisibles

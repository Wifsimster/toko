# TOKO — Règles métier

Règles fondatrices à respecter dans toute évolution produit et technique de l'application TOKO (assistant phygital pour le tunnel du soir des familles TDAH).

L'application est une **web app mobile-first**, pas une application mobile native.

---

## A. Anonymisation & données sensibles (BLOQUANT — contrat technique)

Principe : **pseudonymisation**, pas anonymisation stricte. L'identité existe mais est isolée du reste via chiffrement et scoping.

| ID | Règle | Implémentation |
|---|---|---|
| A1 | Données comportementales serveur : UUID uniquement, jamais de prénom | Schemas Drizzle : tables `symptoms`, `journal`, `medications`, etc. ne contiennent que `childId` UUID |
| A2 | Prénom enfant stocké chiffré | pgcrypto ou chiffrement applicatif, déchiffré uniquement pour la session parent authentifiée |
| A3 | Tranche d'âge uniquement, pas de date de naissance exacte | Enum `ageRange`: `0-5` \| `6-8` \| `9-11` \| `12-14` \| `15-17` (implémenté) |
| A5 | Pas de photo, voix, adresse, école, nom médecin en base | Aucun champ de ce type dans les schemas |
| A6 | Email parent chiffré au repos | pgcrypto ou chiffrement disque, jamais loggé, jamais exposé en analytics |
| A7 | IP purgée < 24h | Middleware de log avec TTL |
| A8 | Stripe en direct via Stripe.js | Serveur ne voit jamais le nom porteur de carte |
| A10 | Aucun texte libre parent synchronisé en clair | Validators Zod : chiffré ou catégorisé en enums |
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
| B7 | Zéro message culpabilisant | Revue copy FR, lexique interdit (`oubli`, `retard`, `raté`) |
| B8 | PWA installable obligatoire | `manifest.json` + icônes + prompt "Ajouter à l'écran d'accueil" dès J2 |
| B9 | Fonctionnement offline du tunnel du soir | Service Worker + cache routines du jour + queue de sync |
| B10 | Touch targets ≥ 44×44 px | Audit Lighthouse mobile obligatoire en CI |
| B11 | Performance : LCP < 2.5s sur 4G | Budget perf dans la CI, bundle splitting agressif |

## C. Abonnement & monétisation

| ID | Règle | Implémentation |
|---|---|---|
| C1 | Essai 14 jours sans CB | Flag `trial` côté `subscriptions`, pas de Stripe à l'inscription |
| C2 | Résiliation en 1 clic dans l'app | Route `DELETE /api/subscription`, effet immédiat |
| C3 | Pause gratuite jusqu'à 3 mois/an | Champ `pausedUntil`, compteur annuel |
| C4 | Prix verrouillé pour early adopters | Tag `cohort: 'founding'` immuable |
| C5 | Aucune publicité, aucun tracker tiers | CSP strict, pas de script externe |
| C6 | Pas d'upsell pendant le tunnel du soir | Router bloque les modals promo 16h30–21h |

## D. IA & conseil

| ID | Règle | Implémentation |
|---|---|---|
| D1 | Jamais de diagnostic ni de posologie | Prompt système verrouillé + filtre sortie |
| D2 | Toute suggestion marquée "suggestion IA" + justifiée | Réponse structurée `{suggestion, evidence[]}` |
| D3 | Humain dans la boucle pour alertes critiques | Détection → flag manuel, pas d'action auto |
| D4 | Traçabilité des recommandations | Table `ai_recommendations` avec inputs anonymes + version modèle |
| D5 | Pas de chat libre enfant ↔ IA | Aucune surface enfant connectée à un LLM |

## E. Enfant

| ID | Règle | Implémentation |
|---|---|---|
| E1 | Aucune interface enfant sur téléphone | Pas de route web enfant, uniquement device physique + audio |
| E2 | Pas de streaks ni scores addictifs | Renforcement = feedback immédiat, pas de compteur cumulatif |
| E3 | Contenu audio validé avant prod | Workflow review obligatoire sur assets audio |
| E4 | Accès aux journaux comportementaux = parent-seul | PIN par défaut + WebAuthn (Touch ID / Face ID) si supporté |
| E5 | Écran parent verrouillable rapidement | Bouton "verrouiller" visible, auto-lock après 5 min d'inactivité |

## F. Données & conformité

| ID | Règle | Implémentation |
|---|---|---|
| F1 | Hébergement UE uniquement | Infra Scaleway/OVH, pas d'AWS us-* |
| F2 | Export complet en 1 clic (PDF + JSON) | 100% généré en client, pas d'endpoint `/export` serveur qui verrait les données en clair |
| F3 | Suppression totale < 30 jours après résiliation | Job cron + log d'audit |
| F4 | Consentement parental explicite par fonctionnalité sensible | Table `consents` avec timestamp + version CGU |
| F5 | Aucun PII dans les logs applicatifs | Logger avec allowlist de champs |
| F6 | Analytics self-hosted sans cookie | PostHog ou Matomo self-host, mode EU |

## H. Qualité & mesure

| ID | Règle | Implémentation |
|---|---|---|
| H1 | KPI nord = minutes de calme gagnées/soir | Calcul quotidien, affiché au parent |
| H2 | NPS segmenté 30j / 90j / 1 an | Envoi in-app, pas d'email |
| H3 | Roadmap votée par la communauté bêta (an 1) | Module de vote, décisions publiques |
| H4 | Rapport annuel transparence (churn, incidents, IA) | Publication publique |

---

## Récapitulatif

| Cat | Domaine | Règles |
|---|---|---|
| A | Anonymisation & données sensibles | 11 |
| B | Saisie & UX | 11 |
| C | Abonnement & monétisation | 6 |
| D | IA & conseil | 5 |
| E | Enfant | 5 |
| F | Données & conformité | 6 |
| H | Qualité & mesure | 4 |

**Total : 48 règles.**

Les IDs non contigus (A4, A9, A13 absents ; saut vers H) sont volontairement préservés pour ne pas casser les références croisées dans la documentation future.

## Suivi d'implémentation

| Règle | Statut |
|---|---|
| A3 — tranche d'âge | ✅ Implémenté (migration `0017_age_range.sql`) |
| A2 — prénom chiffré | ⏳ À venir — nécessite décision d'architecture (pgcrypto vs chiffrement applicatif, gestion de clés, impact sur la recherche) |
| A6 — email parent chiffré | ⏳ À venir — lier à la décision A2 |
| A7 — purge IP < 24h | ⏳ À venir |
| A10 — texte libre chiffré/catégorisé | ⏳ À venir — 4 tables impactées (`symptoms`, `journal`, `medications`, `barkley`) |
| A1, A5, A8, A11, A12, A14 | ✅ Déjà conformes |

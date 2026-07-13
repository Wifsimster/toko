# Conformité RGPD — état des lieux et plan d'implémentation

> Document de référence issu de l'audit du code (juillet 2026), en complément du
> recentrage produit (issue #335, `docs/product-strategy.md`). Décision actée :
> **pas de certification HDS à ce stade** (trop de contraintes en pré-lancement) ;
> la conformité RGPD, elle, est traitée intégralement ici. Chaque écart renvoie
> aux fichiers concernés pour être directement implémentable.

## 1. Cadre général

- **Responsable de traitement :** l'éditeur de Tokō (personne physique,
  cf. `mentions-legales`). À nommer explicitement dans les pages légales (§10).
- **Personnes concernées :** le parent (titulaire du compte), l'enfant
  (données de santé — **article 9 RGPD**), le co-parent invité, le destinataire
  du rapport (praticien).
- **Localisation :** hébergement auto-géré, domaine OVH (`toko.battistella.ovh`),
  fuseau `Europe/Paris`, Postgres en conteneur local (`compose.yml`). Données en
  UE (cf. `docs/hosting-eu.md`).
- **Bases légales par traitement :**

| Traitement | Base légale |
|---|---|
| Compte, authentification, facturation | Exécution du contrat (art. 6.1.b) |
| Suivi santé de l'enfant (symptômes, médicaments, journal…) | **Consentement explicite du titulaire de l'autorité parentale (art. 9.2.a)** |
| Partage co-parent | Consentement explicite des deux parties (déjà implémenté) |
| Rappels / digest email, push | Consentement (opt-in) |
| Mesure d'audience (GoatCounter auto-hébergé, sans cookie) | Intérêt légitime / exemption CNIL (à documenter, §6) |
| Emails de sécurité (vérification, reset) | Obligation contractuelle / intérêt légitime |

## 2. Inventaire des données (synthèse — 32 tables auditées)

### Données de santé — article 9 (sensibilité maximale)

| Table | Contenu | Chiffrement colonne |
|---|---|---|
| `children` | `diagnosisType` (diagnostic TDAH), tranche d'âge, genre ; **prénom chiffré** (AES-256-GCM) | Partiel (prénom) |
| `symptoms` | scores quotidiens (agitation, attention, humeur, sommeil…), notes libres | Non |
| `journal_entries` | texte libre sur le comportement/santé de l'enfant | Non |
| `medications` + `medication_logs` | nom du médicament, dose, prises, **effets secondaires** (texte libre) | Non |
| `crisis_items` | stratégies de crise de l'enfant | Non |
| `barkley_*` | étapes, comportements cibles, logs quotidiens | Non |
| `care_pathway_progress` | avancement du parcours de soins | Non |
| `parent_mood_logs` | humeur quotidienne **du parent** (santé mentale) | Non |
| `admin_documents` (coffre-fort) | **fichiers médicaux bruts en `bytea`** (bilans, ordonnances, MDPH) | **Non** |
| `ai_recommendations` | suggestions dérivées des données santé (entrées « sanitizées ») | Non |
| `audit_log.summary` | résumés d'activité pouvant contenir des détails santé | **Oui** (AES-256-GCM) |

### Données identifiantes

`user` (nom, email, `stripeCustomerId`), `session` (**IP en clair + user-agent**),
`account` (tokens OAuth, hash mot de passe), `two_factor`, `passkey`,
`child_invitations` (**email d'un tiers**), `subscription`, `push_subscriptions`
(endpoint = identifiant d'appareil), `user_preferences` (hash PIN, timezone),
`consents`, `solidarity_requests` (message libre pouvant révéler une situation
sociale/financière), `nps_responses`, `agent_key` (hash).

### Données techniques

`events` (analytics, `parentId` → **SET NULL** à la suppression : les lignes
survivent), `audit_log` (`actorName` en clair, **survit à la suppression du
compte**), `job_run`, `stripe_webhook_event`, `feature_flags`, `app_settings`.

## 3. Sous-traitants et flux sortants (art. 28 / 30)

| Destinataire | Données transmises | Localisation code |
|---|---|---|
| **Stripe** (paiement) | email, nom, `userId` (metadata) ; état d'abonnement. Effacement propagé à la suppression du compte ✅ | `apps/api/src/lib/stripe.ts`, `routes/billing.ts:153-184`, `routes/account.ts:79-105` |
| **Resend** (email) | nom du parent, email, **prénom de l'enfant** (digest, invitations), **rapport médical complet en HTML** (`/report/send-email`), tokens de reset | `apps/api/src/lib/email.ts`, `email-templates.ts`, `routes/report.ts:108-112` |
| **Services push navigateur** (FCM/Mozilla/Apple) | nom de l'acteur + résumé d'activité co-parent, URL enfant | `apps/api/src/lib/push.ts:127-135` |
| **Google** (OAuth, optionnel) | profil/email à la connexion | `apps/api/src/lib/auth.ts:138-143` |
| GoatCounter (auto-hébergé, first-party) | chemin d'URL (peut contenir un UUID enfant), titre | `apps/web/src/lib/goatcounter.ts` |
| Koe (auto-hébergé) | HMAC du `userId` | `routes/account.ts:541-550` |
| **Boîte personnelle `battistella@proton.me`** | demandes tarif solidaire : nom, email, message libre | `email-templates.ts:223-245`, `env.ts:32` |

Points positifs déjà en place : **aucun appel LLM/IA externe** (le module IA est
dormant, table locale uniquement), **aucun tracker tiers** (garde CI
`scripts/check-no-trackers.mjs`), pas de Sentry/GA/CDN, CSP stricte, IP utilisée
uniquement en mémoire pour le rate-limiting (jamais persistée côté API — mais
Better Auth la stocke dans `session`, voir §8), rapport PDF **généré en mémoire,
jamais stocké** (`routes/report.ts:625-658`).

## 4. Consentements — écarts et implémentation

Ce qui existe déjà (et fonctionne bien) : l'infrastructure `consents`
(append-only, versionnée — `packages/db/src/schema/consents.ts`,
`routes/account.ts:141-208`) et le parcours co-parent complet : attestation
d'autorité parentale de l'invitant + consentement art. 9 explicite de l'invité,
un enregistrement par enfant (`routes/child-invitations.ts:353-357, 631-641`).

Les écarts — les 4 types `terms`, `privacy`, `ai_usage`, `research` sont définis
mais **jamais collectés**, et le front ne consomme jamais l'API consents :

- [x] **P0 — Consentement à l'inscription** : case à cocher CGU + politique de
  confidentialité dans `apps/web/src/routes/register-form.tsx` (aucune case
  aujourd'hui), avec liens vers les pages légales ; insertion des consents
  `terms` + `privacy` à la création du compte (et au premier login Google).
- [x] **P0 — Consentement art. 9 du parent propriétaire** : capturer un
  consentement explicite « traitement des données de santé de mon enfant » +
  attestation d'autorité parentale **à la création du premier profil enfant**
  (dialogue de création, `routes/children.ts` côté API). Aujourd'hui ce
  consentement n'existe que dans le parcours co-parent — jamais pour le
  propriétaire lui-même. Réutiliser les constantes de version de
  `child-invitations.ts:37-40`.
- [x] **P1 — Écran de gestion des consentements** dans `/account` : lister les
  consentements accordés (`GET /consents`) et permettre la révocation. L'API
  existe intégralement, aucun front ne l'appelle.
- [x] **P2 — Âge du titulaire** : attestation « je suis majeur » à l'inscription
  (une phrase sous la case CGU suffit).

## 5. Droits des personnes — écarts et implémentation

Ce qui existe : suppression immédiate avec confirmation typée « DELETE » +
annulation Stripe + suppression du customer + cascade FK complète
(`routes/account.ts:47-111`) ✅ ; suppression différée 30 jours côté API + cron
de purge (`account.ts:119-139`, `jobs/purge-scheduled-deletions.ts`) ✅ ;
export JSON (`account.ts:288-397`) ⚠️ incomplet.

- [x] **P0 — Compléter l'export RGPD** (`GET /account/export`) : il omet
  aujourd'hui `medications` + logs, `crisis_items`, `care_pathway_progress`,
  `routines` + complétions, `parent_mood_logs`, `strengths`,
  `user_preferences`, `push_subscriptions`, `consents`, `nps_responses`,
  `solidarity_requests`, les métadonnées du coffre-fort et les liens
  co-parent. Ajouter aussi le **téléchargement des fichiers du coffre-fort**
  (ou les inclure en base64 dans l'archive). Le trust-bar de la landing promet
  un « export intégral RGPD » — la promesse doit être vraie.
- [x] **P1 — Exposer la suppression différée 30 j dans l'UI** : le dialogue de
  suppression (`_authenticated/account/index.tsx:189-256`) n'appelle que le
  hard-delete immédiat. Proposer les deux options (immédiat / 30 jours
  annulables) — c'est aussi une meilleure UX « tolérance aux erreurs » (CLAUDE.md).
- [x] **P2 — Email de confirmation de suppression** (trace pour l'utilisateur).

## 6. Cookies et mesure d'audience

État : GoatCounter auto-hébergé **sans cookie**, chargé inconditionnellement
(`apps/web/src/main.tsx:14`) ; events first-party (`/api/events`) avec
`sessionStorage` ; **aucune bannière cookies** ; la page légale affirme
« aucun cookie de traçage » (`fr.json`, `legal.cookiesBody`).

- [x] **P0 — Mettre la politique cookies en cohérence** : documenter GoatCounter
  et les events first-party dans `confidentialite` + `mentions-legales`.
  GoatCounter sans cookie, auto-hébergé et sans recoupement peut relever de
  l'**exemption CNIL de consentement** (mesure d'audience) — le documenter
  explicitement plutôt que d'ajouter une bannière inutile (cohérent avec la
  charge cognitive minimale).
- [x] **P1 — Ne pas mettre d'UUID enfant dans les URLs analytics** : le chemin
  envoyé à GoatCounter peut contenir `?child=<uuid>` — strip des query params
  dans `goatcounter.ts:48-62`.

## 7. Emails et push

- [x] **P1 — Passer les rappels en opt-in réel** : `dailyReminderOptIn` et
  `weeklyDigestOptIn` sont `default(true)` en base
  (`packages/db/src/schema/user-preferences.ts:10-24`). Les proposer à
  l'onboarding (défaut décoché) — aligné avec le plan produit qui prévoit un
  « onboarding d'opt-in soigné » pour les rappels.
- [x] **P1 — Header `List-Unsubscribe` + lien de désinscription one-click**
  (token signé, sans session) sur tous les emails non transactionnels
  (`email-templates.ts` — le commentaire lignes 8-11 reconnaît le manque).
- [ ] **P2 — Minimiser le prénom de l'enfant dans les emails** (digest,
  invitations) : initiale plutôt que prénom complet.

## 8. Rétention et minimisation

Aucune purge automatique en base aujourd'hui ; `events` et `audit_log`
survivent délibérément à la suppression du compte.

- [x] **P0 — Politique de rétention écrite** (dans `confidentialite`) avec
  durées par catégorie, puis :
- [~] **P1 — Purge des IP de session** : **déjà couvert** — le job `purge-ips`
  (`apps/api/src/jobs/purge-ips.ts`, règle A7) met `session.ipAddress` à NULL
  au-delà de 24 h. Reste à faire : purge des lignes `session`/`verification`
  expirées (le `user_agent` subsiste) — délégable à Better Auth.
- [x] **P1 — TTL sur `events`** (ex. 13 mois, standard mesure d'audience) et
  anonymisation documentée post-suppression (le SET NULL existant est un bon
  mécanisme, il faut l'assumer par écrit).
- [x] **P2 — TTL ou archivage `audit_log`** (ex. 3 ans) ; `actorName` en clair
  survit à la suppression du compte — à documenter comme intérêt légitime
  (traçabilité vis-à-vis du co-parent) ou à anonymiser.
- [x] **P2 — Purge des invitations expirées** (`child_invitations` garde
  l'email d'un tiers qui n'a jamais consenti).

## 9. Sécurité des données santé au repos

Chiffré aujourd'hui : `children.name`, `audit_log.summary`, secrets 2FA. Tout le
reste est en clair (colonne) et repose sur la sécurité du volume Docker.

- [x] **P1 — Chiffrer le coffre-fort** : `admin_documents.content` contient des
  **fichiers médicaux bruts** — étendre `encryptedText`/`encryption.ts` à un
  `encryptedBytea` (même clé `DB_ENCRYPTION_KEY`). C'est la donnée la plus
  sensible du produit.
- [ ] **P2 — Évaluer le chiffrement des textes libres santé** (`journal_entries.text`,
  `medication_logs.sideEffects`, `symptoms.notes`) — coût : perte du LIKE/tri SQL.
- [ ] **P0 — Backups** : **aucun backup dans le repo** (le volume
  `postgres-data` est le seul exemplaire). Un `pg_dump` chiffré quotidien +
  procédure de restauration testée est autant une obligation RGPD (art. 32,
  disponibilité) qu'une survie produit.
- [x] **P1 — Rediriger le tarif solidaire** vers une boîte dédiée
  (`support@toko.app`) au lieu de la boîte ProtonMail personnelle
  (`SOLIDARITY_NOTIFY_EMAIL`), et mentionner ce traitement dans la politique.
- [x] **P1 — Retirer `isAdmin: true` du compte démo** (`apps/api/src/seed.ts:97-103`) :
  identifiants publics (`demo@toko.app` / `demo1234`, documentés dans CLAUDE.md
  et utilisés en E2E) = **admin partagé accessible à tous**. Le démo n'a besoin
  d'aucun droit admin.
- [x] **P2 — Redaction des `console.error` bruts** dans `lib/audit.ts:52,67`
  (contournent `safe-logger`).

## 10. Pages légales et transparence

- [x] **P0 — Créer la page CGU** (route absente ; le type de consent `terms`
  existe déjà) et la lier à l'inscription.
- [x] **P0 — Compléter `mentions-legales` et `confidentialite`** : responsable
  de traitement nommé, hébergeur nommé (OVH), contact pour l'exercice des
  droits, référence CNIL (droit de réclamation), **durées de rétention
  chiffrées** (aujourd'hui : « tant que le compte est actif »), liste des
  sous-traitants du §3 (Stripe, Resend, services push, Google).
- [x] **P1 — Registre des traitements (art. 30)** : formalisé au §13 ci-dessous.
- [ ] **P2 — AIPD (analyse d'impact)** : traitement de données de santé
  d'enfants à volume croissant → une AIPD sera exigible en approchant du
  lancement public (liste CNIL des traitements requérant une AIPD). La démarrer
  quand la bêta fermée (Phase 3 du plan produit) se termine.

## 11. Accès programmatique (clés API, MCP, CLI)

État : clés en lecture seule, hashées, allowlist deny-by-default excluant
coffre-fort, export, suppression, billing, audit et admin
(`lib/agent-access.ts:11-34`) — bonne base. Écart :

- [ ] **P2 — Scoping des clés par enfant** : une clé donne accès à *tous* les
  enfants du compte, toutes catégories santé confondues. Ajouter un scope
  optionnel `childId` à la création (`routes/agent-keys.ts`).
- [x] **P2 — Mentionner l'accès programmatique dans la politique de
  confidentialité** : fait (`privacy.sharingBody` précise que les données
  transitent vers l'outil tiers connecté sous la responsabilité du parent).

## 12. Récapitulatif priorisé

**P0 — avant la bêta fermée (Phase 3 du plan produit) :**
consentement inscription (CGU/privacy) · consentement art. 9 du propriétaire à
la création d'enfant · page CGU + pages légales complétées · export RGPD complet ·
politique cookies cohérente · politique de rétention écrite · backups chiffrés.

**P1 — pendant la bêta :** UI suppression 30 j · écran consentements ·
opt-in réel des rappels + List-Unsubscribe · chiffrement du coffre-fort · purge
sessions/verification · TTL events · boîte solidaire dédiée · démo sans admin ·
strip des query params analytics.

**P2 — avant le lancement public :** AIPD · registre art. 30 formalisé · TTL
audit_log · scoping des clés API · chiffrement des textes libres santé ·
attestation majorité · minimisation prénom dans les emails.

## 13. Registre des traitements (art. 30 RGPD)

| Traitement | Finalité | Base légale | Catégories de données | Personnes | Destinataires / sous-traitants | Durée de conservation |
|---|---|---|---|---|---|---|
| Compte & authentification | Créer et sécuriser l'accès | Contrat (6.1.b) | Nom, email, mot de passe (haché), sessions, 2FA/passkey | Parent | — (interne) ; Google si OAuth | Vie du compte ; effacement ≤ 30 j après demande ; IP de session purgée < 24 h |
| Suivi santé de l'enfant | Aider au suivi et préparer les rendez-vous | Consentement art. 9.2.a | Symptômes, journal, médicaments, effets secondaires, crises, routines, parcours de soins, Barkley | Enfant | — (interne, UE) | Vie du compte ; effacement à la suppression (cascade) |
| Coffre-fort documents | Conserver les documents médicaux/administratifs | Consentement art. 9.2.a | Fichiers médicaux (chiffrés au repos) | Enfant | — (interne, UE) | Vie du compte ; effacement à la suppression |
| Rapport médical | Générer/partager un rapport pour le praticien | Consentement / action du parent | Profil santé consolidé | Enfant, praticien destinataire | Resend (envoi email, UE) ; jamais stocké côté serveur | Non conservé (généré à la volée) |
| Facturation | Gérer l'abonnement | Contrat (6.1.b) | Email, nom, état d'abonnement, `stripeCustomerId` | Parent | Stripe (Irlande/UE) | Vie de l'abonnement ; effacement Stripe propagé à la suppression |
| Rappels & digest email | Aider à la régularité du suivi | Consentement (opt-in, désabonnement 1-clic) | Email, prénom parent/enfant | Parent | Resend (UE) | Tant qu'opt-in actif |
| Notifications push | Informer de l'activité co-parent | Consentement (opt-in) | Endpoint d'appareil, résumé d'activité | Parent | Services push navigateur (FCM/Mozilla/Apple) | Jusqu'à désinscription |
| Mesure d'audience | Améliorer le produit | Intérêt légitime (sans cookie) | Chemin d'URL (sans query), titre | Parent | GoatCounter auto-hébergé (UE) | Événements : 13 mois (`purge-retention`) |
| Support / tarif solidaire | Répondre aux demandes | Intérêt légitime | Email, message libre | Parent | Boîte support (UE) | Durée de traitement de la demande |
| Audit & journalisation | Traçabilité, sécurité | Intérêt légitime | Actions, `actorName`, résumé (chiffré) | Parent, co-parent | — (interne) | À borner (TTL `audit_log` — P2 en cours) |

Sous-traitants (art. 28) : **Stripe** (paiement, UE), **Resend** (email, UE),
**Google** (OAuth, optionnel), services **push** navigateur. Aucun transfert hors
UE ; aucun appel à un LLM/IA externe ; aucun tracker tiers.

---

*Sources : audit de code exhaustif (schéma `packages/db/src/schema/`, routes
`apps/api/src/routes/`, front `apps/web/src/`), juillet 2026. Ce document doit
être mis à jour à chaque nouvelle table ou nouveau flux sortant.*

# Audit SOLID

Analyse de conformité du code Tokō aux cinq principes SOLID, notation avant
et après la campagne de refactoring de septembre 2026.

> **Périmètre** — `apps/api`, `apps/web`, `packages/db`, `packages/validators`.
> Les fichiers de données (`resources-data.tsx`, `barkley-quizzes.ts`,
> `knowledge.ts`) sont exclus : ce sont des contenus, pas de la logique, et
> leur taille n'est pas un défaut de conception.

## Note globale

| Principe | Avant | Après |
|---|---|---|
| **S** — Responsabilité unique | 2,5 | 4,7 |
| **O** — Ouvert/fermé | 3,0 | 4,6 |
| **L** — Substitution de Liskov | 4,0 | 4,7 |
| **I** — Ségrégation des interfaces | 3,0 | 4,5 |
| **D** — Inversion des dépendances | 2,5 | 4,3 |
| **Global** | **3,0 / 5** | **4,56 / 5** |

Tests unitaires : **296 → 378** (API : 168 → 250). Aucune régression ;
`pnpm typecheck`, `pnpm test` et le build web passent à chaque étape.

---

## S — Responsabilité unique

### Constat initial (2,5 / 5)

Les routes HTTP cumulaient transport, autorisation, agrégation, règles
métier et présentation. Trois cas extrêmes :

| Module | Lignes | Responsabilités |
|---|---|---|
| `routes/report.ts` | 1064 | HTTP, agrégation sur 7 tables, rendu HTML, rendu PDF, envoi d'email |
| `routes/billing.ts` | 1012 | Checkout, portail, annulation/reprise/pause, mapping Stripe→BDD, vérification de signature, registre d'idempotence, `switch` de 140 lignes |
| `routes/account.ts` | 697 | Effacement RGPD, consentements, NPS, export de données, hachage du code PIN, deux lectures de profil |

`jobs/email-jobs.ts` (636 lignes) contenait cinq planifications sans rapport
entre elles. `routes/stats.ts` mélangeait requêtes et arithmétique du tableau
de bord. Côté web, `routines-page.tsx` (1393 lignes) réunissait la page, cinq
composants, un reducer et les helpers de créneaux horaires.

### Après (4,7 / 5)

| Module | Avant | Après |
|---|---|---|
| `routes/report.ts` | 1064 | **161** (+ `lib/report/{range,data,html,pdf}`) |
| `routes/billing.ts` | 1012 | **574** (+ `routes/stripe-webhook.ts`, `lib/billing/{webhook-ledger,webhook-handlers,subscription-sync}`) |
| `routes/account.ts` | 697 | **6 sous-routeurs** sous `routes/account/` + `lib/account/` |
| `jobs/email-jobs.ts` | 636 | **un fichier par job** sous `jobs/email/` |
| `routes/stats.ts` | 435 | **307** (+ `lib/stats/{metrics,correlation}`) |
| `routines-page.tsx` | 1393 | **305** (+ 6 fichiers voisins) |

Règle appliquée : **une route ne fait que du transport** — authentifier,
valider, déléguer, mettre en forme la réponse.

Il reste deux modules au-dessus de 600 lignes (`routes/child-invitations.ts`,
`routes/admin-analytics.ts`). Ils sont cohésifs — un seul domaine chacun — mais
ce sont les prochains candidats.

## O — Ouvert/fermé

### Constat initial (3,0 / 5)

Bon exemple existant : le registre `JOB_DEFS` (ajouter un job = une entrée).

Mais ajouter une entité chronologique liée à un enfant demandait de **copier
180 lignes de route et 130 lignes de hook** : `routes/symptoms.ts` et
`routes/journal.ts` étaient le même fichier à deux noms près (contrôle
d'accès, fenêtre d'historique du plan gratuit, écriture d'audit, attribution
au co-parent). Ajouter un événement Stripe demandait de modifier la fonction
qui gère aussi la vérification de signature. Ajouter une section au PDF
demandait de modifier `buildReportPdf`.

### Après (4,6 / 5)

- `createChildTimelineRoutes(config)` : une nouvelle entité chronologique est
  un objet de configuration (33 et 27 lignes pour symptoms et journal).
- `STRIPE_WEBHOOK_HANDLERS` : un nouvel événement est une entrée de map ;
  `routes/stripe-webhook.ts` ne change plus.
- `REPORT_PDF_SECTIONS` : une nouvelle section du rapport est une entrée de
  tableau.
- `useOptimisticListMutation` : une nouvelle liste optimiste côté web est
  quatre paramètres, pas un nouveau bloc *cancel → snapshot → rollback*.

## L — Substitution de Liskov

### Constat initial (4,0 / 5) et après (4,7 / 5)

Peu de hiérarchies : `AppError` et `ApiError` étendent `Error` correctement.
Le principal écart n'était pas une classe mais un **contrat** : trois formes
de réponse 422 coexistaient (`{error, details}`, `{error, issues}`, `{error}`
seul), sur 54 sites, donc la réponse dépendait de la route touchée. Un seul
contrat désormais (`ValidationError` + le gestionnaire d'erreurs central), assorti
d'un test qui vérifie la forme rendue.

`errorHandler` ne fait plus de `as any` sur le code de statut.

## I — Ségrégation des interfaces

### Constat initial (3,0 / 5)

`ReportData` — un type de 25 champs — était passé entier à dix fonctions de
rendu dont la plupart n'en lisaient qu'un seul : `renderCrisisList` recevait
les traitements médicamenteux, les entrées de journal et le programme
Barkley.

`AppEnv.Variables.session` était déclaré obligatoire alors que
`authMiddleware` ne le renseigne que pour l'authentification par cookie : une
requête par clé d'agent n'en a pas. Le type promettait ce que le middleware
ne livrait pas.

### Après (4,5 / 5)

Chaque fonction de rendu prend la tranche qu'elle dessine
(`Pick<ReportData, "crisisItems">`) : `renderCrisisList` ne *peut plus*
dépendre des traitements. `session` est optionnel.

## D — Inversion des dépendances

### Constat initial (2,5 / 5)

`sendEmail` était un `fetch` vers `api.resend.com`. Routes, jobs et handlers
de webhook en dépendaient directement — impossible de vérifier qu'un email
part sans stub réseau.

### Après (4,3 / 5)

`EmailProvider` est un port ; `resendEmailProvider` en est une
implémentation, `createRecordingEmailProvider()` une autre pour les tests.
**Aucun appelant n'a changé.**

`db` reste importé directement par les modules `lib/`. C'est **délibéré** :
Drizzle est déjà une abstraction typée du SQL, et interposer un pattern
Repository sur 30 tables ajouterait une couche que personne ne substituerait
jamais. La frontière utile est ailleurs, et elle existe : `lib/child-access`,
`lib/premium`, `lib/stats`, `lib/report/data` isolent les décisions métier
des requêtes.

---

## Ce que le refactoring a rendu testable

La mesure la plus parlante n'est pas le nombre de lignes mais ce qui est
désormais vérifiable. Ces fonctions existaient déjà — elles étaient
simplement enfermées dans des routes de 700 à 1000 lignes, donc inatteignables
sans requête authentifiée et base de données :

| Extrait vers | Ce que ça protège | Tests |
|---|---|---|
| `lib/stats/metrics` | Série de jours, tendance d'humeur, score de régularité, meilleur/pire jour | 23 |
| `lib/stats/correlation` | Le seul constat que Tokō ose formuler sur un enfant, et les seuils qui décident de se taire | 8 |
| `jobs/email/shared` | L'heure locale du parent — un email de rappel à 3 h du matin | 10 |
| `lib/account/lock-pin` | Le hachage du code PIN parental | 15 (dont 4 nouveaux) |
| `lib/report/range` | La période couverte par le rapport médical | 7 |
| `lib/email` | Le port d'envoi d'email | 4 |
| `lib/http/validate` | Le contrat 422 unique | 4 |
| `lib/billing/webhook-*` | Le registre d'événements Stripe et le garde-fou `demo_` | 6 |
| `routes/account` | Les 16 points d'entrée du routeur compte | 16 |

`lock-pin.test.ts` mérite une mention : `hashPin` étant privée à un fichier de
700 lignes, le test **réimplémentait la fonction et testait sa copie**. Le
code livré n'était pas couvert. Il l'est maintenant.

## Duplication supprimée

| Élément | Avant | Après |
|---|---|---|
| Réponse 422 construite à la main | 54 sites, 3 formes | 1 contrat |
| `escapeHtml` | 3 copies | 1 |
| Formateur de date longue en français | 3 copies | 1 |
| `PERIOD_DAYS` | 2 copies, 2 valeurs par défaut différentes | 1 |
| Route d'entité chronologique | 2 × 180 lignes | 1 fabrique + 2 configs |
| Bloc de mutation optimiste | 6 blocs | 1 hook |

## Changements de comportement assumés

Trois, tous volontaires et signalés en revue :

1. `PATCH /api/journal/:id` sur une entrée inexistante répond **404** au lieu
   d'un corps `null` — aligné sur `symptoms`, qui répondait déjà 404.
2. Les réponses 422 portent désormais toutes `code: "VALIDATION"` et
   `details`. Aucun client ne lisait `issues` ni `details` (vérifié sur
   `apps/web`, `apps/mobile`, `e2e`).
3. `POST /api/children` valide `healthDataConsent` via le schéma. Sans cela,
   `parseBody` aurait silencieusement supprimé le champ — et le consentement
   RGPD Art. 9 avec lui.

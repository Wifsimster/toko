# Application Android (décision d'architecture)

Document de décision pour la déclinaison Android de Tokō et la production
d'un APK / AAB publiable sur le Play Store.

> **Statut** : proposition (à valider). Issue d'un atelier d'analyse
> codebase + recherche menée par sous-agents.

## Question posée

Faut-il ajouter l'application Android **directement dans le monorepo**, ou
créer un **dépôt séparé** qui attaque le backend et la base de données déjà
déployés de la version web ?

## Décision en une ligne

**TWA d'abord** (le PWA est déjà prêt), **monorepo toujours**, **abonnement
Stripe sur le web d'abord**, **Expo uniquement si une fonctionnalité native
l'impose.**

## Recommandation

| Sujet | Décision |
|-------|----------|
| Technologie | **Trusted Web Activity (TWA)** enrobant le PWA existant |
| Emplacement | **Monorepo** : nouveau package `apps/android` |
| Backend | Inchangé — l'app mobile est **un client de plus** de l'API déployée |
| Auth | **Aucun changement** (cookies de session, comme sur le web) |
| Paiement | Abonnement **sur le web (Stripe)** ; l'app lit le droit d'accès |
| Repli | **Expo / React Native** si un besoin natif concret apparaît |

## Pourquoi le monorepo plutôt qu'un dépôt séparé

1. **Réutilisation des validateurs** — `@focusflow/validators` est un package
   `private`, non publié, exporté en `./src/index.ts` et résolu par les
   workspaces pnpm. Un client mobile TypeScript ne peut le réutiliser
   « gratuitement » que **dans le monorepo** (dépendance `workspace:*`). Un
   dépôt séparé imposerait de publier le package sur un registre privé →
   machinerie de release et risque de désynchronisation de versions.
2. **Source de vérité unique** — règles de validation et types TS restent
   partagés entre web, API et mobile, sans dérive.
3. **Backend déjà déployé** — c'est le facteur décisif : pas de réarchitecture,
   pas de nouveau déploiement, pas de nouvelle base. Le mobile pointe sur
   l'origine API existante.
4. **CI isolée** — l'outillage natif (Gradle, SDK Android) **ne rejoint pas**
   le graphe Turborepo. Il vit dans un job GitHub Actions dédié, déclenché sur
   tag/`workflow_dispatch`, qui ne ralentit jamais le pipeline JS/Docker.

**Un dépôt séparé ne se justifierait que** si le mobile était confié à une
autre équipe/prestataire, ou pour une isolation de build stricte assumée (avec
publication de `@focusflow/validators` sur un registre privé). Pour une petite
équipe interne, c'est du surcoût net.

## Pourquoi une TWA plutôt qu'un développement natif

Le web de Tokō est **déjà un vrai PWA** :

- `apps/web/vite.config.ts` — service worker (Workbox), cache offline runtime,
  Web Push via `push-sw.js`.
- `apps/web/public/manifest.webmanifest` — `display: standalone`, icônes
  maskables 192/512, couleur de thème, `start_url: /dashboard`.

Une TWA affiche ce site en plein écran (Chrome Custom Tabs), validé par un
**Digital Asset Link** (`.well-known/assetlinks.json`). Outils :
**Bubblewrap** (CLI) ou **PWABuilder** (GUI) produisent un APK signé (test) +
un AAB (Play Store).

| Option | Réutilisation types/validateurs | Réutilisation UI | Vélocité | Maintenance petite équipe |
|--------|-------------------------------|-----------------|----------|---------------------------|
| **TWA / PWA** | 100 % | 100 % | ★★★★★ | ★★★★★ (un seul code) |
| Expo / React Native | Haute (monorepo) | Nulle (réécriture) | ★★★ | ★★★ (2ᵉ frontend) |
| React Native nu | Haute | Nulle | ★★ | ★★ |
| Kotlin natif | Nulle | Nulle | ★ | ★ (compétence absente) |
| Kotlin Multiplatform | Nulle (TS ≠ Kotlin) | Nulle | ★ | ★ |

**Pourquoi la TWA gagne ici** : l'UI est faite de formulaires, listes et
graphiques Recharts — aucun besoin natif (caméra, Bluetooth, capteurs) dans la
surface API. Réutilisation totale, **zéro réécriture**, **zéro divergence**
avec l'UX « TDAH-simple » déjà auditée (charge cognitive minimale, cohérence).
shadcn/ui, TailwindCSS-web, TanStack Router et Recharts sont des librairies DOM
qui **ne tournent pas** en React Native — passer à Expo signifierait réécrire
tous les écrans.

> **Garde-fou Play Store** : la revue « minimum functionality » rejette les
> simples WebView. Un vrai PWA installable avec offline + push (ce que nous
> avons déjà) passe ce seuil ; un wrapper naïf non.

## Authentification mobile

Backend actuel (`apps/api/src/lib/auth.ts`) : Better Auth 1.5.6, **sessions par
cookie** (30 j), `trustedOrigins`, plugins 2FA + passkey. CORS Hono
(`apps/api/src/app.ts`) : `credentials: true`, `CORS_ORIGIN` unique.

- **En TWA : aucun changement.** La TWA exécute le vrai site dans un contexte
  navigateur, cookies first-party sur notre propre origine. Cookies, 2FA,
  passkeys, Google OAuth : tout fonctionne comme sur le web. **Zéro travail
  backend d'auth.**
- **En Expo (repli) : changements additifs, non cassants.**
  1. Ajouter le plugin serveur `expo()` (cookies stockés via
     `expo-secure-store`, rejoués en en-têtes — même modèle de session).
  2. Ajouter le scheme de l'app (`toko://`, + `exp://` en dev) à
     `trustedOrigins`.
  3. Client : `@better-auth/expo` + `expo-secure-store`.
  4. CORS : rendre `cors.origin` tolérant au scheme de l'app (additif).
  - Échappatoire pour clients non-navigateur : plugin **Bearer** de Better Auth
    (jetons `Authorization: Bearer …`).

## Paiement / facturation (point sensible)

Facturation actuelle : **Stripe Checkout** (abonnements « Famille »
mensuel/annuel, `apps/api/src/lib/stripe.ts`). Le web reste 100 % Stripe.

**Règle générale Play** : la vente de biens numériques *dans* l'app doit passer
par **Google Play Billing** (frais 15–30 %). Contexte 2025/2026 en évolution :

- **EEA / DMA** (pertinent — app française) : *external offers program*, on peut
  informer/lier vers une offre externe, conditions et frais évolutifs.
- **US** (post-injonction Epic, oct. 2025) : ouverture au billing tiers,
  enrôlement requis avant **28 janv. 2026** ; régime transitoire jusqu'à
  **nov. 2027**, susceptible d'évoluer (audience règlement **22 janv. 2026**).

**Stratégie retenue (par ordre de simplicité) :**

1. **Abonnement web uniquement, app « reader »** *(point de départ recommandé)*
   — ne rien vendre dans l'app Android. L'utilisateur s'abonne sur le web
   (Stripe), l'app **lit le droit d'accès** et débloque le premium. Sans frais,
   sans complexité. Message neutre « gérez votre abonnement sur le site », sans
   incitation in-app agressive tant que l'enrôlement au programme adéquat n'est
   pas confirmé.
2. **Enrôlement au programme *external offers* (EEA)** — garde Stripe, permet de
   lier/informer légalement, frais réduits mais non nuls.
3. **Intégrer Google Play Billing** — conformité maximale et meilleure UX
   d'achat in-app, mais 15–30 %, second système à réconcilier avec Stripe,
   vérification serveur des achats. Sur-ingénierie tant que la conversion
   in-app n'est pas un levier prouvé.

> ⚠️ **Incertitude à lever à l'implémentation** : les règles exactes de
> *steering* in-app et les frais sont en mouvement (audience US 22 janv. 2026 ;
> conditions EEA changeantes). Revérifier les pages Play Console et idéalement
> obtenir un avis juridique avant toute incitation in-app.

## Release & distribution de l'APK / AAB (TWA)

1. **Génération** : `bubblewrap init --manifest https://<domaine>/manifest.webmanifest`
   puis `bubblewrap build` → `app-release-signed.apk` (test) +
   `app-release-bundle.aab` (Play).
2. **Digital Asset Links** : héberger `assetlinks.json` à
   `https://<domaine>/.well-known/assetlinks.json` (empreinte SHA-256 du
   certificat de signature). À placer dans `apps/web/public/.well-known/` pour
   qu'il soit livré avec le frontend déployé (Hono/Traefik le sert déjà).
3. **Signature** : keystore + mots de passe en **secrets GitHub Actions**,
   jamais dans le repo. Activer **Play App Signing**.
4. **CI** : workflow dédié (`setup-java`, SDK Android, Bubblewrap), déclenché
   sur tag `mobile-v*` ou `workflow_dispatch` — **jamais** sur les push de
   routine.
5. **Distribution** : piste **Internal Testing** (≤ 100 testeurs) pour valider
   la revue Play, puis Closed/Open → Production. Note : un **AAB ne se
   distribue que via Play** ; l'APK direct (sideload) reste pour démo/interne.

> En repli Expo : **EAS Build** (AAB/APK signés) + **EAS Submit** (clé de
> compte de service Google en secret GH) pour publier sur la piste `internal`.

## Architecture cible

```
toko/  (monorepo existant — backend inchangé)
├── apps/
│   ├── api/        # Hono — déjà déployé ; le mobile est juste un client
│   ├── web/        # PWA React — manifest + SW + Web Push déjà en place
│   │   └── public/.well-known/assetlinks.json   # NOUVEAU : Digital Asset Link
│   └── android/    # NOUVEAU : projet TWA Bubblewrap (généré, rarement édité)
│                   #          exclu du `turbo build` par défaut
├── packages/
│   ├── validators/ # @focusflow/validators — inchangé, source de vérité unique
│   └── db/
└── .github/workflows/
    ├── ci.yml / release.yml   # pipeline backend inchangé
    └── android-release.yml     # NOUVEAU : build mobile, gated sur tag mobile-v*
```

```mermaid
graph TD
    A[App Android TWA] -->|enrobe| B[PWA web déployé]
    B -->|Fetch REST + cookie| C[API Hono déployée]
    C -->|Drizzle| D[PostgreSQL]
    C -->|Webhooks| E[Stripe]
    A -.assetlinks.json.-> B
    F[apps/android Bubblewrap] -->|génère| G[APK / AAB]
    G -->|Internal Testing| H[Play Store]
```

## Plan de mise en œuvre (TWA)

1. **Préparer le PWA pour la TWA** — vérifier que le manifest est complet
   (déjà le cas) et choisir un `start_url` adapté à l'ouverture mobile.
2. **Publier `assetlinks.json`** — ajouter `apps/web/public/.well-known/assetlinks.json`
   avec l'empreinte SHA-256 du certificat de signature (Play App Signing).
3. **Générer le projet** — `apps/android/` via Bubblewrap, exclu du
   `turbo build` par défaut, avec son propre `versionCode`/`versionName`.
4. **Workflow `android-release.yml`** — déclenché sur tag `mobile-v*`, secrets
   keystore, sortie AAB téléversée sur la piste Internal Testing.
5. **Abonnement** — laisser l'achat sur le web ; l'app lit `GET /api/billing/status`
   pour débloquer le premium. Enrôler le compte au programme *external offers*
   EEA avant toute incitation in-app.
6. **Repli Expo** — décider à l'avance de migrer la cible Android vers Expo
   (toujours en monorepo, validateurs réutilisés, `@better-auth/expo`)
   **uniquement** si un besoin natif concret bloque la TWA.

## Sources

- Better Auth — [Expo](https://better-auth.com/docs/integrations/expo),
  [Bearer plugin](https://better-auth.com/docs/plugins/bearer)
- Google Play — [Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818),
  [US billing update](https://support.google.com/googleplay/android-developer/answer/15582165),
  [EEA external offers](https://support.google.com/googleplay/android-developer/answer/16505463)
- Expo — [EAS Build](https://docs.expo.dev/build/introduction/),
  [App signing](https://docs.expo.dev/app-signing/app-credentials/)
- [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap),
  [Trusted Web Activities](https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2),
  [PWA in Play (codelab)](https://developers.google.com/codelabs/pwa-in-play)

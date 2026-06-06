# Application Android (décision d'architecture)

Document de décision pour la déclinaison Android de Tokō et la production
d'un APK / AAB publiable sur le Play Store.

> **Statut** : adopté. Issu d'un atelier d'analyse codebase + recherche
> (sous-agents), puis d'un « grill » contradictoire qui a fait évoluer la
> décision (voir _Historique de décision_ en fin de document).

## Question posée

Faut-il ajouter l'application Android **directement dans le monorepo**, ou
créer un **dépôt séparé** qui attaque le backend et la base de données déjà
déployés de la version web ? Et avec quelle technologie ?

## Décision en une ligne

**Expo / React Native, dans le monorepo**, client de l'API déjà déployée,
notifications natives, abonnement sur le web.

## Recommandation

| Sujet | Décision |
|-------|----------|
| Technologie | **Expo / React Native** (UI native) |
| Emplacement | **Monorepo** : package `apps/mobile`, isolé du graphe JS racine |
| Backend | Inchangé — l'app mobile est **un client de plus** de l'API déployée |
| Auth | Plugin **`@better-auth/expo`** (cookies en SecureStore) — additif, non cassant |
| Notifications | **`expo-notifications`** (locales planifiées + FCM) — l'OS possède l'horaire |
| Paiement | Abonnement **sur le web (Stripe)** ; l'app lit le droit d'accès |
| Build / release | **EAS Build** → AAB/APK, piste Play Internal Testing |

## Le facteur décisif : le rappel du soir doit être fiable

La règle métier (`docs/offline-strategy.md`) place le check-in du soir entre
**16h30 et 21h00** au cœur du produit. Un rappel programmé à cette heure-là est
une **notification planifiée et sensible au temps** — précisément l'angle mort
du web :

- Les PWA/TWA **ne garantissent pas la planification** quand l'app est en
  arrière-plan ou fermée ; les navigateurs privilégient la batterie. Conseil
  unanime des sources : _« si les notifications sont une promesse centrale,
  laissez l'OS posséder la planification. »_
- En TWA, des bugs documentés font que la notification atterrit sur le PWA
  installé, **pas** sur la TWA.

Comme la fiabilité de ce rappel est **non négociable**, l'OS doit posséder la
planification → **app native**. `expo-notifications` fournit les notifications
locales planifiées (horaire garanti par l'OS) + FCM, avec canal Android dédié,
niveau d'importance et `SCHEDULE_EXACT_ALARM` (Android 14). C'est ce point, et
lui seul, qui élimine la voie TWA.

## Pourquoi Expo plutôt que natif Kotlin / KMP

| Option | Réutilisation types/validateurs | Compétence équipe | Notif. natives | Verdict |
|--------|-------------------------------|-------------------|----------------|---------|
| **Expo / React Native** | Haute (monorepo, TS) | React/TS ✅ | ✅ | **Retenu** |
| Kotlin / Jetpack Compose | Nulle (réécriture Kotlin) | absente | ✅ | Rejeté |
| Kotlin Multiplatform | Nulle (logique en TS) | absente | ✅ | Rejeté |
| TWA / PWA enrobé | 100 % mais **0 code natif** | React/TS ✅ | ❌ (web push) | **Rejeté** (rappel non fiable) |

Pour une équipe React/TypeScript, Expo donne les notifications natives **et**
réutilise `@focusflow/validators` + les types via le monorepo. Kotlin/KMP
jettent ce capital sans bénéfice ici (UI = formulaires + listes + graphes,
aucun besoin natif exotique).

> **iOS** : hors périmètre (produit Android-only assumé). Expo garde toutefois
> la porte iOS ouverte sans réécriture si la décision change.

## Pourquoi le monorepo plutôt qu'un dépôt séparé

1. **Réutilisation des validateurs** — `@focusflow/validators` est un package
   `private`, non publié (`main: ./src/index.ts`). Un client mobile TypeScript
   ne le réutilise « gratuitement » que **dans le monorepo**. Un dépôt séparé
   imposerait de le publier sur un registre privé → release et risque de
   désynchronisation de versions.
2. **Source de vérité unique** — règles de validation et types TS partagés
   entre web, API et mobile, sans dérive.
3. **Backend déjà déployé** — facteur décisif de simplicité : pas de
   réarchitecture, pas de nouveau déploiement, pas de nouvelle base. Le mobile
   pointe sur l'origine API existante.
4. **Isolation du build natif** — l'outillage natif (Gradle, SDK Android, EAS)
   **ne rejoint pas** le graphe Turborepo. `apps/mobile` est **exclu du
   `pnpm install` racine** (`!apps/mobile` dans `pnpm-workspace.yaml`) ; il a
   ses propres dépendances installées par EAS au build. Les validateurs sont
   partagés par la **source** (lien `file:` + résolution Metro), pas par le
   lockfile racine. Résultat : la CI JS/Docker existante reste intacte.

**Un dépôt séparé ne se justifierait que** si le mobile était confié à une
autre équipe/prestataire. Pour une petite équipe interne, c'est du surcoût net.

## Authentification mobile

Backend actuel (`apps/api/src/lib/auth.ts`) : Better Auth 1.5.6, **sessions par
cookie** (30 j), `trustedOrigins`, plugins 2FA + passkey. CORS Hono
(`apps/api/src/app.ts`) : `credentials: true`, `CORS_ORIGIN` unique.

Changements backend **additifs et non cassants** :

1. Ajouter le plugin serveur `expo()` (cookies stockés via `expo-secure-store`,
   rejoués en en-têtes — même modèle de session).
2. Ajouter le scheme de l'app (`toko://`, + `exp://` en dev) à `trustedOrigins`.
3. Côté client : `@better-auth/expo` + `expo-secure-store` ;
   `authClient.getCookie()` fournit le cookie à attacher aux appels API.
4. CORS : rendre `cors.origin` tolérant au scheme de l'app (prédicat additif).

Aucun changement cassant pour l'auth web existante.

## Paiement / facturation

Facturation actuelle : **Stripe Checkout** (`apps/api/src/lib/stripe.ts`). Le
web reste 100 % Stripe.

**Décision : abonnement sur le web uniquement, app « reader ».** On ne vend
rien dans l'app Android : l'utilisateur s'abonne sur le web (Stripe), l'app
**lit le droit d'accès** via `GET /api/billing/status` et débloque le premium.
Pas de Google Play Billing (15–30 %), pas de zone grise « checkout Stripe dans
une webview ». L'achat se fait dans le **navigateur externe** (`expo-web-browser`),
clairement hors de l'app.

> ⚠️ Si la conversion in-app devient un levier prouvé, réévaluer le programme
> *external offers* EEA ou Google Play Billing — politique Play en évolution
> (audience US 22 janv. 2026 ; conditions EEA changeantes), à revérifier.

## Release & distribution (EAS)

- **EAS Build** produit un AAB (Play) signé et un APK (sideload/test) ; EAS gère
  le keystore (jamais commité).
- **EAS Submit** téléverse sur la piste **Internal Testing** via une clé de
  **compte de service Google** (secret GitHub).
- **CI** : workflow dédié `.github/workflows/android-release.yml`, déclenché sur
  tag `mobile-v*` ou `workflow_dispatch` — **jamais** sur les push de routine.
  Le mobile a son propre `versionCode`/`versionName`, découplé du tag Docker.
- **Secrets requis** : `EXPO_TOKEN` (EAS), `GOOGLE_SERVICE_ACCOUNT_KEY_JSON`
  (Play Submit).

## Architecture cible

```
toko/  (monorepo existant — backend inchangé)
├── apps/
│   ├── api/        # Hono — déjà déployé ; le mobile est juste un client
│   ├── web/        # PWA React — inchangé (reste l'app web/desktop)
│   └── mobile/     # NOUVEAU : Expo / React Native
│                   #   exclu du pnpm install racine (!apps/mobile)
│                   #   buildé par EAS ; valide via @focusflow/validators
├── packages/
│   ├── validators/ # @focusflow/validators — source de vérité partagée
│   └── db/
└── .github/workflows/
    ├── ci.yml / release.yml      # pipeline backend inchangé
    └── android-release.yml        # NOUVEAU : EAS build, gated sur tag mobile-v*
```

```mermaid
graph TD
    A[App Android Expo/RN] -->|Fetch REST + cookie SecureStore| C[API Hono déployée]
    A -->|expo-notifications| N[Rappel du soir natif planifié OS]
    A -->|@focusflow/validators| V[Schémas Zod partagés]
    A -->|expo-web-browser| W[Abonnement web Stripe]
    C -->|Drizzle| D[PostgreSQL]
    C -->|GET /api/billing/status| A
    E[EAS Build] -->|AAB/APK signé| P[Play Internal Testing]
```

## Plan de mise en œuvre

1. **Scaffold `apps/mobile`** (fait) — Expo, isolé du workspace racine,
   réutilise `@focusflow/validators`, client API + auth + notifications.
2. **Workflow `android-release.yml`** (fait) — EAS build/submit, gated tag.
3. **Auth backend additive** — plugin `expo()` + scheme dans `trustedOrigins`
   + prédicat CORS (à faire quand le flux mobile est branché).
4. **Migration des écrans** — porter progressivement les écrans web (NativeWind
   pour Tailwind, Victory Native pour les graphes Recharts), en commençant par
   le **check-in du soir** (fonction critique) et l'auth.
5. **Abonnement** — `GET /api/billing/status` pour le droit d'accès ; achat via
   navigateur externe.
6. **Secrets CI** — `EXPO_TOKEN`, `GOOGLE_SERVICE_ACCOUNT_KEY_JSON`.

## Historique de décision

1. **TWA-first** (initial) — le PWA existant enrobé en APK, réutilisation 100 %.
2. **Grill contradictoire** — trois facteurs testés : iOS, fiabilité des
   notifications, paiement in-app.
3. **Pivot** — iOS écarté (Android-only) ; paiement web confirmé ; **le rappel
   du soir jugé critique et sa planification fiable vérifiée comme infaisable en
   PWA/TWA** → bascule vers **Expo / React Native**, seul à donner des
   notifications dont l'OS possède l'horaire.

## Sources

- Better Auth — [Expo](https://better-auth.com/docs/integrations/expo),
  [Bearer plugin](https://better-auth.com/docs/plugins/bearer)
- [PWA notifications limits (DEV)](https://dev.to/nishchaldev/when-notifications-matter-pwas-start-to-show-their-limits-5ebl),
  [PWA push reliability iOS/Android (Edana)](https://edana.ch/en/2026/03/19/push-notifications-on-web-applications-pwa-is-it-really-reliable-on-ios-and-android/),
  [TWA web-push bug (PWABuilder #3788)](https://github.com/pwa-builder/PWABuilder/issues/3788)
- Expo — [EAS Build](https://docs.expo.dev/build/introduction/),
  [Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/),
  [App signing](https://docs.expo.dev/app-signing/app-credentials/)
- Google Play — [Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818),
  [EEA external offers](https://support.google.com/googleplay/android-developer/answer/16505463)

# @focusflow/mobile — App Android Tokō (Expo / React Native)

Client mobile natif de Tokō. Consomme l'**API Hono déjà déployée** (même
backend et même base que le web). Décision d'architecture complète :
[`docs/android-app.md`](../../docs/android-app.md).

## Pourquoi natif (Expo) et pas une TWA

Le rappel du soir (16h30–21h00) est une fonction centrale qui doit être
**fiable**. Une notification planifiée et sensible au temps n'est pas garantie
par un PWA/TWA quand l'app est fermée — seul l'OS peut la posséder. D'où le
choix natif via `expo-notifications`. Voir `src/lib/notifications.ts`.

## Isolation monorepo

Ce package est **exclu du `pnpm install` racine** (`!apps/mobile` dans
`pnpm-workspace.yaml`) pour que ses dépendances natives ne touchent jamais le
pipeline JS/Docker. Il a son propre install, géré par EAS au build. Les
schémas Zod `@focusflow/validators` sont partagés **par la source** (lien
`file:` + résolution Metro/TS), gardant une source de vérité unique.

## Développement

```bash
cd apps/mobile
pnpm install          # install isolé (hors workspace racine)
pnpm start            # Metro / Expo Dev
pnpm android          # build natif local (nécessite le SDK Android)
```

Configurer l'URL de l'API dans `app.json` → `expo.extra.apiUrl` (par défaut
`https://toko.app`).

## Build & release (EAS)

```bash
pnpm build:android    # eas build --profile production (AAB)
pnpm submit:android   # eas submit --profile production (piste Internal Testing)
```

En CI : `.github/workflows/android-release.yml`, déclenché sur tag `mobile-v*`
ou manuellement. Secrets requis : `EXPO_TOKEN`,
`GOOGLE_SERVICE_ACCOUNT_KEY_JSON`.

## Sécurité

L'app manipule des **données de santé d'enfants** (journal, symptômes,
médicaments) — données sensibles au sens du RGPD. Durcissement en place :

- **Cache chiffré au repos** : le cache React Query persisté est chiffré en
  AES-256-CTR ; la clé vit dans le keystore Android (`expo-secure-store`), comme
  le cookie de session. Voir `src/lib/secure-persister.ts`. AsyncStorage ne
  contient plus de données de santé en clair.
- **Sauvegarde désactivée** : `android.allowBackup: false` empêche l'export du
  bac à sable de l'app via `adb backup` ou la sauvegarde cloud Google.
- **Permissions réduites** : `android.blockedPermissions` retire
  `SYSTEM_ALERT_WINDOW`, `READ/WRITE_EXTERNAL_STORAGE` ajoutées par des libs.
- **Pas de trafic en clair** : `android.usesCleartextTraffic: false`.
- **Pas de fuite à l'écran** : `usePreventScreenCapture()` (App.tsx) bloque les
  captures et masque l'aperçu dans le multitâche (FLAG_SECURE).
- **OTA désactivé** : `updates.enabled: false` — aucune surface de code distant.
- **Session** : cookie en `expo-secure-store`, transport HTTPS uniquement, aucun
  secret ni log de données sensibles dans `src/`.

> ⚠️ Toutes ces options sont dans `app.json`/le code : `/android` étant
> gitignoré et régénéré par `expo prebuild`, **ne jamais durcir en éditant le
> dossier natif** — les changements seraient perdus.

### Points restants (suivi)

- **Signature de release** : `expo prebuild` génère un `build.gradle` qui signe
  la variante *release* avec le **debug keystore** (mot de passe public). Les
  APK construits localement (`pnpm android` / `assembleRelease`) ne sont donc
  **pas distribuables** — réservés au test. Toute distribution doit passer par
  **EAS** (`pnpm build:android`, AAB en signature gérée par EAS).
- **App Links (auth OAuth)** : le retour OAuth Google utilise le scheme
  `toko://`, théoriquement interceptable par une autre app enregistrant le même
  scheme (mitigé par le paramètre `state`/CSRF de Better Auth + Custom Tabs).
  Le durcissement complet (Android App Links vérifiés via `assetlinks.json`)
  nécessite l'empreinte SHA-256 du certificat de signature **géré par EAS** et
  l'hébergement de `/.well-known/assetlinks.json` côté web — à faire une fois la
  signature de prod fixée.
- **Certificate pinning** : non implémenté (rotation de cert fragile en Expo) ;
  acceptable pour ce modèle de menace, HTTPS + HSTS côté serveur suffisent.

## Changements backend nécessaires (additifs, non cassants)

Pour brancher l'auth mobile (voir `docs/android-app.md`) :

1. Plugin serveur `expo()` dans `apps/api/src/lib/auth.ts`.
2. Scheme `toko://` (et `exp://` en dev) dans `trustedOrigins`.
3. Prédicat CORS tolérant au scheme de l'app.

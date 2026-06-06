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

## Changements backend nécessaires (additifs, non cassants)

Pour brancher l'auth mobile (voir `docs/android-app.md`) :

1. Plugin serveur `expo()` dans `apps/api/src/lib/auth.ts`.
2. Scheme `toko://` (et `exp://` en dev) dans `trustedOrigins`.
3. Prédicat CORS tolérant au scheme de l'app.

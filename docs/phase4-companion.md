# Phase 4 — Compagnon Android natif

> Source : `docs/product-strategy.md` §Phase 4. **Rappel de séquencement :** la
> stratégie considère la construction du natif *avant* le signal de la bêta
> comme le « build trap ». Le compagnon ci-dessous est **implémenté mais
> désactivé par défaut** (la full-app reste servie) ; l'activer relève d'une
> décision produit une fois les critères de sortie de la bêta atteints
> (`docs/beta-plan.md`).

## Ce qui est déjà construit dans `apps/mobile`

Le port Expo contient déjà l'essentiel du compagnon :

- **Notifications locales exactes** (`src/lib/notifications.ts`) : canal Android,
  permissions, `scheduleMorningReminder` / `scheduleEveningReminder` (triggers
  `DAILY` de l'OS — survivent au Doze, hors-ligne). Câblées via
  `use-phone-reminders` (le soir est ON par défaut, « la raison décisive du
  natif »). **C'est le différenciateur vs le web push, et il est fait.**
- **Partage de session** avec le compte web (Better Auth `authClient`).
- **Routines** (avec `timeOfDay` matin/soir/…), **timer-animal** (`TimerScreen`)
  et **compagnons** (`CompanionCollectionScreen`).

## Le compagnon 3 écrans (livré ici, désactivé)

`App.tsx` boote en mode compagnon quand `COMPANION_MODE` est vrai — un
`CompanionTabs` à **3 onglets**, réutilisant les écrans existants :

| Onglet | Écran | Contenu |
|---|---|---|
| **Matin** | `RoutinesScreen` (`timeOfDay: "morning"`) | routine du matin |
| **Soir** | `RoutinesScreen` (`timeOfDay: "evening"`) | routine du soir |
| **Timer** | `TimerScreen` | timer-animal + compagnons |

Le reste (journal, symptômes, rapport, médicaments, abonnement…) **reste sur le
web** — l'app est 100 % gratuite, zéro achat in-app, conformément à la stratégie.

### Activer le mode compagnon

Dans `apps/mobile/app.json`, sous `expo.extra` :

```json
{ "expo": { "extra": { "companionMode": true } } }
```

(ou via un profil de build EAS dédié). Par défaut `companionMode` est absent →
la full-app est servie.

## ⚠️ Ce qui NE PEUT PAS être fait sans un poste de dev + un compte Google

Ces étapes exigent la toolchain Android et n'ont **pas** pu être exécutées ici
(pas d'émulateur, pas de `node_modules` mobile, pas de compte Play) :

1. **Installer les deps + type-check** :
   ```bash
   cd apps/mobile && pnpm install && pnpm typecheck
   ```
   `apps/mobile` est **hors du workspace pnpm / hors CI** — le code du compagnon
   est **vérifié par revue statique uniquement** (imports, équilibrage,
   réutilisation d'écrans existants), **pas compilé**. Ce `tsc` est la première
   validation à faire.
2. **Lancer sur appareil/émulateur** : `pnpm --dir apps/mobile android`
   (`expo run:android`). Tester :
   - opt-in notifications + réception des rappels matin/soir à l'heure exacte
     (appareil verrouillé, hors-ligne) ;
   - complétion d'une étape de routine ;
   - timer-animal + déblocage d'un compagnon ;
   - partage de session (connexion = même compte que le web).
3. **Fiche Play Store** (compte Google Play Developer requis) :
   - signature de l'app (keystore / EAS credentials), `versionCode`/`version`
     dans `app.json` (actuellement `0.1.0` / `versionCode 1`) ;
   - fiche optimisée « routine enfant TDAH », « rappel routine matin enfant » ;
   - captures d'écran, icône, politique de confidentialité (lien web existant) ;
   - build AAB (`eas build -p android`) + soumission + revue Google.

## Critères de bascule (rappel)

N'activer/soumettre le compagnon que si la bêta le confirme : rappels web push
perçus comme tardifs/manqués (surtout iOS PWA non installée), enfants réclamant
le timer, demande explicite d'une « vraie app », ou liste d'attente Android
significative (`waitlist_signups`).

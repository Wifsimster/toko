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
  `use-phone-reminders` (**opt-in, désactivés par défaut** — RGPD §7 ; le parent
  les active depuis l'encart du dashboard, le toggle Matin/Soir du compagnon, ou
  Réglages). **C'est le différenciateur vs le web push, et il est fait.**
- **Partage de session** avec le compte web (Better Auth `authClient`).
- **Routines** (avec `timeOfDay` matin/soir/…), **timer-animal** (`TimerScreen`)
  et **compagnons** (`CompanionCollectionScreen`).

## Le compagnon 3 écrans (livré ici, désactivé)

`App.tsx` boote en mode compagnon quand `COMPANION_MODE` est vrai — un
`CompanionTabs` à **3 onglets**, réutilisant les écrans existants :

| Onglet | Écran | Contenu |
|---|---|---|
| **Matin** | `RoutinesScreen` (`slot: "morning"`) | routines du matin (+ midi, toujours) |
| **Soir** | `RoutinesScreen` (`slot: "evening"`) | routines du soir (+ coucher, toujours) |
| **Timer** | `TimerScreen` | timer-animal + compagnons |

Le filtrage se fait par **demi-journée** (`src/lib/companion-slots.ts`), pas par
`timeOfDay` strict : `noon` tombe sous Matin, `bedtime` sous Soir, et `anytime`
apparaît dans les deux — **aucune routine n'est jamais invisible** dans le
compagnon.

Chaque onglet Matin / Soir affiche en tête un **interrupteur de rappel** pour sa
demi-journée (`CompanionReminderToggle`) : le compagnon n'a pas d'écran
Réglages, donc c'est là que le parent active/désactive la notification locale et
déclenche la demande de permission OS. Les rappels sont **opt-in (désactivés par
défaut, RGPD)** ; l'heure vient des préférences du compte, bornée hors de la
fenêtre tunnel 16h30–21h (rule B4).

Le reste (journal, symptômes, rapport, médicaments, abonnement…) **reste sur le
web** — l'app est 100 % gratuite, zéro achat in-app, conformément à la stratégie.

### Les rappels locaux fonctionnent aussi en mode compagnon

Le différenciateur du natif — les rappels matin/soir exacts — est câblé au
**niveau racine authentifié** (`useReminderSync`, monté dans `App.tsx`), pas sur
`HomeScreen`. Le compagnon ne monte jamais `HomeScreen` ; sans ce
déplacement, ses rappels n'auraient jamais été programmés. La réconciliation
reste idempotente et honore les mêmes opt-ins (désactivés par défaut) et
horaires de compte.

Les **taps de notification** sont routés vers les onglets du compagnon via
`companionLinking` (`src/navigation/linking.ts`) : le rappel du matin ouvre
l'onglet **Matin**, celui du soir l'onglet **Soir** — les URLs de notification
(`home` / `checkin`) sont réutilisées telles quelles.

### Activer le mode compagnon

Dans `apps/mobile/app.json`, sous `expo.extra` :

```json
{ "expo": { "extra": { "companionMode": true } } }
```

(ou via un profil de build EAS dédié). Par défaut `companionMode` est absent →
la full-app est servie.

## ✅ Type-check : fait (compilé, pas seulement relu)

Les deps mobiles ont été installées et le type-check exécuté **dans cet
environnement** :

```bash
cd apps/mobile && pnpm install --ignore-workspace && pnpm typecheck
```

- **`tsc --noEmit` → 0 erreur.** Le compagnon (`App.tsx`, filtre `timeOfDay` de
  `RoutinesScreen`, `CompanionTabParamList`) **compile réellement** — plus
  « revue statique uniquement ».
- `expo-doctor` : **16/18** checks OK. Les 2 restants sont uniquement des
  fetches distants bloqués par le proxy (schéma de config Expo + React Native
  Directory), pas des défauts du projet.
- **Correctif appliqué** : `expo-asset` (~12.0.13, pin SDK 54) manquait comme
  peer dep de `expo-audio` — ajouté à `package.json` (aurait planté hors Expo
  Go). C'est le seul défaut réel qu'a révélé le type-check + doctor.

> `apps/mobile` reste **hors du workspace pnpm racine** (`!apps/mobile`) et hors
> CI JS ; l'installe se fait avec `--ignore-workspace`. Un `pnpm-lock.yaml` local
> est généré par cette installe — le committer (optionnel) rendrait les builds
> EAS reproductibles.

## ⚠️ Ce qui NE PEUT PAS être fait ici (compte Expo + compte Google + appareil)

Ces étapes exigent un compte EAS/Google et un appareil, indisponibles dans le
sandbox :

1. **Lancer sur appareil/émulateur** : `pnpm --dir apps/mobile android`
   (`expo run:android`). Tester :
   - opt-in notifications + réception des rappels matin/soir à l'heure exacte
     (appareil verrouillé, hors-ligne) ;
   - complétion d'une étape de routine ;
   - timer-animal + déblocage d'un compagnon ;
   - partage de session (connexion = même compte que le web).
2. **Fiche Play Store** (compte Google Play Developer requis) :
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

# Android — checklist EAS & Play (premier build interne)

Pas-à-pas pour produire le premier APK/AAB de l'app Expo (`apps/mobile`) et le
distribuer sur la piste **Internal Testing** du Play Store. Décision
d'architecture : [`android-app.md`](./android-app.md). Le workflow CI est
`.github/workflows/android-release.yml`.

> Ces étapes nécessitent **tes comptes** (Expo + Google Play Console) et ne
> peuvent pas être automatisées depuis le repo. Coche-les dans l'ordre.

## 0. Prérequis (comptes)

- [ ] Compte **Expo** (https://expo.dev) — gratuit pour EAS Build (quota mensuel).
- [ ] Compte **Google Play Console** (frais uniques de 25 $) avec une app créée.
- [ ] `npm i -g eas-cli` en local (ou `npx eas-cli`).

### Compte développeur — organisation (auto-entreprise)

Éditeur : **auto-entreprise Battistella** (entrepreneur individuel). On enrôle un
compte **Organisation** (et non personnel) pour afficher le nom de l'entreprise
comme éditeur. Google Play **exige un numéro D-U-N-S** pour les comptes
organisation depuis 2023.

- [ ] **D-U-N-S : `286876985`** (auto-entreprise Battistella).
- [ ] Le **nom et l'adresse** déclarés à Google Play doivent correspondre
      **exactement** à la fiche Dun & Bradstreet de l'entreprise (sinon la
      vérification échoue). Vérifier/mettre à jour la fiche D&B au besoin
      (https://www.dnb.com) — la propagation des corrections peut prendre
      quelques jours.
- [ ] Compléter la **vérification d'identité de l'organisation** dans Play
      Console (peut demander un justificatif type extrait SIRENE/INSEE).
- [ ] *(Si publication iOS plus tard)* le même DUNS sert à l'enrôlement
      **Apple Developer Program** en entité morale.

## 1. Créer le projet EAS

```bash
cd apps/mobile
eas login
eas init                 # crée le projet EAS et renvoie un projectId
```

- [ ] Récupérer le `projectId` renvoyé.
- [ ] Remplacer `REPLACE_WITH_EAS_PROJECT_ID` dans `apps/mobile/app.json`
      (`expo.extra.eas.projectId`).
- [ ] Vérifier l'`android.package` (`app.toko.mobile`) — il doit être **unique**
      et **définitif** (impossible à changer après publication sur le Play).

## 2. URL de l'API de production

- [ ] Dans `apps/mobile/app.json`, régler `expo.extra.apiUrl` et `webUrl` sur
      l'origine de production (par défaut `https://toko.app`). C'est l'API Hono
      déjà déployée que l'app consomme.

## 3. Signature (keystore)

- [ ] Laisser **EAS gérer le keystore** (recommandé) : au premier
      `eas build`, EAS le génère et le conserve côté serveur.
- [ ] Activer **Play App Signing** côté Play Console (Google gère la clé de
      signature finale ; EAS fournit la clé d'upload).
- [ ] **Ne jamais committer** de `.keystore`/`.jks` (déjà couvert par
      `apps/mobile/.gitignore`).

## 4. Premier build (local, pour valider)

```bash
cd apps/mobile
eas build --platform android --profile preview   # APK installable (test)
```

- [ ] Installer l'APK sur un appareil Android et vérifier :
  - [ ] **Connexion** (email/mot de passe) contre l'API de prod — voir §6.
  - [ ] **Rappel du soir** programmé : autoriser les notifications, vérifier
        qu'il se déclenche et **ouvre le check-in** au tap (deep-link).
  - [ ] **Check-in offline** : passer en mode avion, faire un point du soir,
        revenir en ligne → la mutation rejoue.
  - [ ] Écrans **Journal / Routines / Liste de crise / Minutes calmes**.

## 5. Backend : autoriser le scheme mobile (déjà mergé, à vérifier en prod)

Le support auth mobile (PR #287) est **additif et non cassant**. Vérifier que la
prod tourne bien avec :

- [ ] Plugin serveur `expo()` actif (`apps/api/src/lib/auth.ts`).
- [ ] `toko://` (et `exp://` en dev) dans `trustedOrigins`.
- [ ] CORS tolérant au scheme de l'app (`apps/api/src/app.ts`).

Aucune variable d'environnement nouvelle n'est requise côté API.

## 6. Secrets CI (GitHub → Settings → Secrets and variables → Actions)

Requis par `.github/workflows/android-release.yml` :

- [ ] **`EXPO_TOKEN`** — token d'accès Expo (https://expo.dev → Account →
      Access Tokens). Permet à EAS Build de tourner en CI.
- [ ] **`GOOGLE_SERVICE_ACCOUNT_KEY_JSON`** — clé JSON d'un **compte de service
      Google** ayant accès à la Play Console (rôle « Release to testing
      tracks »). Nécessaire pour `eas submit`.

### Créer le compte de service Google (résumé)

1. [ ] Play Console → Setup → API access → lier un projet Google Cloud.
2. [ ] Google Cloud → IAM → Service Accounts → créer un compte, générer une
       **clé JSON**.
3. [ ] Play Console → Users & permissions → inviter ce compte de service avec
       le droit de publier sur les pistes de test.
4. [ ] Coller le contenu du JSON dans le secret `GOOGLE_SERVICE_ACCOUNT_KEY_JSON`.

## 7. Build + soumission via CI

Déclenchement (jamais sur push de routine — gated par tag/dispatch) :

```bash
git tag mobile-v0.1.0
git push origin mobile-v0.1.0
```

ou manuellement : GitHub → Actions → **Android Release** → *Run workflow*
(profil `production`, `submit` = true).

- [ ] Le job `EAS Build (Android)` produit l'**AAB**.
- [ ] `eas submit` téléverse sur la piste **Internal Testing**.

## 8. Distribution Internal Testing

- [ ] Play Console → Testing → Internal testing → créer la liste de testeurs
      (jusqu'à 100 e-mails).
- [ ] Partager le lien d'opt-in ; installer depuis le Play Store.
- [ ] Valider la revue « minimum functionality » (l'app native passe ce seuil).

## 9. Paiement (rappel)

L'abonnement se prend **sur le web** (Stripe) ; l'app lit `GET /api/billing/status`
et ouvre l'achat dans le navigateur externe. **Pas** de Google Play Billing à ce
stade — voir `android-app.md` §Paiement (politique Play en évolution, à
revérifier).

## 10. Versioning

- [ ] `expo.android.versionCode` (entier, +1 à chaque build Play) et
      `expo.version` (semver affiché) dans `app.json`, **découplés** du tag
      Docker du backend. Le profil `production` (`eas.json`) a
      `autoIncrement: true` pour le `versionCode`.

---

### Récapitulatif des valeurs à renseigner

| Où | Clé | Valeur |
|----|-----|--------|
| Play Console (compte org) | Éditeur | auto-entreprise Battistella |
| Play Console (compte org) | D-U-N-S | `286876985` |
| `apps/mobile/app.json` | `expo.extra.eas.projectId` | _(de `eas init`)_ |
| `apps/mobile/app.json` | `expo.extra.apiUrl` / `webUrl` | URL prod (ex. `https://toko.app`) |
| GitHub secret | `EXPO_TOKEN` | token Expo |
| GitHub secret | `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` | JSON compte de service Play |

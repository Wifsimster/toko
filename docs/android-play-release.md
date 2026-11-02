# Publication Android sur Google Play

Procédure pour produire un AAB signé de `apps/mobile` et le publier sur la
piste **Production** de Google Play. Décision d'architecture :
[`android-app.md`](./android-app.md). Textes de la fiche :
[`play-store-listing.md`](./play-store-listing.md). Visuels :
[`store-assets/`](./store-assets/README.md).

> Le workflow `android-apk.yml` reste l'outil des APK de test (signature
> debug, sideload). Il ne produit **pas** de build publiable : la release Play
> se construit en local avec la clé d'upload, qui ne quitte jamais le poste.

## État

| Élément | Valeur |
|---------|--------|
| Compte Play Console | organisation « Wifsimster » (éditeur : auto-entreprise Battistella) |
| Application | Tokō, `app.toko.mobile`, gratuite, langue par défaut fr-FR, catégorie Parents |
| Première version | 0.1.0 (`versionCode` 1), envoyée en examen le 2026-11-02, 178 pays |
| Signature | Play App Signing (clé de signature gérée par Google) |
| Clé d'upload | `toko-upload.jks`, alias `toko-upload`, SHA-1 `35:F6:0F:A2:D3:76:46:49:48:80:BC:2C:8F:6B:2D:36:A4:47:99:E7` |

La clé d'upload et son `keystore.properties` vivent **hors du dépôt** (par
défaut `~/toko-keys/`), le mot de passe est sauvegardé dans le gestionnaire de
mots de passe. Perdue, elle se remplace par une demande de réinitialisation
dans Play Console → Intégrité de l'appli → Signature de l'appli, sans perdre
l'app.

## 1. Préparer la version

1. Incrémenter `expo.android.versionCode` (entier, +1 à chaque envoi Play) et
   `expo.version` (semver affiché) dans `apps/mobile/app.json`. Le
   `versionCode` de l'app est découplé du tag Docker du backend.
2. Fusionner sur `main` ; la release se construit depuis `main` à jour.

## 2. Construire l'AAB signé

Prérequis sur le poste : Node 22+, JDK 17, SDK Android (`ANDROID_HOME`, par
défaut `~/Android/Sdk`).

```bash
cd apps/mobile
pnpm build:play
```

`scripts/build-play-aab.sh` reprend la recette de `android-apk.yml`
(install isolé, `expo prebuild --clean`), puis lance `./gradlew bundleRelease`
en injectant la clé d'upload par les propriétés `android.injected.signing.*`
(le `build.gradle` généré n'est jamais modifié). Il :

- lit le keystore depuis `TOKO_KEYSTORE_PROPERTIES`
  (défaut `~/toko-keys/keystore.properties`, clés `storeFile`,
  `storePassword`, `keyAlias`, `keyPassword`) ;
- construit les ABI `arm64-v8a` et `armeabi-v7a` (≈ 40 Mo d'AAB, ≈ 25 Mo
  installés) ;
- **échoue** si le manifeste fusionné contient une permission que
  `android.blockedPermissions` doit retirer (`RECORD_AUDIO`,
  `FOREGROUND_SERVICE_MEDIA_PLAYBACK`…) : sinon Play exige une déclaration
  micro et une vidéo de service de premier plan ;
- affiche le certificat de signature (il doit correspondre au SHA-1 ci-dessus),
  le `versionCode` et le SHA-256 de l'AAB.

L'AAB sort dans `android/app/build/outputs/bundle/release/app-release.aab`.

## 3. Envoyer sur Play

1. Play Console → Tokō → Tester et publier → **Production** → *Créer une
   version* → importer l'AAB.
2. Notes de version fr-FR (≤ 500 caractères) → *Suivant* → vérifier les
   avertissements → *Enregistrer*.
3. **Vue d'ensemble de la publication** → *Envoyer les modifications pour
   examen*.

Avertissement attendu et non bloquant : « aucun fichier de désobscurcissement »
(R8 n'est pas activé sur les builds release).

## Déclarations Play (premier envoi, 2026-11-02)

À tenir à jour si l'app change ; Play les réaffiche dans *Contenu de
l'application*.

| Déclaration | Réponse |
|-------------|---------|
| Règles de confidentialité | `https://toko.battistella.ovh/confidentialite` |
| Informations de connexion | compte de démo (e-mail + mot de passe, enfant fictif), instructions en anglais |
| Annonces / ID publicitaire | non / non |
| Classification (IARC) | « Toutes les autres catégories », aucune réponse positive → tout public |
| Public cible | 18 ans et plus (outil pour les parents) |
| Sécurité des données | nom et e-mail requis ; infos de santé et contenu saisi facultatifs ; rien de partagé ; chiffré en transit ; compte e-mail/mot de passe + OAuth ; URL de suppression = politique de confidentialité |
| Applis de santé | santé mentale et comportementale ; gestion des médicaments et des traitements |
| Fonctionnalités financières, appli gouvernementale | aucune / non |
| Éléments d'IA de la fiche | icône et image de présentation signalées ; captures non |

## Pièges

- **Fiche restée en brouillon** : tant que l'étape *Avis* de la fiche (déclaration
  sur les éléments d'IA) n'a pas de réponse, la fiche reste « Brouillon » et le
  bouton d'envoi en examen est grisé.
- **Ordre imposé** : *Cible et contenu* ne s'ouvre qu'une fois *Informations
  de connexion* remplie, et *Sécurité des données* ne se soumet qu'après *Cible
  et contenu*.
- **Identifiants de démo** : après *Ajouter* dans la fenêtre, il faut aussi
  *Enregistrer* la page, sinon rien n'est conservé.
- **Captures d'écran** : Play refuse un côté au-delà du ratio 2:1 et le
  formulaire demande du 16:9 / 9:16 ; utiliser `store-assets/play-9x16/`.
- **Gratuite pour toujours** : une app publiée gratuite ne peut plus devenir
  payante. L'abonnement Famille reste vendu sur le web.

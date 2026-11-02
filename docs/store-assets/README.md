# Visuels Play Store — Tokō

Captures d'écran pour la fiche Play Store, prises sur appareil (compte de
démo, enfant « Léo »).

## Fichiers

| Fichier | Écran | Argument |
|---------|-------|----------|
| `01-accueil.png` | Accueil | Vue d'ensemble : humeur parent, KPIs, check-list du jour |
| `02-routines.png` | Routines | Routine du soir + « Lancer le minuteur » |
| `03-minuteur.png` | Minuteur visuel | Le cadran qui se vide |
| `04-journal.png` | Journal | Notes datées, éditables |
| `05-recompenses.png` | Récompenses | Gagner / dépenser des étoiles |
| `06-compagnons.png` | Mes compagnons | Animaux à collectionner (récompense du minuteur) |

- **Originaux** : 1280×2772 (résolution native de l'appareil).
- **`play-2to1/`** : mêmes images recadrées en **1280×2560 (ratio 2:1)**,
  la limite au-delà de laquelle Google Play refuse une capture.
- **`play-9x16/`** : **1280×2276 (9:16)**, barre d'état retirée — ce sont les
  captures publiées sur la fiche (le formulaire Play attend du 16:9 / 9:16).
- **`icon-512.png`** : icône de la fiche (512×512, fond opaque), tirée de
  `apps/mobile/assets/icon.png`.
- **`feature-1024x500.png`** : image de présentation de la fiche.

L'icône et l'image de présentation sont déclarées sur Play comme créées avec
l'IA ; les captures, non. Procédure de publication :
[`android-play-release.md`](../android-play-release.md).

## À refaire pour la version publique (optionnel)

La barre d'état est retirée dans `play-9x16/`. Restent envisageables : des
données d'exemple plus « vitrine » et un cadre marketing.

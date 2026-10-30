# Identité visuelle Tokō

Le logo de Tokō est un **ō** : un rond coiffé d'un trait. C'est la lettre
unique du nom — aucune autre application ne l'a — et c'est aussi une image
que tout le monde lit sans explication.

## Ce que dit le signe

- **Le rond** : l'enfant, entier. Une forme sans angle, sans agitation.
- **Le trait** : le macron du ō, qui allonge le son. Un trait posé, calme,
  au-dessus de la tête. C'est le temps que Tokō rend aux parents, et le
  toit qui protège.
- **Ensemble** : un abri, un souffle, un lever de soleil. Ce que promet le
  produit à des parents épuisés : du calme et une seule chose à la fois.

Le rond a un contre ovale, comme le « o » d'une police à empattements. Ce
léger contraste de trait relie le signe au mot-symbole en Source Serif 4 et
lui donne une chaleur que le trait purement géométrique n'a pas.

## Fichiers

| Fichier | Usage |
|---------|-------|
| `toko-mark.svg` | Le signe seul, sarcelle. Version principale sur fond clair. |
| `toko-mark-cream.svg` | Le signe seul, crème. Sur fond sombre ou sarcelle. |
| `toko-mark-black.svg` | Le signe seul, noir. Impression monochrome, tampons, gravure. |
| `toko-icon.svg` | Icône de l'app : Mō sur la tuile sarcelle, macron crème au-dessus de la tête. Identique à `apps/web/public/icon.svg`. Source de toutes les icônes PNG (web, iOS, Android). |
| `toko-logo.svg` | Logo horizontal : signe + mot-symbole, sur fond clair. |
| `toko-logo-dark.svg` | Logo horizontal, tout crème, sur fond sombre. |
| `toko-logo-black.svg` | Logo horizontal, tout noir. |
| `toko-logo-tile.svg` | Logo horizontal avec la tuile : celui de l'interface et des cartes de partage. |
| `toko-logo-tile-dark.svg` | Idem, mot-symbole crème. |
| `toko-logo-stacked.svg` | Logo vertical (signe au-dessus du mot), pour les formats carrés. |
| `toko-logo-stacked-dark.svg` | Idem, tout crème. |
| `toko-wordmark.svg` | Le mot-symbole seul, vectorisé. |

Tous les fichiers sont vectoriels et sans texte vivant : le mot-symbole est
vectorisé, donc il s'affiche pareil partout, sans dépendre des polices
installées.

## Couleurs

| Nom | Hex | Rôle |
|-----|-----|------|
| Sarcelle | `#358891` | Couleur du signe et de la tuile. Dans l'app, couleur d'accent **non textuelle** (progression, points d'étape, focus) : jamais de texte sarcelle sur crème (3,84:1). |
| Sarcelle texte | `#23676E` | La sarcelle des liens et des chiffres dans l'app (6,03:1 sur crème). |
| Crème | `#fdf9f4` | Fond clair des fichiers de marque, et signe sur fond sombre. Le fond de l'app est la crème Mō `#FBF6EE`. |
| Encre | `#1f2937` | Mot-symbole sur fond clair. L'encre de l'app (texte, bouton principal) est `#1E2A2E`. |
| Nuit | `#091123` | Fond sombre (écrans de démarrage). |

Sur fond clair : signe sarcelle, mot encre. Sur fond sombre : tout en crème.
Sur fond sarcelle : tout en crème. Pas de dégradé, pas d'ombre, pas de
contour.

La palette complète de l'interface (direction « Mō » : crème, encre,
sarcelle en accent, pastels à sens fixe, clair uniquement) et ses
contrastes sont dans [`DESIGN.md`](../DESIGN.md).

## Typographie

Le mot-symbole est composé en **Source Serif 4**, graisse 600, taille
optique 36, interlettrage légèrement resserré. Dans l'application, Source
Serif 4 est réservée au mot-symbole (`--font-wordmark`) ; les titres sont en
Plus Jakarta Sans 800. Le macron du ō dans le mot fait
écho au trait du signe.

## Construction

Le signe est dessiné dans un carré de 100 × 100 :

- trait : 52 de large, 9,5 d'épaisseur, bouts arrondis ;
- espace entre le trait et le rond : 9 ;
- rond : diamètre extérieur 60, contre ovale de 37 × 44 ;
- l'encre occupe 60 × 78,5, centrée dans le carré.

Le chemin SVG est le même dans `brand/`, dans `apps/web/public/og-image.svg`,
dans `apps/web/scripts/lib/brand.mjs` (cartes de partage), dans
`apps/web/src/components/shared/brand-logo.tsx` et dans
`apps/api/src/lib/report/pdf/brand.ts` (rapport PDF, logo horizontal complet ;
un test le compare à `toko-logo.svg`). Pour modifier le signe, changer ces
cinq endroits puis lancer depuis `apps/web` :

```bash
pnpm og:generate      # image de partage du site
pnpm og:articles      # images de partage des articles
pnpm og:pages         # images de partage des pages ressources
```

## Icône de l'app

L'icône montre Mō, la mascotte, en entier : corps menthe, contour encre,
joues pêche, ventre crème, petits bras, ombre sarcelle foncée. Au-dessus de
la tête, le macron crème cerclé d'encre : c'est le trait du ō, le lien avec
le logo. Fond : tuile sarcelle `#358891`, coins arrondis à 18,75 % du côté.

Pour rester lisible à 48 px, le dessin est simplifié par rapport aux
illustrations de Mō : traits épais, pas de reflet, grands yeux.

- `toko-icon.svg` (= `apps/web/public/icon.svg`) : la source.
- `apps/web/public/favicon.svg` : en dessous de 32 px, Mō entier ne se lit
  plus. Le favicon garde la tête, les yeux, les joues, le sourire et le
  macron (sans contour), en traits plus épais.
- Les PNG sont tirés de la source par `pnpm icons:generate` (depuis
  `apps/web`) : `icon-192.png`, `icon-512.png` et `apple-touch-icon.png`
  (pleine tuile, sans transparence, Mō dans le cercle sûr de 80 % des
  icônes masquables), et pour Android `icon.png`, `adaptive-icon.png`
  (Mō seul sur fond transparent, dans le cercle sûr de 66 dp sur 108 ; le
  fond sarcelle vient de `app.json`), `monochrome-icon.png` (contour seul,
  pour les icônes à thème), `splash-icon-light.png` (Mō sur le fond crème
  du démarrage) et `favicon.png`.

Après une modification de `icon.svg` ou `favicon.svg`, copier `icon.svg`
dans `brand/toko-icon.svg` puis relancer `pnpm icons:generate`.

## Règles d'usage

- **Espace de protection** : autour du logo, garder au moins la hauteur du
  rond de vide.
- **Taille minimale** : signe seul 16 px, logo horizontal 24 px de haut.
- Ne pas déformer, incliner, recolorer hors palette, ni ajouter d'effet.
- Ne pas remplacer le mot-symbole par une autre police.
- Ne pas placer le signe sur une photo chargée : poser d'abord un aplat
  crème, nuit ou sarcelle.

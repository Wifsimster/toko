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
| `toko-icon.svg` | Tuile d'application (sarcelle, signe crème). Identique à `apps/web/public/icon.svg`. |
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
| Sarcelle | `#358891` | Couleur du signe et de la tuile. La couleur primaire de l'app. |
| Crème | `#fdf9f4` | Fond clair, et signe sur fond sombre. |
| Encre | `#1f2937` | Mot-symbole sur fond clair. |
| Nuit | `#091123` | Fond sombre (mode sombre, écrans de démarrage). |

Sur fond clair : signe sarcelle, mot encre. Sur fond sombre : tout en crème.
Sur fond sarcelle : tout en crème. Pas de dégradé, pas d'ombre, pas de
contour.

## Typographie

Le mot-symbole est composé en **Source Serif 4**, graisse 600, taille
optique 36, interlettrage légèrement resserré. La police est déjà celle des
titres de l'application (`--font-heading`). Le macron du ō dans le mot fait
écho au trait du signe.

## Construction

Le signe est dessiné dans un carré de 100 × 100 :

- trait : 52 de large, 9,5 d'épaisseur, bouts arrondis ;
- espace entre le trait et le rond : 9 ;
- rond : diamètre extérieur 60, contre ovale de 37 × 44 ;
- l'encre occupe 60 × 78,5, centrée dans le carré.

Le chemin SVG est le même dans `brand/`, dans `apps/web/public/*.svg`, dans
`apps/web/scripts/lib/brand.mjs` (icônes et cartes de partage) et dans
`apps/web/src/components/shared/brand-logo.tsx`. Pour modifier le signe,
changer ces quatre endroits puis lancer depuis `apps/web` :

```bash
pnpm icons:generate   # PNG de l'icône PWA et iOS
pnpm og:generate      # image de partage du site
pnpm og:articles      # images de partage des articles
```

## Tuile d'application

Carré aux coins arrondis à 18,75 % du côté, fond sarcelle, signe crème
centré. Le signe occupe 72 % du côté (il reste dans la zone sûre des icônes
masquables). En dessous de 32 px (favicon), il occupe 80 % du côté pour
rester lisible : c'est la seule différence entre `favicon.svg` et `icon.svg`.

## Règles d'usage

- **Espace de protection** : autour du logo, garder au moins la hauteur du
  rond de vide.
- **Taille minimale** : signe seul 16 px, logo horizontal 24 px de haut.
- Ne pas déformer, incliner, recolorer hors palette, ni ajouter d'effet.
- Ne pas remplacer le mot-symbole par une autre police.
- Ne pas placer le signe sur une photo chargée : poser d'abord un aplat
  crème, nuit ou sarcelle.

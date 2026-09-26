# Vidéo promotionnelle Tokō

Vidéo de ~34 s réalisée avec [Remotion](https://www.remotion.dev/) (React → MP4).

Deux formats :

| Composition | Taille | Usage |
|---|---|---|
| `TokoPromo` | 1920 × 1080 | Site, YouTube, présentations |
| `TokoPromoSquare` | 1080 × 1080 | Réseaux sociaux |

## Déroulé

1. Le signe **ō** se pose, puis le nom.
2. « Le soir, tout se bouscule dans la tête. » Les soucis du soir apparaissent, puis se rangent.
3. « Tokō garde le fil pour vous. »
4. Quatre fonctionnalités, une par écran : journal, suivi, plan de crise, récompenses.
5. Confiance : pensé pour les parents TDAH, données en Europe, sans traqueur.
6. Fin : logo, « Du calme. Une chose à la fois. », appel à l'action.

Les animations sont volontairement lentes et sans rebond, comme l'app
(voir « Pas de surprises » dans `CLAUDE.md`). Couleurs et polices : `brand/README.md`.

## Commandes

Le projet est **hors du workspace pnpm** (comme `apps/mobile`) pour que Chromium
et ffmpeg n'arrivent jamais dans la CI ni l'image Docker.

```bash
cd apps/video
pnpm install --ignore-workspace
pnpm studio          # aperçu interactif dans le navigateur
pnpm render          # → out/toko-promo.mp4
pnpm render:square   # → out/toko-promo-square.mp4
pnpm typecheck
```

## Structure

```
src/
├── Root.tsx          # Compositions (16:9 et 1:1)
├── Promo.tsx         # Enchaînement des scènes et textes des fonctionnalités
├── theme.ts          # Couleurs de la marque, polices embarquées
├── scenes/           # Une scène par fichier ; screens.tsx = écrans simulés de l'app
└── components/       # Signe ō animé, téléphone, carte
```

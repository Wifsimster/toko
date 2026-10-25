---
name: Tokō — Mō (clair uniquement)
source: apps/web/src/app.css
direction: "Mō, validée le 2026-10-25"
mode: light only (Mō) — pas de mode sombre depuis le 2026-10-25
colors:
  light:
    background: "#FBF6EE"            # crème, oklch(0.975 0.012 80)
    foreground: "#1E2A2E"            # encre, oklch(0.276 0.018 220)
    card: "#FFFDF9"                  # oklch(0.994 0.006 85)
    card-foreground: "#1E2A2E"
    popover: "#FFFDF9"
    popover-foreground: "#1E2A2E"
    primary: "#1E2A2E"               # encre : bouton principal, sélection
    primary-foreground: "#FBF6EE"
    secondary: "#DCEFE8"             # menthe
    secondary-foreground: "#1E2A2E"
    muted: "#F3ECE1"                 # oklch(0.946 0.016 79)
    muted-foreground: "#4F585E"      # encre douce, oklch(0.455 0.015 237)
    accent: "#F3ECE1"
    accent-foreground: "#1E2A2E"
    destructive: "oklch(0.55 0.18 25)"   # #C53637
    destructive-foreground: "#FFFDF9"
    border: "#E8E0D3"                # oklch(0.909 0.020 80)
    input: "#E8E0D3"
    ring: "#358891"
    brand: "#358891"                 # sarcelle, oklch(0.580 0.080 205) : accent NON textuel
    brand-strong: "#23676E"          # sarcelle texte, oklch(0.475 0.067 205)
    surface-mint: "#DCEFE8"          # calme, suivi
    surface-peach: "#FBE1CF"         # crise, SOS
    surface-lavender: "#E6E2F4"      # fatigue, Barkley
    surface-honey: "#F7E8C6"         # matins, fierté
    surface-sky: "#DCE9F2"           # soir
    surface-rose: "#F6DEDB"          # sens à fixer
    chart: ["#358891", "oklch(0.62 0.07 150)", "oklch(0.72 0.11 70)", "oklch(0.63 0.11 280)", "oklch(0.60 0.06 220)"]
    sidebar: "#F7F1E7"
    sidebar-foreground: "#1E2A2E"
    sidebar-primary: "#1E2A2E"
    sidebar-primary-foreground: "#FBF6EE"
    sidebar-accent: "#F3ECE1"
    sidebar-accent-foreground: "#1E2A2E"
    sidebar-border: "#E8E0D3"
    sidebar-ring: "#358891"
    info-surface: "color-mix(in oklab, #818cf8 10%, transparent)"
    info-border: "color-mix(in oklab, #818cf8 30%, transparent)"
    info-foreground: "color-mix(in oklab, #818cf8 72%, black)"
    warning-surface: "color-mix(in oklab, var(--color-status-warning) 14%, transparent)"
    warning-border: "color-mix(in oklab, var(--color-status-warning) 35%, transparent)"
    warning-foreground: "color-mix(in oklab, #b45309 85%, black)"
    success-surface: "color-mix(in oklab, var(--color-status-success) 14%, transparent)"
    success-border: "color-mix(in oklab, var(--color-status-success) 32%, transparent)"
    success-foreground: "color-mix(in oklab, #047857 85%, black)"
    danger-surface: "color-mix(in oklab, var(--destructive) 14%, transparent)"
    danger-border: "color-mix(in oklab, var(--destructive) 32%, transparent)"
    danger-foreground: "color-mix(in oklab, var(--destructive) 75%, black)"
    honey-surface: "color-mix(in oklab, var(--color-honey-400) 12%, transparent)"
    honey-border: "color-mix(in oklab, var(--color-honey-400) 32%, transparent)"
    honey-foreground: "var(--color-honey-700)"
  scales:
    honey: { 50: "#faf6ec", 100: "#f3eacb", 200: "#e8d49b", 300: "#d8b865", 400: "#c39a3e", 500: "#a37e29", 600: "#846522", 700: "#6a521e", 800: "#56431a", 900: "#463716" }
    sage: { 50: "#f4f7f4", 100: "#e4ece4", 200: "#c9d9c9", 300: "#a3bea3", 400: "#7a9e7a", 500: "#5a815a", 600: "#466846", 700: "#3a5339", 800: "#304430", 900: "#293829" }
    status: { success: "#10b981", warning: "#f59e0b", danger: "var(--destructive)" }
typography:
  sans: "'Plus Jakarta Sans Variable', system-ui, sans-serif"
  heading: "'Plus Jakarta Sans Variable', system-ui, sans-serif"
  heading-weight: "800 (h1, h2 et titres ≥ text-2xl), letter-spacing -0.025em"
  wordmark: "'Source Serif 4 Variable', Georgia, serif (mot-symbole Tokō seulement)"
  hand: "'Caveat' 600, auto-hébergé (19 Ko, latin + français), notes manuscrites décoratives seulement"
  extra-steps: { 2xs: "0.6875rem / 1rem", 3xs: "0.625rem / 0.9rem" }
  article-body: "1.0625rem / 1.8"
  scale: tailwind-default
rounded:
  base: 0.75rem
  sm: "calc(var(--radius) * 0.6)"
  md: "calc(var(--radius) * 0.8)"
  lg: "var(--radius)"
  xl: "calc(var(--radius) * 1.4)"
  2xl: "calc(var(--radius) * 1.8)"
  3xl: "calc(var(--radius) * 2.2)"
  4xl: "calc(var(--radius) * 2.6)"
elevation:
  card: ring-1 ring-foreground/10 (hairline, no shadow)
spacing:
  scale: tailwind-default (4px)
  control-h: "44px mobile (h-11), 32–36px from md"
components:
  style: base-nova
  primitives: base-ui (@base-ui/react)
  icons: lucide-react
  motion: motion/react
  mascot: "Mō : <Mo state size label? breathe? /> (components/mo/mo.tsx), données @focusflow/mo"
---

# Tokō — DESIGN.md

Ce fichier décrit le design system de l'app web **tel qu'il existe dans le
code**. Il ne propose rien. Chaque valeur vient de `apps/web/src/app.css`
sauf mention contraire ; en cas d'écart, le code fait foi et l'écart va dans
[Known Gaps](#known-gaps). L'app Expo (`apps/mobile/src/lib/theme.tsx`)
reprend la même palette Mō, recopiée (pas de thème partagé). La vidéo
(`apps/video/src/theme.ts`) et le PDF (`apps/api/src/lib/report/pdf/theme.ts`)
ont leurs propres thèmes, hors périmètre ici.

## Overview

Application pour des **parents TDAH qui élèvent des enfants TDAH**. Les
principes de `AGENTS.md` priment sur l'esthétique : simplicité maximale, une
seule action principale par écran, lisibilité immédiate, pas de surprise (ni
animation agressive, ni changement de mise en page imprévu).

Visuellement, direction **Mō** (validée le 2026-10-25) : fond **crème**,
texte et bouton principal à l'**encre** (presque noire, teintée sarcelle), la
**sarcelle** de la marque en accent (progression, points d'étape, onglet
actif, focus) et six **pastels à sens fixe** pour les surfaces. **Un seul
thème, clair** : pas de mode sombre, sur le web comme dans l'app Expo, parce
que les dessins de Mō sont pensés pour le crème (décision du 2026-10-25). Deux
échelles d'accent restent : **miel** pour la célébration, **sauge** pour la
croissance. Titres et corps en Plus Jakarta Sans (titres en 800) ; Source
Serif 4 ne sert qu'au mot-symbole.

## Colors

Tailwind v4. Rôles shadcn en hex dans `:root` (valeurs de la direction et
de la marque ; OKLCH équivalent dans le frontmatter), exposés par `@theme
inline`. Échelles et surfaces de statut dans `@theme`. Pas de classe `.dark`
ni de variante `dark:` : ne pas en réintroduire.

### Trois rôles pour l'encre et la sarcelle

| Utilitaire | Valeur | Pour | Jamais pour |
| --- | --- | --- | --- |
| `primary` | encre `#1E2A2E` | Bouton principal, puce ou segment sélectionné (`bg-primary text-primary-foreground`), anneau de sélection (`border-primary`, `ring-primary`) | Liens, chiffres mis en avant |
| `brand` | sarcelle `#358891` | Accents **non textuels** : barres de progression, points d'étape, puces de liste, filets, tracés, teintes (`bg-brand/10`, `border-brand/20`), focus (`ring`) | Texte : 3,84:1 sur crème, sous 4,5:1 |
| `brand-strong` | sarcelle texte `#23676E` | Seule sarcelle permise pour du **texte** : liens (`Button variant="link"`), chiffres, libellés et icônes porteuses de sens (`text-brand-strong`) | Aplats |

Avant Mō, `primary` portait la sarcelle et servait à la fois au bouton, au
texte et aux teintes. Le passage à l'encre a été fait par un codemod :
`text-primary` → `text-brand-strong` ; `*-primary/NN` (teintes) →
`*-brand/NN` ; `fill-` / `stroke-primary` → `*-brand` ; barres de progression
et points d'étape → `bg-brand` ; `hover:text-primary/80` des liens →
`hover:text-foreground` (80 % de sarcelle texte tombe à 3,94:1). Les aplats
`bg-primary` (boutons, puces sélectionnées) restent encre. Deux aplats
changent de sens et passent en sarcelle : les étapes Barkley terminées
(`bg-brand`, c'est de la progression) et les étiquettes « École » et
« Victoire » du journal (nouvelle variante de Badge `brand`, `bg-brand/12
text-brand-strong`), qui seraient sinon des pastilles noires.

### Rôles shadcn

| Token | Mō (clair) | Rôle |
| --- | --- | --- |
| `--background` | `#FBF6EE` crème | Fond |
| `--foreground` | `#1E2A2E` encre | Texte |
| `--card` / `--popover` | `#FFFDF9` | Cartes, menus |
| `--primary` | `#1E2A2E` | Encre : action principale, sélection |
| `--primary-foreground` | `#FBF6EE` | |
| `--brand` | `#358891` | Sarcelle : accent non textuel |
| `--brand-strong` | `#23676E` | Sarcelle texte |
| `--secondary` | `#DCEFE8` menthe | Secondaire |
| `--secondary-foreground` / `--accent-foreground` | `#1E2A2E` | |
| `--muted` / `--accent` | `#F3ECE1` | Surfaces calmes, survol |
| `--muted-foreground` | `#4F585E` encre douce | Texte secondaire |
| `--destructive` | `oklch(0.55 0.18 25)` | Seul rouge de l'app ; `danger-*` et `status-danger` en dérivent. Assombri de 0.58 à 0.55 en clair : sur crème, l'ancien tombait à 4,4:1 |
| `--destructive-foreground` | `#FFFDF9` | Texte sur `bg-destructive` plein |
| `--border` / `--input` | `#E8E0D3` | |
| `--ring` | `#358891` | Focus : anneau de 3 px en sarcelle **pleine** (`focus-visible:ring-3 focus-visible:ring-ring`, contour `outline-ring`). Jamais d'opacité : `ring-ring/50` tombait à 1,85:1 sur crème, sous le seuil de 3:1. `lib/__tests__/focus-ring-contrast.test.ts` refuse toute opacité sur la couleur de focus |
| `--chart-1…5` | sarcelle, sauge 150, abricot 70, lavande 280, bleu-gris 220 | Graphiques (Recharts) |
| `--sidebar-*` | fond `#F7F1E7`, reste aligné sur primary / accent / border | Sidebar ; l'entrée active est en `bg-brand/10 text-brand-strong` |

### Pastels à sens fixe

Six surfaces de même luminosité (≈ 0,92 à 0,94 en OKLCH) : elles changent de
teinte, pas de poids, donc aucune carte ne crie plus fort qu'une autre.
Utilitaires `bg-surface-*`. Texte dessus : `foreground`, `muted-foreground`
ou `brand-strong` (tous AA, voir Contrastes). Une couleur garde son sens
partout ; ne pas en prendre une pour son seul effet décoratif.

| Token | Clair | Sens |
| --- | --- | --- |
| `surface-mint` | `#DCEFE8` | Calme, suivi |
| `surface-peach` | `#FBE1CF` | Crise, SOS |
| `surface-lavender` | `#E6E2F4` | Fatigue, Barkley |
| `surface-honey` | `#F7E8C6` | Matins, fierté |
| `surface-sky` | `#DCE9F2` | Soir |
| `surface-rose` | `#F6DEDB` | « Je préfère ne pas dire » (sélecteur d'humeur de l'onboarding, maquette validée). Aucun autre usage |

Relevés de symptômes (`components/symptoms/day-level.ts`,
`DAY_LEVEL_SURFACE`) : le bandeau de la journée et le niveau de chaque
dimension, **sans Mō**. Bonne journée sur menthe (calme), journée mitigée
sur sable (`bg-muted`, neutre : c'est la journée ordinaire), journée
difficile sur pêche (crise). Encre dessus : 12,31 / 12,55 / 11,76:1. Ces
relevés n'utilisent ni le ciel (il garde le soir) ni les surfaces de
statut (miel, vert, rouge) d'avant.

Sélecteur d'humeur de l'onboarding (maquette 03, validée) : calme sur menthe,
« Débordé·e » sur pêche, « Fatigué·e » sur lavande, « Plutôt fier·e » sur miel,
« Inquiet·e » sur ciel, « Je préfère ne pas dire » sur rose. Ciel y porte
l'inquiétude en plus du soir : écart assumé de la maquette, limité aux
sélecteurs d'humeur du parent (onboarding et « Et vous ? » de l'accueil,
même table). Nulle part ailleurs, relevés de symptômes compris. Les objectifs (maquette 04) gardent les sens fixes : matins sur
miel, rendez-vous sur menthe (suivi), crises sur pêche, Barkley sur lavande,
couchers sur ciel. Accueil : carte « une seule chose » sur menthe, en miel
quand tout est fait (fierté).

### Encadrés (callouts) et statuts

Surfaces à base d'alpha sur le fond crème (valeurs dans le frontmatter). Utilitaires : `bg-info-surface`,
`border-info-border`, `text-info-foreground`, idem `warning`, `success`,
`danger`, `honey`. L'info est lavande (`#818cf8`) pour ne jamais concurrencer
la sarcelle.

| Famille | Base clair | Usage |
| --- | --- | --- |
| `info-*` | `#818cf8` | Information neutre |
| `warning-*` | `#f59e0b`, texte `#b45309` | Mise en garde |
| `success-*` | `#10b981`, texte `#047857` | Réussite |
| `danger-*` | `--destructive`, texte `--destructive` 75 % + noir | Erreur |
| `honey-*` | `honey-400`, texte `honey-700` | Formation, bêta |
| `status-success` / `-warning` / `-danger` | `#10b981` / `#f59e0b` / `--destructive` | Remplissages seulement (pastilles, séries de graphique, fonds teintés). Base des surfaces `success-*` / `warning-*`. Sous 3:1 sur carte claire : texte et icônes porteuses de sens passent par `*-foreground` |

### Échelles

- **Miel** `honey-50…900` (`#faf6ec` → `#463716`, teinte ~80, chroma bas) : accent de célébration.
- **Sauge** `sage-50…900` (`#f4f7f4` → `#293829`) : accent apaisant, croissance.

Valeurs exactes dans le frontmatter. 86 usages de ces deux échelles dans
`apps/web/src`, surtout `sage-*`.

### Contrastes

WCAG 2.x, calculés sur les valeurs sRGB des tokens (alpha composé sur la
surface indiquée). Seuils : 4,5:1 pour le texte, 3:1 pour les éléments non
textuels (1.4.11). Pastels : plage de la plus basse à la plus haute des six
surfaces.

| Texte / élément | Surface | Mō (clair) | Seuil |
| --- | --- | --- | --- |
| `foreground` | `background` | 13,69 | 4,5 |
| `foreground` | `card` | 14,50 | 4,5 |
| `foreground` | `muted` | 12,55 | 4,5 |
| `foreground` | `secondary` | 12,31 | 4,5 |
| `foreground` | 6 pastels | 11,49 à 12,31 | 4,5 |
| `foreground` | `bg-brand/10` sur carte | 12,89 | 4,5 |
| `muted-foreground` | `background` | 6,75 | 4,5 |
| `muted-foreground` | `card` | 7,15 | 4,5 |
| `muted-foreground` | `muted` | 6,19 | 4,5 |
| `muted-foreground` | 6 pastels | 5,67 à 6,07 | 4,5 |
| `brand-strong` | `background` | 6,03 | 4,5 |
| `brand-strong` | `card` | 6,39 | 4,5 |
| `brand-strong` | `muted` | 5,53 | 4,5 |
| `brand-strong` | 6 pastels | 5,06 à 5,42 | 4,5 |
| `brand-strong` | `bg-brand/10` sur carte | 5,68 | 4,5 |
| `brand-strong` | `bg-brand/5` sur fond | 5,70 | 4,5 |
| `brand-strong` (Badge `brand`) | `bg-brand/12` sur carte | 5,55 | 4,5 |
| `primary-foreground` | `primary` | 13,69 | 4,5 |
| `secondary-foreground` | `secondary` | 12,31 | 4,5 |
| `accent-foreground` | `accent` | 12,55 | 4,5 |
| `destructive-foreground` | `destructive` | 5,23 | 4,5 |
| `destructive` (texte) | `background` / `card` | 4,94 / 5,23 | 4,5 |
| `info-foreground` | carte / fond / surface | 6,35 / 6,00 / 5,78 | 4,5 |
| `warning-foreground` | carte / fond / surface | 7,00 / 6,61 / 6,30 | 4,5 |
| `success-foreground` | carte / fond / surface | 7,55 / 7,13 / 6,63 | 4,5 |
| `danger-foreground` | carte / fond / surface | 9,21 / 8,70 / 7,48 | 4,5 |
| `honey-foreground` | carte / fond / surface | 7,28 / 6,88 / 6,58 | 4,5 |
| `brand` (non textuel) | `background` / `card` / `muted` | 3,84 / 4,07 / 3,52 | 3 |
| `primary` (bouton, anneau) | `background` / `card` | 13,69 / 14,50 | 3 |
| `ring` (anneau de focus plein) | `background` / `card` / `muted` | 3,84 / 4,07 / 3,52 | 3 |
| ~~`ring` à 50 %~~ (avant le 2026-10-25) | `background` | 1,85 | 3 |
| `foreground` (anneau de sélection 2,5 px) | 6 pastels | 11,49 à 12,31 | 3 |
| `primary-foreground` (icône de coche) | `brand` (étape Barkley faite) | 3,84 | 3 |

Écarté : `brand-strong` à 80 % d'opacité (ancien survol des liens) donne
3,94:1 sur crème ; les liens passent à `hover:text-foreground`.

## Typography

Fontsource (`@import` en tête de `app.css`) :

| Token | Famille | Usage |
| --- | --- | --- |
| `--font-sans` | Plus Jakarta Sans Variable | `html` (`font-sans antialiased`), corps 400 à 650 |
| `--font-heading` | Plus Jakarta Sans Variable | `h1–h6` (base layer, interlettrage −0,025 em) ; `h1` et `h2` en 800 par défaut, titres `text-2xl` et plus en `font-extrabold` |
| `--font-wordmark` | Source Serif 4 Variable | Mot-symbole « Tokō » écrit en texte vivant (`font-wordmark`, 600) : en-têtes publics, connexion, sidebar. Rien d'autre |

Les titres ne sont plus en serif : on a changé la graisse, pas la famille.
Plus Jakarta Sans Variable couvre 200 à 800, donc 800 ne charge aucun
fichier de plus.

**Caveat** (`font-hand`, `--font-hand`) : notes manuscrites décoratives de la
direction Mō (« bonjour ! », « une chose à la fois », « aujourd'hui, une
seule chose »). Jamais pour une consigne, un bouton, un libellé ni un chiffre
utile : la note est `aria-hidden` et l'information est portée ailleurs en
Plus Jakarta Sans. Fichier auto-hébergé `src/assets/fonts/caveat-600-latin.woff2`
(19 Ko, graisse 600, latin de base + caractères français, crénage seul ;
licence OFL à côté), chargé seulement quand une note s'affiche
(`unicode-range` + `font-display: swap`). Commande de régénération en tête
de `app.css`.

Échelle Tailwind par défaut, plus `text-2xs` (11/16) et `text-3xs` (10/14,4)
pour le chrome compact. Champs `text-base` (16 px, pas de zoom iOS).
Prose des ressources (`.article-body`) : 17 px / 1.8, chapô 19 px / 1.75 avec
filet sarcelle (`--brand`) de 3 px, `h2` 24 px 800, `h3` 19 px 700, `strong`
650, `mark` sarcelle à 18 %, puces sarcelle.

## Layout

Espacement Tailwind par défaut. **Cibles tactiles 44 px sur mobile**, plus
denses à partir de `md` : Button `default` `h-11 md:h-8`, `lg` `h-12
md:h-9`, `icon` `size-11 md:size-8` ; Input `h-11 md:h-8`, Select `default` `h-10 md:h-8`. Card : `gap-4
py-4 px-4` (`size=sm` : `px-3`), pied `border-t bg-muted/50 p-4`. Coquille :
`ui/sidebar.tsx` + barre d'onglets mobile (`nav[aria-label="Navigation
principale"]`). `body { overflow-x: hidden }`.

## Elevation

Pas d'ombre sur les primitives : la Card se détache par `ring-1
ring-foreground/10`. Impression : rapport médical et plan de crise passent
en noir sur blanc sans ombre (`@media print`).

## Shapes

`--radius: 0.75rem` (12 px) avec multiplicateurs (`@theme` l. 72–79) : `sm`
7,2 px, `md` 9,6 px, `lg` 12 px, `xl` 16,8 px, `2xl` 21,6 px, `3xl` 26,4 px,
`4xl` 31,2 px. Button et Input `rounded-lg` ; petits boutons plafonnés
`rounded-[min(var(--radius-md),10px|12px)]` ; Card `rounded-xl`.

## Motion

Animations douces, longues, jamais brusques : `animate-float-slow` (8 s),
`animate-gentle-spin` (20 s), `animate-bounce-slow` (2 s), `animate-fade-in-up`
(0,8 s), `animate-slide-in-left|right` (0,3 s), `animate-tip-halo` (2,4 s),
`animate-tip-wiggle` (6 s), `animate-egg-shake` (1 s), `.critter-float`
(2 s), `animate-sos-breathe` (respiration carrée 4-4-4-4, cycle 16 s) et
`.mo-breathe` (respiration de Mō, 4 s, échelle 1 → 1,03 depuis le bas, **une
seule fois** à l'apparition, uniquement sous `prefers-reduced-motion:
no-preference` et sur demande). `.mo-guided-breath-body|macron` : Mō respire
avec le cercle de `animate-sos-breathe` (mêmes clés, 16 s, `ease-in-out`,
corps 1 → 1,06 × 1,08 depuis le sol, macron levé de 5 unités), tant que
l'écran est ouvert ; seule animation de Mō en boucle (voir [Mō](#mō)).
`motion/react` pour le reste. `prefers-reduced-motion: reduce` coupe tout
(`0.001ms`).

## Components

shadcn `base-nova` (`apps/web/components.json`), primitives **Base UI**
(`@base-ui/react`), icônes `lucide-react` (158 imports), `sonner`.

| Composant | Conventions | Source |
| --- | --- | --- |
| `Badge` | Variantes `default` (encre : sélection), `brand` (sarcelle douce : étiquette informative), `secondary`, `destructive`, `outline`, `ghost`, `link` | `ui/badge-variants.ts` |
| `Button` | Variantes `default`, `outline`, `secondary`, `ghost`, `destructive` (fond `destructive/10`, texte destructive), `link` ; tailles `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg` ; icônes via `data-icon` | `ui/button-variants.ts` |
| `Callout` | Variantes `info`, `tip`, `warning`, `success`, `danger` sur les surfaces ci-dessus | `ui/callout-variants.ts` |
| `Card` | `rounded-xl ring-1 ring-foreground/10`, prop `size` | `ui/card.tsx` |
| `Mo` | Mō, voir [Mō](#mō) | `mo/mo.tsx` |
| `MoodBadge` | Pastel au sens fixe et libellé en texte. Par défaut, avec le Mō (`aria-hidden`) de `PARENT_MOOD_FACES`, pour les sélecteurs d'humeur ; `mo={false}` + `surface` : sans Mō, pour les listes et les niveaux calculés. `sm` (Mō 32 px) ou `md` (44 px) | `mo/mood-badge.tsx` |
| `PageHeader` | Titre de page 800, 30 px mobile, 36 px bureau, interligne 1,1 ; sous-titre encre douce ; action à droite sur bureau | `layout/page-header.tsx` |
| `EntryCard` | Entrée datée : titre (date) en 700, métadonnées pleine largeur dessous, actions de 44 px qui passent sous le titre si le texte est agrandi | `shared/entry-card.tsx` |
| `FilterChips` | Filtres à choix unique : boutons `aria-pressed` dans un groupe nommé, encre pleine + coche pour la sélection, 44 px ; une ligne qui défile (barre fine) sous `sm`, à la ligne à partir de `sm` ; la puce focalisée défile en entier dans la vue | `shared/filter-chips.tsx` |
| `EmptyState` | Mō `accueil` ou `calme` (112 px), note Caveat `aria-hidden`, titre, phrase, au plus une action | `shared/empty-state.tsx` |
| `MoScene`, `MoIconArt` | Scènes et pictogrammes de la direction (décor + Mō), à la largeur du parent | `mo/mo-scene.tsx` |
| `InputGroup` | `InputGroupAddon`, `InputGroupButton`, `InputGroupInput` | `ui/input-group*.tsx` |
| Autres | `alert-dialog`, `breadcrumb`, `checkbox`, `dialog`, `dropdown-menu`, `page-loader`, `popover`, `progress`, `radio-group`, `select`, `sheet`, `sidebar`, `slider`, `tabs`, `tooltip` | `ui/` |

Le lanceur flottant de Koe est masqué (`.koe-root > button { display: none
}`) : le widget s'ouvre depuis le menu utilisateur. Sa feuille (Tailwind v3,
sans couche) est importée dans la couche `base` (`components/koe-widget.css`) :
hors couche, sa remise à zéro `*, :before, :after { --tw-ring-shadow… }`
neutralisait tous les `ring-*` de l'espace connecté (focus, sélection, filet
des cartes).

## Mō

La mascotte de la direction validée le 2026-10-25 : un rond menthe, le ventre
du ō, et au-dessus de la tête le macron, un trait sarcelle qui porte l'humeur.
**Mō n'a pas de genre** : on n'écrit ni « il » ni « elle », on répète « Mō »
ou on tourne la phrase (« Mō fait une chose à la fois », « son trait montre
son humeur »). Les états sont des noms (calme, fatigue, fierté), jamais des
adjectifs accordés. Mō apparaît côté parent (web) et côté enfant (app Expo,
par `@focusflow/mo/child`).

### Règles d'usage

- **Pas à côté des prix** : l'écran « Ce qui est gratuit, ce qui est
  payant » de l'onboarding (freemium-ethics-policy §4, écran 5 sur 6,
  obligatoire : « Passer » y mène) n'a pas de Mō.
- **Où** : l'onboarding ; le check-in d'humeur du parent (accueil) ; les
  états vides (accueil sans enfant, `EmptyState`) ; la carte « une seule
  chose » de l'accueil ; les fins d'étape, en fierté (carte « une seule
  chose » quand tout est fait) ; les raccourcis de la saisie des symptômes
  (« Journée calme » et « Journée difficile », un sélecteur). Pas dans
  l'historique des relevés : `MoodBadge mo={false}`.
- **Jamais** : en mode crise ou dans le SOS (sauf « Respirez avec moi »,
  ci-dessous) ; sur le rapport PDF, les montants ou la facturation ; à côté
  d'un paywall, d'un prix ou d'un upsell (`docs/freemium-ethics-policy.md` §2
  et §6).
- **Exception « Respirez avec moi »** (SOS, respiration guidée, décision du
  2026-10-25, reportée dans DIRECTION.md) : Mō, en `calme`, est au centre du
  cercle et respire avec le parent (`guidedBreath`). Raison : le parent a
  lancé ce guide lui-même et l'écran parle à la première personne ; Mō est le
  « moi » qui respire avec lui. L'animation suit exactement les phases du
  cercle (inspiration, rétention, expiration, pause de 4 s) tant que le
  cercle respire, jusqu'à la fermeture de l'écran : un Mō qui s'arrêterait
  avant le cercle donnerait l'impression d'abandonner le parent. Jamais un
  état négatif, aucun compteur ni texte enjoué. Sous
  `prefers-reduced-motion`, Mō est immobile et la consigne continue de
  changer. Le reste du SOS (choix, sensoriel, diversion) reste sans Mō.
- **Humeur du parent** : une seule table score → état
  (`components/mo/parent-mood-faces.ts`), lue par l'onboarding et par
  l'accueil : 1 fatigue, 2 trop-plein, 3 inquiétude, 4 calme, 5 fierté.
- **Journée de l'enfant** : le niveau d'un relevé est calculé par l'app à
  partir des curseurs. Il ne passe pas par la table des humeurs et n'a pas
  de Mō ; seul son pastel compte (voir « Pastels à sens fixe »).
- **États négatifs** (`fatigue`, `inquietude`, `trop-plein`,
  `MO_REFLECTION_STATES`) : seulement pour refléter un choix du parent
  (sélecteurs d'humeur). Jamais de l'initiative de l'app, jamais côté enfant.
- **Une fois par écran**, sauf dans un sélecteur d'humeur (DIRECTION.md).
  Jamais un Mō par ligne d'une liste ou d'un historique. « Respirez avec
  moi » respecte aussi cette règle : un seul Mō, au centre du cercle.
- **Mouvement** : jamais animé en boucle (DIRECTION.md), sauf la respiration
  guidée ci-dessus. `breathe` (4 s, très
  doux) est optionnel, réservé à l'état calme : une seule respiration à
  l'apparition, puis Mō reste immobile ; aucune sous `prefers-reduced-motion`.
  Même règle dans l'app Expo.
- **Accessibilité** : décoratif (`aria-hidden`) partout ; le texte voisin
  porte l'information. `label` passe en `role="img"` avec un nom français
  épicène (`mo.label.<état>` : « Mō, au calme », « Mō, avec de la fatigue »).

### Composant

```tsx
<Mo state="accueil" size={104} />                 // décoratif
<Mo state="calme" size={44} label />              // role="img", « Mō, au calme »
<Mo state="calme" size={112} breathe />           // une respiration à l'apparition, si mouvement permis
<Mo state="calme" size={112} guidedBreath={{ startedAt }} /> // SOS « Respirez avec moi » seulement
```

- `guidedBreath={{ startedAt }}` : `startedAt` est le `performance.now()` du
  début de l'exercice. Le dessin arrive en différé ; un délai négatif
  (`--mo-breath-delay`) cale Mō sur le cercle déjà parti. Le corps est groupé
  autour du sol (`art.ground`) et le macron à part (`part: "macron"`, isolé
  par `markMacron` dans `generate.mjs`), donc réservé aux états qui ont un
  macron isolé (`calme`, `bravo`).

- `size` en pixels : **sous 96 px, la version petite** (viewBox `6 18 188 188`,
  trait plus épais, sans reflets) est choisie seule (`pickMoSize`) ; de 96 à
  320 px, la grande (`-10 -10 220 220`).
- `shadow={false}` retire l'ombre au sol (Mō posé sur un objet).
- Chaque état × taille est un module chargé à la demande (`loadMoArt`), mis
  en cache en mémoire ; un fond vide de la bonne taille évite tout
  décalage. Les modules (22) vont dans `assets/mo/`, hors précache du service
  worker (cache au premier affichage).

### Données : `@focusflow/mo`

Package TS pur (`packages/mo`), sans React : `viewBox` et liste de tracés
(`d`, `fill`, `stroke`, `strokeWidth`, `opacity`, `part: "shadow"`) pour les
11 états en deux tailles, plus les scènes de l'onboarding et les
pictogrammes des objectifs, en clair seulement (22 dessins de Mō), plus les
compagnons et pictos côté enfant. Le web les passe à `<svg>`/`<path>`, l'app
Expo à `Svg`/`Path` de react-native-svg par l'entrée synchrone
`@focusflow/mo/child`. La direction livre aussi un Mō sombre
(`mascotte/dark/`) : il n'est pas importé.

- `svg/` : sources copiées de la direction (`scripts/import-direction.mjs
  <dossier>`), sans modification.
- `src/generated/` : écrit par `pnpm --filter @focusflow/mo generate`
  (déterministe : nombres allégés, commandes répétées implicites, géométrie
  identique). Le test du package échoue si `src/generated` n'est plus à
  jour ou si l'allègement change un seul point.

### Scènes

Le trait encre du décor et des pictogrammes suit la couleur du texte
(`currentColor`) ; les notes manuscrites suivent `foreground`. Une scène peut
porter une variante de pose (`poseOverrides`, ex. « C'est parti » : macron
rapproché de la tête quand Mō tient la main de l'enfant).

## Do's and Don'ts

**À faire** (`AGENTS.md`)
- Une seule action principale par écran ; libellés explicites plutôt qu'icônes seules.
- Confirmation explicite et possibilité d'annuler pour toute action destructrice.
- Mêmes patterns partout (boutons, formulaires, navigation).
- Encadrés via `Callout` et les surfaces `*-surface` / `*-border` / `*-foreground`.

**À éviter**
- Animations agressives, notifications intrusives, changements de mise en page imprévus.
- Jargon, options superflues, paramètres enfouis.
- Couleurs de palette brute (`gray-*`, `amber-*`…) à la place des tokens.
- Texte en `brand` (sarcelle `#358891`) : sous 4,5:1 sur crème. Le texte sarcelle passe par `brand-strong`.
- `primary` pour un lien ou un chiffre : depuis Mō, `primary` est l'encre ; un lien en encre ne se distingue plus du texte.

## Responsive

Mobile d'abord : contrôles 44 px par défaut, densifiés à `md`. Ruptures
Tailwind par défaut. PWA web, app native séparée (`apps/mobile`).
Impression A4 dédiée pour le rapport médical et le plan de crise.

## Known Gaps

Écarts constatés dans le code et encore ouverts.

- **Palette de l'app Expo recopiée** : `apps/mobile/src/lib/theme.tsx` reprend les valeurs Mō de `app.css` à la main (pas de thème partagé). Un changement de token web doit y être reporté.
- **Pastels pas encore partout** : onboarding, accueil et Symptômes les utilisent ; les autres écrans les adopteront avec la refonte (audit des écrans du 2026-10-25, quatre PR).
- **Encre du logo** : `brand/` garde l'encre `#1f2937` dans le mot-symbole vectorisé ; l'encre de l'interface est `#1E2A2E`. Écart invisible à l'œil, laissé tel quel tant que le logo n'est pas redessiné.

1. **Select plus bas que Button et Input sur mobile** : Select `default` `h-10` (40 px) contre `h-11` (44 px) pour Button et Input, sous la cible tactile de 44 px.
2. **Étoiles de récompense en `status-warning`** (`#f59e0b`, 2,15:1 sur carte claire) : icônes `Star` de `rewards/` et la KPI « étoiles » du tableau de bord. Décoratives à côté d'un nombre, laissées telles quelles.

Corrigés le 2026-10-25 :

- **Mode sombre retiré** (web et app Expo) : plus de Graphite Mō, de classe `.dark`, de variantes `dark:`, de sélecteur de thème (en-tête et carte « Apparence » du compte) ni de `next-themes`. Le choix rangé sous `localStorage["toko-theme"]` est effacé au démarrage et n'était stocké nulle part en base. Mō sombre, `SCENE_DARK_FILLS` et les boucles `*-dark` de `public/visuals/` sont supprimés.
- **`theme-color`, manifeste et écran de démarrage** : une seule balise `theme-color` crème `#FBF6EE`, sans media query. Manifeste : `theme_color` et `background_color` en crème (avant : sarcelle `#358891`, nuit `#091123`, fond `#fdf9f4`).
- **App Expo en Mō** : palette Mō claire seule (`userInterfaceStyle: "light"`, appliqué sur Android par `expo-system-ui`), Mō et compagnons dessinés par `@focusflow/mo/child`.
- **Anneau de focus** : `ring-ring/50` (1,85:1 sur crème) remplacé par la sarcelle pleine dans `ui/` et les quiz ; contour par défaut `outline-ring` au lieu de `outline-ring/50`.
- **`ring-*` sans effet une fois connecté** : la feuille du widget Koe les neutralisait (voir Components).

Corrigés le 2026-10-10 :

- Collision de nom `accent` : l'échelle miel s'appelle `honey-50…900` ; `accent` ne désigne plus que le rôle shadcn.
- Trois rouges : `status-danger` et `danger-*` dérivent de `--destructive`.
- Statuts en double : les surfaces `success-*` / `warning-*` dérivent de `status-*` ; le texte et les icônes de statut (tendances KPI, résumé de symptôme, checklist, alerte e-mail admin) passent sur `*-foreground`, qui a une valeur sombre. Avant : texte `status-success` / `status-warning` à 2,54:1 / 2,15:1 sur carte claire, `status-danger` à 4,49:1 sur sa surface claire et 3,16:1 sur carte sombre. Après : `*-foreground` à ≥ 6,39:1 en clair et ≥ 7,62:1 en sombre, sur carte comme sur surface teintée.
- Hauteurs de contrôle : Input `md:h-8`, aligné sur Button et Select (32 px).
- `--radius-default` supprimé.
- `honey-foreground` et les surfaces miel lisent l'échelle `honey-*` au lieu d'hex recopiés.
- `--destructive-foreground` ajouté (4,69:1 en clair, 6,28:1 en sombre) ; les deux boutons de confirmation pleins (`billing-card`, `family-members-list`) avaient un texte hérité (sombre sur rouge en clair) et un fond `destructive/20` en sombre ; ils sont pleins dans les deux modes.
- `print:bg-gray-100` remplacé par `print:bg-muted` dans le plan de crise.

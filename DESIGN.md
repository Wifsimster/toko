---
name: Tokō — Mō (clair) / Graphite Mō (sombre)
source: apps/web/src/app.css
direction: "Mō, validée le 2026-10-25"
mode: light (Mō) + dark (Graphite Mō, class .dark)
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
  dark:
    background: "#141C1F"            # encre profonde, oklch(0.220 0.013 223)
    foreground: "#FBF6EE"            # crème
    card: "#1E2A2E"                  # encre de la marque
    card-foreground: "#FBF6EE"
    popover: "#1E2A2E"
    popover-foreground: "#FBF6EE"
    primary: "#FBF6EE"               # crème : bouton principal inversé
    primary-foreground: "#1E2A2E"
    secondary: "#24393A"
    secondary-foreground: "#FBF6EE"
    muted: "#27353A"
    muted-foreground: "#B4BCBF"
    accent: "#27353A"
    accent-foreground: "#FBF6EE"
    destructive: "oklch(0.70 0.17 25)"
    destructive-foreground: "#141C1F"
    border: "oklch(1 0 0 / 10%)"
    input: "oklch(1 0 0 / 14%)"
    ring: "#7CC3CA"
    brand: "#7CC3CA"                 # sarcelle claire, oklch(0.773 0.072 204)
    brand-strong: "#8FD1D7"          # oklch(0.819 0.067 203)
    surface-mint: "#1F3935"
    surface-peach: "#3D2C24"
    surface-lavender: "#2C2A3E"
    surface-honey: "#38301F"
    surface-sky: "#213140"
    surface-rose: "#3A2829"
    chart: ["#7CC3CA", "oklch(0.72 0.07 150)", "oklch(0.80 0.10 70)", "oklch(0.75 0.10 280)", "oklch(0.70 0.05 220)"]
    sidebar: "#1A2427"
    sidebar-foreground: "#FBF6EE"
    sidebar-primary: "#FBF6EE"
    sidebar-primary-foreground: "#1E2A2E"
    sidebar-accent: "#27353A"
    sidebar-accent-foreground: "#FBF6EE"
    sidebar-border: "oklch(1 0 0 / 10%)"
    sidebar-ring: "#7CC3CA"
    info-surface: "color-mix(in oklab, #818cf8 16%, transparent)"
    info-border: "color-mix(in oklab, #818cf8 38%, transparent)"
    info-foreground: "color-mix(in oklab, #b3bafb 95%, white)"
    warning-surface: "color-mix(in oklab, var(--color-status-warning) 15%, transparent)"
    warning-border: "color-mix(in oklab, var(--color-status-warning) 38%, transparent)"
    warning-foreground: "color-mix(in oklab, #f5c563 95%, white)"
    success-surface: "color-mix(in oklab, var(--color-status-success) 18%, transparent)"
    success-border: "color-mix(in oklab, var(--color-status-success) 42%, transparent)"
    success-foreground: "color-mix(in oklab, #6ee7b7 95%, white)"
    danger-surface: "color-mix(in oklab, var(--destructive) 18%, transparent)"
    danger-border: "color-mix(in oklab, var(--destructive) 42%, transparent)"
    danger-foreground: "color-mix(in oklab, var(--destructive) 50%, white)"
    honey-surface: "color-mix(in oklab, var(--color-honey-300) 12%, transparent)"
    honey-border: "color-mix(in oklab, var(--color-honey-300) 30%, transparent)"
    honey-foreground: "var(--color-honey-200)"
  scales:
    honey: { 50: "#faf6ec", 100: "#f3eacb", 200: "#e8d49b", 300: "#d8b865", 400: "#c39a3e", 500: "#a37e29", 600: "#846522", 700: "#6a521e", 800: "#56431a", 900: "#463716" }
    sage: { 50: "#f4f7f4", 100: "#e4ece4", 200: "#c9d9c9", 300: "#a3bea3", 400: "#7a9e7a", 500: "#5a815a", 600: "#466846", 700: "#3a5339", 800: "#304430", 900: "#293829" }
    status: { success: "#10b981", warning: "#f59e0b", danger: "var(--destructive)" }
typography:
  sans: "'Plus Jakarta Sans Variable', system-ui, sans-serif"
  heading: "'Plus Jakarta Sans Variable', system-ui, sans-serif"
  heading-weight: "800 (h1, h2 et titres ≥ text-2xl), letter-spacing -0.025em"
  wordmark: "'Source Serif 4 Variable', Georgia, serif (mot-symbole Tokō seulement)"
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
---

# Tokō — DESIGN.md

Ce fichier décrit le design system de l'app web **tel qu'il existe dans le
code**. Il ne propose rien. Chaque valeur vient de `apps/web/src/app.css`
sauf mention contraire ; en cas d'écart, le code fait foi et l'écart va dans
[Known Gaps](#known-gaps). L'app mobile (`apps/mobile/src/lib/theme.tsx`), la
vidéo (`apps/video/src/theme.ts`) et le PDF (`apps/api/src/lib/report/pdf/theme.ts`)
ont leurs propres thèmes, hors périmètre ici.

## Overview

Application pour des **parents TDAH qui élèvent des enfants TDAH**. Les
principes de `AGENTS.md` priment sur l'esthétique : simplicité maximale, une
seule action principale par écran, lisibilité immédiate, pas de surprise (ni
animation agressive, ni changement de mise en page imprévu).

Visuellement, direction **Mō** (validée le 2026-10-25) : fond **crème**,
texte et bouton principal à l'**encre** (presque noire, teintée sarcelle), la
**sarcelle** de la marque en accent (progression, points d'étape, onglet
actif, focus) et six **pastels à sens fixe** pour les surfaces. En sombre,
**Graphite Mō** inverse l'encre et la crème et éclaircit la sarcelle. Deux
échelles d'accent restent : **miel** pour la célébration, **sauge** pour la
croissance. Titres et corps en Plus Jakarta Sans (titres en 800) ; Source
Serif 4 ne sert qu'au mot-symbole.

## Colors

Tailwind v4. Rôles shadcn en hex dans `:root` et `.dark` (valeurs de la
direction et de la marque ; OKLCH équivalent dans le frontmatter), exposés
par `@theme inline`. Échelles et surfaces de statut dans `@theme`. Dark :
classe `.dark` (`@custom-variant dark (&:is(.dark *))`).

### Trois rôles pour l'encre et la sarcelle

| Utilitaire | Clair | Sombre | Pour | Jamais pour |
| --- | --- | --- | --- | --- |
| `primary` | encre `#1E2A2E` | crème `#FBF6EE` | Bouton principal, puce ou segment sélectionné (`bg-primary text-primary-foreground`), anneau de sélection (`border-primary`, `ring-primary`) | Liens, chiffres mis en avant |
| `brand` | sarcelle `#358891` | `#7CC3CA` | Accents **non textuels** : barres de progression, points d'étape, puces de liste, filets, tracés, teintes (`bg-brand/10`, `border-brand/20`), focus (`ring`) | Texte : 3,84:1 sur crème, sous 4,5:1 |
| `brand-strong` | sarcelle texte `#23676E` | `#8FD1D7` | Seule sarcelle permise pour du **texte** : liens (`Button variant="link"`), chiffres, libellés et icônes porteuses de sens (`text-brand-strong`) | Aplats |

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

| Token | Mō (clair) | Graphite Mō (sombre) | Rôle |
| --- | --- | --- | --- |
| `--background` | `#FBF6EE` crème | `#141C1F` encre profonde | Fond |
| `--foreground` | `#1E2A2E` encre | `#FBF6EE` crème | Texte |
| `--card` / `--popover` | `#FFFDF9` | `#1E2A2E` | Cartes, menus |
| `--primary` | `#1E2A2E` | `#FBF6EE` | Encre : action principale, sélection |
| `--primary-foreground` | `#FBF6EE` | `#1E2A2E` | |
| `--brand` | `#358891` | `#7CC3CA` | Sarcelle : accent non textuel |
| `--brand-strong` | `#23676E` | `#8FD1D7` | Sarcelle texte |
| `--secondary` | `#DCEFE8` menthe | `#24393A` | Secondaire |
| `--secondary-foreground` / `--accent-foreground` | `#1E2A2E` | `#FBF6EE` | |
| `--muted` / `--accent` | `#F3ECE1` | `#27353A` | Surfaces calmes, survol |
| `--muted-foreground` | `#4F585E` encre douce | `#B4BCBF` | Texte secondaire |
| `--destructive` | `oklch(0.55 0.18 25)` | `oklch(0.70 0.17 25)` | Seul rouge de l'app ; `danger-*` et `status-danger` en dérivent. Assombri de 0.58 à 0.55 en clair : sur crème, l'ancien tombait à 4,4:1 |
| `--destructive-foreground` | `#FFFDF9` | `#141C1F` | Texte sur `bg-destructive` plein |
| `--border` / `--input` | `#E8E0D3` | `oklch(1 0 0 / 10%)` / `/ 14%` | |
| `--ring` | `#358891` | `#7CC3CA` | Focus (≥ 3:1 sur le fond) |
| `--chart-1…5` | sarcelle, sauge 150, abricot 70, lavande 280, bleu-gris 220 | versions éclaircies | Graphiques (Recharts) |
| `--sidebar-*` | fond `#F7F1E7`, reste aligné sur primary / accent / border | fond `#1A2427` | Sidebar ; l'entrée active est en `bg-brand/10 text-brand-strong` |

### Pastels à sens fixe

Six surfaces de même luminosité (≈ 0,92 à 0,94 en OKLCH) : elles changent de
teinte, pas de poids, donc aucune carte ne crie plus fort qu'une autre.
Utilitaires `bg-surface-*`. Texte dessus : `foreground`, `muted-foreground`
ou `brand-strong` (tous AA, voir Contrastes). Une couleur garde son sens
partout ; ne pas en prendre une pour son seul effet décoratif.

| Token | Clair | Sombre | Sens |
| --- | --- | --- | --- |
| `surface-mint` | `#DCEFE8` | `#1F3935` | Calme, suivi |
| `surface-peach` | `#FBE1CF` | `#3D2C24` | Crise, SOS |
| `surface-lavender` | `#E6E2F4` | `#2C2A3E` | Fatigue, Barkley |
| `surface-honey` | `#F7E8C6` | `#38301F` | Matins, fierté |
| `surface-sky` | `#DCE9F2` | `#213140` | Soir |
| `surface-rose` | `#F6DEDB` | `#3A2829` | Sens pas encore fixé : ne pas l'utiliser avant décision |

Cette PR pose les tokens ; les écrans les adopteront au fil de la refonte.

### Encadrés (callouts) et statuts

Surfaces à base d'alpha pour marcher sur les deux fonds ; `.dark` redéfinit
les valeurs (frontmatter). Utilitaires : `bg-info-surface`,
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

| Texte / élément | Surface | Mō (clair) | Graphite Mō (sombre) | Seuil |
| --- | --- | --- | --- | --- |
| `foreground` | `background` | 13,69 | 16,06 | 4,5 |
| `foreground` | `card` | 14,50 | 13,69 | 4,5 |
| `foreground` | `muted` | 12,55 | 11,78 | 4,5 |
| `foreground` | `secondary` | 12,31 | 11,34 | 4,5 |
| `foreground` | 6 pastels | 11,49 à 12,31 | 11,52 à 12,94 | 4,5 |
| `foreground` | `bg-brand/10` sur carte | 12,89 | 11,17 | 4,5 |
| `muted-foreground` | `background` | 6,75 | 8,96 | 4,5 |
| `muted-foreground` | `card` | 7,15 | 7,63 | 4,5 |
| `muted-foreground` | `muted` | 6,19 | 6,57 | 4,5 |
| `muted-foreground` | 6 pastels | 5,67 à 6,07 | 6,42 à 7,22 | 4,5 |
| `brand-strong` | `background` | 6,03 | 10,09 | 4,5 |
| `brand-strong` | `card` | 6,39 | 8,61 | 4,5 |
| `brand-strong` | `muted` | 5,53 | 7,41 | 4,5 |
| `brand-strong` | 6 pastels | 5,06 à 5,42 | 7,24 à 8,14 | 4,5 |
| `brand-strong` | `bg-brand/10` sur carte | 5,68 | 7,02 | 4,5 |
| `brand-strong` | `bg-brand/5` sur fond | 5,70 | 9,24 | 4,5 |
| `brand-strong` (Badge `brand`) | `bg-brand/12` sur carte | 5,55 | 6,72 | 4,5 |
| `primary-foreground` | `primary` | 13,69 | 13,69 | 4,5 |
| `secondary-foreground` | `secondary` | 12,31 | 11,34 | 4,5 |
| `accent-foreground` | `accent` | 12,55 | 11,78 | 4,5 |
| `destructive-foreground` | `destructive` | 5,23 | 6,00 | 4,5 |
| `destructive` (texte) | `background` / `card` | 4,94 / 5,23 | 6,00 / 5,11 | 4,5 |
| `info-foreground` | carte / fond / surface | 6,35 / 6,00 / 5,78 | 8,22 / 9,64 / 6,42 | 4,5 |
| `warning-foreground` | carte / fond / surface | 7,00 / 6,61 / 6,30 | 9,39 / 11,01 / 7,15 | 4,5 |
| `success-foreground` | carte / fond / surface | 7,55 / 7,13 / 6,63 | 9,88 / 11,59 / 7,28 | 4,5 |
| `danger-foreground` | carte / fond / surface | 9,21 / 8,70 / 7,48 | 8,98 / 10,53 / 6,97 | 4,5 |
| `honey-foreground` | carte / fond / surface | 7,28 / 6,88 / 6,58 | 10,04 / 11,78 / 8,27 | 4,5 |
| `brand` (non textuel) | `background` / `card` / `muted` | 3,84 / 4,07 / 3,52 | 8,65 / 7,38 / 6,35 | 3 |
| `primary` (bouton, anneau) | `background` / `card` | 13,69 / 14,50 | 16,06 / 13,69 | 3 |
| `ring` | `background` | 3,84 | 8,65 | 3 |
| `primary-foreground` (icône de coche) | `brand` (étape Barkley faite) | 3,84 | 7,38 | 3 |

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
fichier de plus. Caveat (notes manuscrites de la direction Mō) n'est pas
encore dans l'app.

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
(2 s), et `animate-sos-breathe` (respiration carrée 4-4-4-4, cycle 16 s).
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
| `InputGroup` | `InputGroupAddon`, `InputGroupButton`, `InputGroupInput` | `ui/input-group*.tsx` |
| Autres | `alert-dialog`, `breadcrumb`, `checkbox`, `dialog`, `dropdown-menu`, `page-loader`, `popover`, `progress`, `radio-group`, `select`, `sheet`, `sidebar`, `slider`, `tabs`, `tooltip` | `ui/` |

Le lanceur flottant de Koe est masqué (`.koe-root > button { display: none
}`) : le widget s'ouvre depuis le menu utilisateur.

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

- **App mobile pas encore en Mō** : `apps/mobile/src/lib/theme.tsx` recopie les anciennes valeurs Porcelaine / Graphite (pas de thème partagé avec le web). À migrer dans une PR dédiée, avec les mêmes trois rôles (`primary` encre, `brand`, `brand-strong`).
- **Pastels posés, pas encore utilisés** : les `surface-*` existent, les écrans les adopteront avec la refonte (accueil, onboarding).
- **`theme-color` et manifeste PWA** : barre d'état sarcelle (`#358891`) en clair et nuit (`#091123`) en sombre, fond de lancement `#fdf9f4`. La direction montre une barre d'état crème ; à trancher avec l'écran de démarrage.
- **Encre du logo** : `brand/` garde l'encre `#1f2937` dans le mot-symbole vectorisé ; l'encre de l'interface est `#1E2A2E`. Écart invisible à l'œil, laissé tel quel tant que le logo n'est pas redessiné.

1. **Select plus bas que Button et Input sur mobile** : Select `default` `h-10` (40 px) contre `h-11` (44 px) pour Button et Input, sous la cible tactile de 44 px.
2. **Étoiles de récompense en `status-warning`** (`#f59e0b`, 2,15:1 sur carte claire) : icônes `Star` de `rewards/` et la KPI « étoiles » du tableau de bord. Décoratives à côté d'un nombre, laissées telles quelles.

Corrigés le 2026-10-10 :

- Collision de nom `accent` : l'échelle miel s'appelle `honey-50…900` ; `accent` ne désigne plus que le rôle shadcn.
- Trois rouges : `status-danger` et `danger-*` dérivent de `--destructive`.
- Statuts en double : les surfaces `success-*` / `warning-*` dérivent de `status-*` ; le texte et les icônes de statut (tendances KPI, résumé de symptôme, checklist, alerte e-mail admin) passent sur `*-foreground`, qui a une valeur sombre. Avant : texte `status-success` / `status-warning` à 2,54:1 / 2,15:1 sur carte claire, `status-danger` à 4,49:1 sur sa surface claire et 3,16:1 sur carte sombre. Après : `*-foreground` à ≥ 6,39:1 en clair et ≥ 7,62:1 en sombre, sur carte comme sur surface teintée.
- Hauteurs de contrôle : Input `md:h-8`, aligné sur Button et Select (32 px).
- `--radius-default` supprimé.
- `honey-foreground` et les surfaces miel lisent l'échelle `honey-*` au lieu d'hex recopiés.
- `--destructive-foreground` ajouté (4,69:1 en clair, 6,28:1 en sombre) ; les deux boutons de confirmation pleins (`billing-card`, `family-members-list`) avaient un texte hérité (sombre sur rouge en clair) et un fond `destructive/20` en sombre ; ils sont pleins dans les deux modes.
- `print:bg-gray-100` remplacé par `print:bg-muted` dans le plan de crise.

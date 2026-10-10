---
name: Tokō — Porcelaine / Graphite
source: apps/web/src/app.css
mode: light (Porcelaine) + dark (Graphite, class .dark)
colors:
  light:
    background: "oklch(0.982 0.003 85)"
    foreground: "oklch(0.27 0.014 262)"
    card: "oklch(1 0 0)"
    card-foreground: "oklch(0.27 0.014 262)"
    popover: "oklch(1 0 0)"
    popover-foreground: "oklch(0.27 0.014 262)"
    primary: "oklch(0.53 0.086 186)"
    primary-foreground: "oklch(0.985 0.005 186)"
    secondary: "oklch(0.952 0.013 172)"
    secondary-foreground: "oklch(0.38 0.017 258)"
    muted: "oklch(0.953 0.006 85)"
    muted-foreground: "oklch(0.53 0.017 261)"
    accent: "oklch(0.953 0.006 85)"
    accent-foreground: "oklch(0.38 0.017 258)"
    destructive: "oklch(0.58 0.18 25)"
    destructive-foreground: "oklch(1 0 0)"
    border: "oklch(0.925 0.007 89)"
    input: "oklch(0.925 0.007 89)"
    ring: "oklch(0.53 0.086 186)"
    chart: ["oklch(0.53 0.086 186)", "oklch(0.62 0.07 150)", "oklch(0.72 0.11 70)", "oklch(0.63 0.11 280)", "oklch(0.60 0.06 220)"]
    sidebar: "oklch(0.975 0.004 85)"
    sidebar-foreground: "oklch(0.27 0.014 262)"
    sidebar-primary: "oklch(0.53 0.086 186)"
    sidebar-primary-foreground: "oklch(0.985 0.005 186)"
    sidebar-accent: "oklch(0.953 0.006 85)"
    sidebar-accent-foreground: "oklch(0.38 0.017 258)"
    sidebar-border: "oklch(0.925 0.007 89)"
    sidebar-ring: "oklch(0.53 0.086 186)"
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
    background: "oklch(0.20 0.009 264)"
    foreground: "oklch(0.937 0.003 265)"
    card: "oklch(0.243 0.011 261)"
    card-foreground: "oklch(0.937 0.003 265)"
    popover: "oklch(0.243 0.011 261)"
    popover-foreground: "oklch(0.937 0.003 265)"
    primary: "oklch(0.818 0.086 185)"
    primary-foreground: "oklch(0.224 0.03 188)"
    secondary: "oklch(0.277 0.011 168)"
    secondary-foreground: "oklch(0.90 0.005 260)"
    muted: "oklch(0.27 0.011 261)"
    muted-foreground: "oklch(0.707 0.017 257)"
    accent: "oklch(0.27 0.011 261)"
    accent-foreground: "oklch(0.90 0.005 260)"
    destructive: "oklch(0.70 0.17 25)"
    destructive-foreground: "oklch(0.20 0.009 264)"
    border: "oklch(1 0 0 / 9%)"
    input: "oklch(1 0 0 / 13%)"
    ring: "oklch(0.818 0.086 185)"
    chart: ["oklch(0.818 0.086 185)", "oklch(0.72 0.07 150)", "oklch(0.80 0.10 70)", "oklch(0.75 0.10 280)", "oklch(0.70 0.05 220)"]
    sidebar: "oklch(0.243 0.011 261)"
    sidebar-foreground: "oklch(0.937 0.003 265)"
    sidebar-primary: "oklch(0.818 0.086 185)"
    sidebar-primary-foreground: "oklch(0.224 0.03 188)"
    sidebar-accent: "oklch(0.27 0.011 261)"
    sidebar-accent-foreground: "oklch(0.90 0.005 260)"
    sidebar-border: "oklch(1 0 0 / 9%)"
    sidebar-ring: "oklch(0.818 0.086 185)"
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
  heading: "'Source Serif 4 Variable', Georgia, serif"
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

Visuellement : **Porcelaine** en clair (blanc chaud presque neutre, teal
apaisé) et **Graphite** en sombre (surfaces neutres pour que les accents
restent nets). Deux accents doux : **miel** pour la célébration, **sauge**
pour la croissance. Titres en serif (Source Serif 4), corps en Plus Jakarta
Sans.

## Colors

Tailwind v4. Rôles shadcn en OKLCH dans `:root` (l. 119–153) et `.dark`
(l. 156–204), exposés par `@theme inline` (l. 82–116). Échelles et surfaces
de statut dans `@theme` (l. 9–80). Dark : classe `.dark`
(`@custom-variant dark (&:is(.dark *))`).

### Rôles shadcn

| Token | Porcelaine (clair) | Graphite (sombre) | Rôle |
| --- | --- | --- | --- |
| `--background` | `oklch(0.982 0.003 85)` | `oklch(0.20 0.009 264)` | Fond |
| `--foreground` | `oklch(0.27 0.014 262)` | `oklch(0.937 0.003 265)` | Texte |
| `--card` / `--popover` | `oklch(1 0 0)` | `oklch(0.243 0.011 261)` | Cartes, menus |
| `--primary` | `oklch(0.53 0.086 186)` | `oklch(0.818 0.086 185)` | Teal : action principale |
| `--primary-foreground` | `oklch(0.985 0.005 186)` | `oklch(0.224 0.03 188)` | |
| `--secondary` | `oklch(0.952 0.013 172)` | `oklch(0.277 0.011 168)` | Secondaire, teinté teal |
| `--secondary-foreground` / `--accent-foreground` | `oklch(0.38 0.017 258)` | `oklch(0.90 0.005 260)` | |
| `--muted` / `--accent` | `oklch(0.953 0.006 85)` | `oklch(0.27 0.011 261)` | Surfaces calmes, survol |
| `--muted-foreground` | `oklch(0.53 0.017 261)` | `oklch(0.707 0.017 257)` | Texte secondaire (≤ 5,0:1 en clair selon `app.css`) |
| `--destructive` | `oklch(0.58 0.18 25)` | `oklch(0.70 0.17 25)` | Seul rouge de l'app ; `danger-*` et `status-danger` en dérivent |
| `--destructive-foreground` | `oklch(1 0 0)` (4,69:1) | `oklch(0.20 0.009 264)` (6,28:1) | Texte sur `bg-destructive` plein |
| `--border` / `--input` | `oklch(0.925 0.007 89)` | `oklch(1 0 0 / 9%)` / `/ 13%` | |
| `--ring` | `oklch(0.53 0.086 186)` | `oklch(0.818 0.086 185)` | Focus |
| `--chart-1…5` | teal 186, sauge 150, abricot 70, lavande 280, bleu-gris 220 | versions éclaircies | Graphiques (Recharts) |
| `--sidebar-*` | fond `oklch(0.975 0.004 85)`, reste aligné sur primary / accent / border | fond `oklch(0.243 0.011 261)` | Sidebar |

### Encadrés (callouts) et statuts

Surfaces à base d'alpha pour marcher sur les deux fonds ; `.dark` redéfinit
les valeurs (frontmatter). Utilitaires : `bg-info-surface`,
`border-info-border`, `text-info-foreground`, idem `warning`, `success`,
`danger`, `honey`. L'info est lavande (`#818cf8`) pour ne jamais concurrencer
le teal.

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

## Typography

Fontsource (`@import` en tête de `app.css`) :

| Token | Famille | Usage |
| --- | --- | --- |
| `--font-sans` | Plus Jakarta Sans Variable | `html` (`font-sans antialiased`) |
| `--font-heading` | Source Serif 4 Variable | `h1–h6` (base layer), titres d'article |

Échelle Tailwind par défaut, plus `text-2xs` (11/16) et `text-3xs` (10/14,4)
pour le chrome compact. Champs `text-base` (16 px, pas de zoom iOS).
Prose des ressources (`.article-body`) : 17 px / 1.8, chapô 19 px / 1.75 avec
filet primary de 3 px, `h2` 24 px serif 600, `h3` 19 px, `strong` 650,
`mark` primary à 18 %, puces colorées primary.

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

## Responsive

Mobile d'abord : contrôles 44 px par défaut, densifiés à `md`. Ruptures
Tailwind par défaut. PWA web, app native séparée (`apps/mobile`).
Impression A4 dédiée pour le rapport médical et le plan de crise.

## Known Gaps

Écarts constatés dans le code et encore ouverts.

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

import {
  Heart,
  HeartHandshake,
  Brain,
  Compass,
  Library,
  Sun,
  Sprout,
  type LucideIcon,
} from "lucide-react";

export type ClusterTheme = {
  icon: LucideIcon;
  gradient: string; // tailwind gradient classes
  iconBg: string;
  iconColor: string;
  /** Tint for the subject badge on list cards: the colour marker lives inside
   * the badge instead of a separate icon circle, so a card stays identifiable
   * at a glance without an extra element to read. */
  badge: string;
};

const CLUSTER_THEMES: Record<string, ClusterTheme> = {
  "Pillar · Connaissance TDAH": {
    icon: HeartHandshake,
    gradient: "from-rose-100/60 via-amber-50/50 to-transparent",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
    badge:
      "border-rose-200 bg-rose-50 text-rose-700",
  },
  "Connaissance TDAH": {
    icon: Brain,
    gradient: "from-violet-100/50 via-indigo-50/40 to-transparent",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-700",
    badge:
      "border-violet-200 bg-violet-50 text-violet-700",
  },
  "Guide de gestion Barkley": {
    icon: Sprout,
    gradient: "from-emerald-100/50 via-teal-50/40 to-transparent",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  "Ressources pour les parents": {
    icon: Heart,
    gradient: "from-rose-100/50 via-pink-50/40 to-transparent",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
    badge:
      "border-rose-200 bg-rose-50 text-rose-700",
  },
  "Parcours de diagnostic en France": {
    icon: Sun,
    gradient: "from-yellow-100/50 via-amber-50/40 to-transparent",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-700",
    badge:
      "border-amber-200 bg-amber-50 text-amber-800",
  },
  "Parcours de soin en France": {
    icon: Compass,
    gradient: "from-teal-100/50 via-cyan-50/40 to-transparent",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-700",
    badge:
      "border-teal-200 bg-teal-50 text-teal-700",
  },
  "Ressources pour l'entourage": {
    icon: HeartHandshake,
    gradient: "from-sky-100/50 via-cyan-50/40 to-transparent",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-700",
    badge:
      "border-sky-200 bg-sky-50 text-sky-700",
  },
};

const FALLBACK_THEME: ClusterTheme = {
  icon: Library,
  gradient: "from-brand/10 via-accent/5 to-transparent",
  iconBg: "bg-brand/10",
  iconColor: "text-brand-strong",
  badge: "border-brand/25 bg-brand/5 text-brand-strong",
};

export function getClusterTheme(cluster: string): ClusterTheme {
  return CLUSTER_THEMES[cluster] ?? FALLBACK_THEME;
}

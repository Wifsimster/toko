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
  iconBg: string;
  iconColor: string;
};

const CLUSTER_THEMES: Record<string, ClusterTheme> = {
  "Pillar · Connaissance TDAH": {
    icon: HeartHandshake,
    iconBg: "bg-surface-peach",
    iconColor: "text-foreground",
  },
  "Connaissance TDAH": {
    icon: Brain,
    iconBg: "bg-surface-sky",
    iconColor: "text-foreground",
  },
  "Guide de gestion Barkley": {
    icon: Sprout,
    iconBg: "bg-surface-lavender",
    iconColor: "text-foreground",
  },
  "Ressources pour les parents": {
    icon: Heart,
    iconBg: "bg-surface-peach",
    iconColor: "text-foreground",
  },
  "Parcours de diagnostic en France": {
    icon: Sun,
    iconBg: "bg-surface-honey",
    iconColor: "text-foreground",
  },
  "Parcours de soin en France": {
    icon: Compass,
    iconBg: "bg-surface-mint",
    iconColor: "text-foreground",
  },
  "Ressources pour l'entourage": {
    icon: HeartHandshake,
    iconBg: "bg-surface-rose",
    iconColor: "text-foreground",
  },
};

const FALLBACK_THEME: ClusterTheme = {
  icon: Library,
  iconBg: "bg-brand/10",
  iconColor: "text-brand-strong",
};

export function getClusterTheme(cluster: string): ClusterTheme {
  return CLUSTER_THEMES[cluster] ?? FALLBACK_THEME;
}

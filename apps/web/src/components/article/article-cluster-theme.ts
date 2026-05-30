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
};

const CLUSTER_THEMES: Record<string, ClusterTheme> = {
  "Pillar · Connaissance TDAH": {
    icon: HeartHandshake,
    gradient: "from-rose-100/60 via-amber-50/50 to-transparent dark:from-rose-950/30 dark:via-amber-950/20",
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
    iconColor: "text-rose-600 dark:text-rose-300",
  },
  "Connaissance TDAH": {
    icon: Brain,
    gradient: "from-violet-100/50 via-indigo-50/40 to-transparent dark:from-violet-950/30 dark:via-indigo-950/20",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-300",
  },
  "Guide de gestion Barkley": {
    icon: Sprout,
    gradient: "from-emerald-100/50 via-teal-50/40 to-transparent dark:from-emerald-950/30 dark:via-teal-950/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-300",
  },
  "Ressources pour les parents": {
    icon: Heart,
    gradient: "from-rose-100/50 via-pink-50/40 to-transparent dark:from-rose-950/30 dark:via-pink-950/20",
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
    iconColor: "text-rose-600 dark:text-rose-300",
  },
  "Parcours de diagnostic en France": {
    icon: Sun,
    gradient: "from-yellow-100/50 via-amber-50/40 to-transparent dark:from-yellow-950/30 dark:via-amber-950/20",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/40",
    iconColor: "text-yellow-700 dark:text-yellow-300",
  },
  "Parcours de soin en France": {
    icon: Compass,
    gradient: "from-teal-100/50 via-cyan-50/40 to-transparent dark:from-teal-950/30 dark:via-cyan-950/20",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    iconColor: "text-teal-600 dark:text-teal-300",
  },
  "Ressources pour l'entourage": {
    icon: HeartHandshake,
    gradient: "from-sky-100/50 via-cyan-50/40 to-transparent dark:from-sky-950/30 dark:via-cyan-950/20",
    iconBg: "bg-sky-100 dark:bg-sky-900/40",
    iconColor: "text-sky-600 dark:text-sky-300",
  },
};

const FALLBACK_THEME: ClusterTheme = {
  icon: Library,
  gradient: "from-primary/10 via-accent/5 to-transparent",
  iconBg: "bg-primary/10",
  iconColor: "text-primary",
};

export function getClusterTheme(cluster: string): ClusterTheme {
  return CLUSTER_THEMES[cluster] ?? FALLBACK_THEME;
}

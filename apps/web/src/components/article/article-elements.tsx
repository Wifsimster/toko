import type { ReactNode } from "react";
import {
  Heart,
  Sparkles,
  HeartHandshake,
  Brain,
  Bed,
  Ear,
  Compass,
  Stethoscope,
  Pill,
  Smartphone,
  Trophy,
  Library,
  Sun,
  Sprout,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Cluster visuals ──────────────────────────────────────────────────
// One illustration per cluster: an icon + a soft pastel gradient. Used
// as a friendly hero on top of every article so the reader is greeted
// by something warm before the dense content starts.

type ClusterTheme = {
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

// ─── Hero ─────────────────────────────────────────────────────────────
// Replaces the bare cluster-badge header with a colorful, warmer header
// that includes a big cluster icon, decorative dots, and the cluster name.

export function ArticleHero({
  cluster,
  title,
  meta,
}: {
  cluster: string;
  title: ReactNode;
  meta?: ReactNode;
}) {
  const theme = getClusterTheme(cluster);
  const Icon = theme.icon;

  return (
    <header className="relative overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br dark:hidden",
          theme.gradient,
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/30 blur-3xl dark:bg-white/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/20 blur-2xl dark:bg-white/5"
      />

      <div className="relative px-5 py-7 sm:px-8 sm:py-9">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm sm:h-16 sm:w-16",
              theme.iconBg,
              theme.iconColor,
            )}
          >
            <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                theme.iconColor,
              )}
            >
              {cluster.replace(/^Pillar · /, "")}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight tracking-tight text-foreground lg:text-4xl lg:leading-[1.15]">
              {title}
            </h1>
            {meta && (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {meta}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Welcome intro ────────────────────────────────────────────────────
// Friendly preamble that tells the reader they are in the right place,
// they can take their time, and the article is written for them.

export function WelcomeIntro({
  audience = "parent",
}: {
  audience?: "parent" | "entourage";
}) {
  const message =
    audience === "entourage"
      ? "Vous êtes au bon endroit. Ce guide est court, sans jargon, et il a été écrit pour vous aider à comprendre — pas pour vous faire la leçon. Prenez le temps de le lire à votre rythme."
      : "Vous êtes au bon endroit. Vous n'êtes pas seul·e. Cet article a été pensé pour vous accompagner, pas pour vous juger. Lisez à votre rythme — vous pouvez y revenir autant de fois que nécessaire.";

  return (
    <aside className="my-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-4 w-4" />
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{message}</p>
    </aside>
  );
}

// ─── Key takeaways ────────────────────────────────────────────────────
// Visual "À retenir" card with checkmark bullets — placed at the start
// of long articles so a stressed parent can grasp the essentials in 30s.

export function KeyTakeaways({
  title = "Ce qu'il faut retenir",
  items,
}: {
  title?: string;
  items: ReactNode[];
}) {
  return (
    <aside className="my-8 rounded-2xl border border-emerald-200/60 bg-emerald-50/50 px-5 py-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
        <Sparkles className="h-4 w-4" />
        <p className="font-heading text-sm font-semibold uppercase tracking-wider">
          {title}
        </p>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// ─── Stat grid ────────────────────────────────────────────────────────
// Big-number visual cards. Replaces walls of "75% of children…" prose
// with a scannable, eye-catching mini-dashboard.

export type StatItem = {
  value: string;
  label: ReactNode;
  icon?: LucideIcon;
};

export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="my-7 grid gap-3 sm:grid-cols-3">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-center"
          >
            {Icon && (
              <Icon className="mx-auto mb-2 h-5 w-5 text-primary/70" />
            )}
            <div className="font-heading text-3xl font-semibold tracking-tight text-primary">
              {item.value}
            </div>
            <div className="mt-1.5 text-xs leading-snug text-muted-foreground">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Comparison ──────────────────────────────────────────────────────
// Side-by-side "ce qui aide" / "ce qui aggrave" cards. Used wherever an
// article currently lists pitfalls and remedies in two consecutive ULs.

export function Comparison({
  helpsTitle = "Ce qui aide",
  hurtsTitle = "Ce qui aggrave",
  helps,
  hurts,
}: {
  helpsTitle?: string;
  hurtsTitle?: string;
  helps: ReactNode[];
  hurts: ReactNode[];
}) {
  return (
    <div className="my-7 grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <div className="mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <p className="font-heading text-sm font-semibold uppercase tracking-wider">
            {helpsTitle}
          </p>
        </div>
        <ul className="space-y-2">
          {helps.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm leading-relaxed text-foreground/90"
            >
              <span
                aria-hidden
                className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-rose-200/60 bg-rose-50/40 p-5 dark:border-rose-900/40 dark:bg-rose-950/20">
        <div className="mb-3 flex items-center gap-2 text-rose-700 dark:text-rose-300">
          <XCircle className="h-4 w-4" />
          <p className="font-heading text-sm font-semibold uppercase tracking-wider">
            {hurtsTitle}
          </p>
        </div>
        <ul className="space-y-2">
          {hurts.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm leading-relaxed text-foreground/90"
            >
              <span
                aria-hidden
                className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Encouragement ───────────────────────────────────────────────────
// A soft, warm callout used at the end of difficult sections to remind
// the parent they're doing the right thing by reading.

export function Encouragement({ children }: { children: ReactNode }) {
  return (
    <aside className="my-6 flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50/40 px-5 py-4 dark:border-amber-900/40 dark:bg-amber-950/20">
      <Heart className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
      <p className="text-sm leading-relaxed text-foreground/90">{children}</p>
    </aside>
  );
}

// ─── Step list ────────────────────────────────────────────────────────
// Numbered visual steps — replaces dense numbered lists with a friendlier,
// more scannable layout (number badge + title + description).

export type StepItem = {
  title: string;
  description: ReactNode;
};

export function StepList({ items }: { items: StepItem[] }) {
  return (
    <ol className="my-7 space-y-4">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/40 px-4 py-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-base font-semibold text-primary">
            {i + 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-base font-semibold text-foreground">
              {item.title}
            </p>
            <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

// Re-export icons for use in article content authoring.
export {
  Heart,
  Sparkles,
  Brain,
  Bed,
  Ear,
  Stethoscope,
  Pill,
  Smartphone,
  Trophy,
};

import type { ReactNode } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

export function KeyTakeaways({
  title = "Ce qu'il faut retenir",
  items,
}: {
  title?: string;
  items: ReactNode[];
}) {
  return (
    <aside className="my-8 rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
        <Sparkles className="size-4" />
        <p className="font-heading text-sm font-semibold uppercase tracking-wider">
          {title}
        </p>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li
            key={`kt-${i}`}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

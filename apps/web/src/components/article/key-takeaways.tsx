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
    <aside className="my-10 rounded-2xl border border-success-border bg-success-surface p-5 sm:p-6">
      <div className="flex items-center gap-2 text-success-foreground">
        <Sparkles className="size-4" />
        <p className="font-heading text-sm font-semibold uppercase tracking-wider">
          {title}
        </p>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={String(item)}
            className="flex items-start gap-2.5 text-base leading-relaxed text-foreground/90"
          >
            <CheckCircle2 className="mt-1 size-4.5 shrink-0 text-success-foreground" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

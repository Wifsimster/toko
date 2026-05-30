import type { ReactNode } from "react";
import { Heart } from "lucide-react";

export function Encouragement({ children }: { children: ReactNode }) {
  return (
    <aside className="my-6 flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50/40 px-5 py-4 dark:border-amber-900/40 dark:bg-amber-950/20">
      <Heart className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" />
      <p className="text-sm leading-relaxed text-foreground/90">{children}</p>
    </aside>
  );
}

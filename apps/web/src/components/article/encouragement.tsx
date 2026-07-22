import type { ReactNode } from "react";
import { Heart } from "lucide-react";

export function Encouragement({ children }: { children: ReactNode }) {
  return (
    <aside className="my-6 flex items-start gap-3 rounded-xl border border-accent-200/60 bg-accent-50 px-5 py-4 dark:border-accent-800/40 dark:bg-accent-900/25">
      <Heart className="mt-0.5 size-5 shrink-0 text-accent-600 dark:text-accent-300" />
      <p className="text-sm leading-relaxed text-foreground/90">{children}</p>
    </aside>
  );
}

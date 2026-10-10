import type { ReactNode } from "react";
import { Heart } from "lucide-react";

export function Encouragement({ children }: { children: ReactNode }) {
  return (
    <aside className="my-8 flex items-start gap-3.5 rounded-xl border border-honey-200/60 bg-honey-50 px-5 py-5 dark:border-honey-800/40 dark:bg-honey-900/25">
      <Heart className="mt-0.5 size-5 shrink-0 text-honey-600 dark:text-honey-300" />
      <p className="text-base leading-relaxed text-foreground/90">{children}</p>
    </aside>
  );
}

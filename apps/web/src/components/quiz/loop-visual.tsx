import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Parcours } from "@/lib/screening/parcours";

// Small decorative loops rendered with Remotion (visuals/remotion) into
// public/visuals/quiz/<name>-<theme>.{webp,png}. The PNG is the still frame
// served when the user asks for reduced motion.
export type LoopName = "clarity" | "attention" | "wave" | "sensory" | "overlap" | "path";

const TOPIC_LOOP = { tdah: "attention", top: "wave", autisme: "sensory" } as const;

export function loopForParcours(p: Pick<Parcours, "sections">): LoopName {
  return p.sections.length > 1 ? "overlap" : TOPIC_LOOP[p.sections[0]!.topic];
}

// next-themes puts `.dark` on <html> before first paint. Reading it (rather
// than rendering both variants and hiding one in CSS) means a phone only
// downloads the loop it shows: an eager hidden <img> is still fetched.
function useIsDark(): boolean {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setDark(root.classList.contains("dark")));
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

/** `eager` for the hero loop above the fold; the others load lazily. */
export function LoopVisual({ name, className, eager }: { name: LoopName; className?: string; eager?: boolean }) {
  const base = `/visuals/quiz/${name}-${useIsDark() ? "dark" : "light"}`;
  return (
    <picture className={cn("block print:hidden", className)} aria-hidden>
      <source srcSet={`${base}.png`} media="(prefers-reduced-motion: reduce)" />
      <img
        src={`${base}.webp`}
        alt=""
        width={480}
        height={240}
        decoding="async"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className="h-auto w-full"
      />
    </picture>
  );
}

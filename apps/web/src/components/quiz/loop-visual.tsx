import { cn } from "@/lib/utils";
import type { Parcours } from "@/lib/screening/parcours";

export type LoopName = "clarity" | "attention" | "wave" | "sensory" | "overlap" | "path";

const TOPIC_LOOP = { tdah: "attention", top: "wave", autisme: "sensory" } as const;

export function loopForParcours(p: Pick<Parcours, "sections">): LoopName {
  return p.sections.length > 1 ? "overlap" : TOPIC_LOOP[p.sections[0]!.topic];
}

export function LoopVisual({ name, className, eager }: { name: LoopName; className?: string; eager?: boolean }) {
  const base = `/visuals/quiz/${name}-light`;
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

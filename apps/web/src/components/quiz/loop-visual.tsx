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

function Themed({ name, theme, className, eager }: { name: LoopName; theme: "light" | "dark"; className: string; eager?: boolean }) {
  const base = `/visuals/quiz/${name}-${theme}`;
  return (
    <picture className={className}>
      <source srcSet={`${base}.png`} media="(prefers-reduced-motion: reduce)" />
      <img
        src={`${base}.webp`}
        alt=""
        width={480}
        height={240}
        decoding="async"
        loading={eager ? "eager" : "lazy"}
        className="h-auto w-full"
      />
    </picture>
  );
}

/** `eager` for the hero loop above the fold; the others load lazily. */
export function LoopVisual({ name, className, eager }: { name: LoopName; className?: string; eager?: boolean }) {
  return (
    <span className={cn("block print:hidden", className)} aria-hidden>
      <Themed name={name} theme="light" className="block dark:hidden" eager={eager} />
      <Themed name={name} theme="dark" className="hidden dark:block" eager={eager} />
    </span>
  );
}

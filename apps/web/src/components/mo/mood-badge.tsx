import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Mo } from "./mo";
import { PARENT_MOOD_FACES, type MoodScore } from "./parent-mood-faces";

const SIZES = {
  // Sous 96 px, `<Mo>` prend seul sa version petite (trait plus épais).
  sm: { mo: 32, box: "min-h-11 gap-2 rounded-xl py-1 pr-3 pl-1.5 text-sm" },
  md: { mo: 44, box: "min-h-14 gap-3 rounded-2xl py-1.5 pr-4 pl-2 text-[0.9375rem]" },
} as const;

/**
 * Une humeur montrée par Mō, sur le pastel au sens fixe de la table
 * partagée (`PARENT_MOOD_FACES`). Le libellé porte l'information : Mō est
 * décoratif (`aria-hidden`). Ne jamais l'utiliser en mode crise, sur le
 * rapport ni à côté d'un prix (DESIGN.md, « Mō »).
 */
export function MoodBadge({
  score,
  label,
  size = "md",
  trailing,
  className,
}: {
  score: MoodScore;
  label: ReactNode;
  size?: keyof typeof SIZES;
  /** Élément ajouté en fin de ligne (chevron d'un bouton dépliant). */
  trailing?: ReactNode;
  className?: string;
}) {
  const face = PARENT_MOOD_FACES[score];
  const s = SIZES[size];
  return (
    <span
      data-slot="mood-badge"
      data-mood={face.state}
      className={cn(
        "flex w-full min-w-0 items-center text-foreground",
        face.surface,
        s.box,
        className,
      )}
    >
      <Mo state={face.state} size={s.mo} shadow={false} />
      <span className="min-w-0 flex-1 font-semibold hyphens-auto [overflow-wrap:break-word]">{label}</span>
      {trailing}
    </span>
  );
}

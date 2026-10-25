import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Mo } from "./mo";
import { PARENT_MOOD_FACES, type MoodScore } from "./parent-mood-faces";

const SIZES = {
  // Sous 96 px, `<Mo>` prend seul sa version petite (trait plus épais).
  sm: { mo: 32, box: "min-h-11 gap-2 rounded-xl py-1 pr-3 text-sm", padMo: "pl-1.5", padText: "pl-3" },
  md: { mo: 44, box: "min-h-14 gap-3 rounded-2xl py-1.5 pr-4 text-[0.9375rem]", padMo: "pl-2", padText: "pl-4" },
} as const;

type MoodBadgeProps = {
  label: ReactNode;
  size?: keyof typeof SIZES;
  /** Élément ajouté en fin de ligne (chevron d'un bouton dépliant). */
  trailing?: ReactNode;
  className?: string;
} & (
  | {
      /** Humeur du parent : Mō et pastel de `PARENT_MOOD_FACES`. */
      score: MoodScore;
      mo?: true;
    }
  | {
      /**
       * Sans Mō : pastel et libellé seuls. Pour les listes (un seul Mō par
       * écran, DIRECTION.md) et tout niveau calculé par l'app.
       */
      mo: false;
      /** Utilitaire de pastel au sens fixe (`bg-surface-mint`, `bg-muted`…). */
      surface: string;
    }
);

/**
 * Une humeur ou un niveau, sur un pastel au sens fixe, avec son libellé.
 * Variante par défaut : Mō de la table partagée (`PARENT_MOOD_FACES`),
 * décoratif (`aria-hidden`) ; à réserver aux sélecteurs d'humeur du parent.
 * Variante `mo={false}` : sans Mō. Jamais de Mō en mode crise, sur le
 * rapport ni à côté d'un prix (DESIGN.md, « Mō »).
 */
export function MoodBadge(props: MoodBadgeProps) {
  const { label, size = "md", trailing, className } = props;
  const s = SIZES[size];
  const face = props.mo === false ? null : PARENT_MOOD_FACES[props.score];
  return (
    <span
      data-slot="mood-badge"
      data-mood={face?.state}
      className={cn(
        "flex w-full min-w-0 items-center text-foreground",
        face ? face.surface : props.mo === false && props.surface,
        s.box,
        face ? s.padMo : s.padText,
        // Sans Mō, la ligne n'a plus à loger un visage de 44 px.
        !face && size === "md" && "min-h-12",
        className,
      )}
    >
      {face && <Mo state={face.state} size={s.mo} shadow={false} />}
      <span className="min-w-0 flex-1 font-semibold hyphens-auto [overflow-wrap:break-word]">{label}</span>
      {trailing}
    </span>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Mo } from "./mo";
import { PARENT_MOOD_FACES, type MoodScore } from "./parent-mood-faces";

const SIZES = {
  sm: { mo: 32, box: "min-h-11 gap-2 rounded-xl py-1 pr-3 text-sm", padMo: "pl-1.5", padText: "pl-3" },
  md: { mo: 44, box: "min-h-14 gap-3 rounded-2xl py-1.5 pr-4 text-[0.9375rem]", padMo: "pl-2", padText: "pl-4" },
} as const;

type MoodBadgeProps = {
  label: ReactNode;
  size?: keyof typeof SIZES;
  trailing?: ReactNode;
  className?: string;
} & (
  | {
      score: MoodScore;
      mo?: true;
    }
  | {
      mo: false;
      surface: string;
    }
);

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

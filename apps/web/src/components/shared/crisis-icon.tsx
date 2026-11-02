import { createElement, type ComponentProps } from "react";
import { moSpecFor } from "@focusflow/mo/step-icons";
import { MoSpecIcon } from "@/components/shared/mo-spec-icon";
import { iconFor } from "@/lib/icon-for";

type CrisisIconProps = {
  emoji?: string | null;
  name?: string;
  size?: number;
  moClassName?: string;
} & Omit<ComponentProps<"svg">, "ref">;

export function CrisisIcon({ emoji, name, size, moClassName, ...props }: CrisisIconProps) {
  const spec = size ? moSpecFor({ label: name ?? "", emoji, kind: "step" }) : undefined;
  if (spec && size) {
    return <MoSpecIcon spec={spec} size={size} className={moClassName} seed={`${spec.name}:${name ?? ""}`} />;
  }
  return createElement(iconFor({ emoji }), { "aria-hidden": true, ...props });
}

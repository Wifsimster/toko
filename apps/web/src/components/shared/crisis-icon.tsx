import { createElement, type ComponentProps } from "react";
import { iconFor } from "@/lib/icon-for";

type CrisisIconProps = { emoji?: string | null } & Omit<ComponentProps<"svg">, "ref">;

export function CrisisIcon({ emoji, ...props }: CrisisIconProps) {
  return createElement(iconFor({ emoji }), { "aria-hidden": true, ...props });
}

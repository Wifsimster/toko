import { createElement, type ComponentProps } from "react";
import { itemIconFor } from "@/lib/icon-for";

type ItemIconProps = { value?: string | null; label?: string } & Omit<ComponentProps<"svg">, "ref">;

export function ItemIcon({ value, label, ...props }: ItemIconProps) {
  return createElement(
    itemIconFor(value),
    label ? { role: "img", "aria-label": label, ...props } : { "aria-hidden": true, ...props },
  );
}

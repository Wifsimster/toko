import { createElement, type ComponentProps } from "react";
import { moSpecFor, type MoIconKind } from "@focusflow/mo/step-icons";
import { MoSpecIcon } from "@/components/shared/mo-spec-icon";
import { itemIconFor } from "@/lib/icon-for";

type ItemIconProps = {
  value?: string | null;
  label?: string;
  name?: string;
  kind?: MoIconKind;
  size?: number;
} & Omit<ComponentProps<"svg">, "ref">;

export function ItemIcon({ value, label, name, kind = "step", size, className, ...props }: ItemIconProps) {
  const spec = size ? moSpecFor({ label: name ?? "", emoji: value, kind }) : undefined;
  if (spec && size) {
    return <MoSpecIcon spec={spec} size={size} label={label} className={className} seed={`${spec.name}:${name ?? ""}`} />;
  }
  return createElement(
    itemIconFor(value),
    label
      ? { role: "img", "aria-label": label, className, ...props }
      : { "aria-hidden": true, className, ...props },
  );
}

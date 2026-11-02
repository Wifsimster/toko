import { createElement, type ComponentProps } from "react";
import { ITEM_ICON_STORED } from "@focusflow/mo/item-icons";
import { moSpecFor, type MoIconKind } from "@focusflow/mo/step-icons";
import { MoSpecIcon } from "@/components/shared/mo-spec-icon";
import { itemIconFor } from "@/lib/icon-for";
import { itemIconKeyFor } from "@/lib/item-icons";

type ItemIconProps = {
  value?: string | null;
  label?: string;
  name?: string;
  kind?: MoIconKind;
  size?: number;
} & Omit<ComponentProps<"svg">, "ref">;

export function ItemIcon({ value, label, name, kind = "step", size, className, ...props }: ItemIconProps) {
  const key = itemIconKeyFor(value);
  const emoji = key ? ITEM_ICON_STORED[key] : value;
  const spec = size ? moSpecFor({ label: name ?? "", emoji, kind }) : undefined;
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

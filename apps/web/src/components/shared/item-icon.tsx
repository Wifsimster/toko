import { createElement, type ComponentProps } from "react";
import { moIcons } from "@focusflow/mo/icons";
import { moSpecFor, type MoIconKind } from "@focusflow/mo/step-icons";
import { Picto } from "@/components/mo/companion";
import { MoPaths } from "@/components/mo/mo";
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
  if (spec?.kind === "picto") {
    return <Picto name={spec.name} size={size ?? 24} label={label} className={className} />;
  }
  if (spec?.kind === "mo-icon") {
    const art = moIcons[spec.name];
    return (
      <span
        className={`inline-block shrink-0 ${className ?? ""}`}
        style={{ width: size, height: size }}
        {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      >
        <svg viewBox={art.viewBox} width={size} height={size} aria-hidden="true" focusable="false" className="block size-full overflow-visible">
          <MoPaths art={art} />
        </svg>
      </span>
    );
  }
  return createElement(
    itemIconFor(value),
    label
      ? { role: "img", "aria-label": label, className, ...props }
      : { "aria-hidden": true, className, ...props },
  );
}

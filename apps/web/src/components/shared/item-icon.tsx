import { ITEM_ICON_STORED } from "@focusflow/mo/item-icons";
import { moSpecForItem, type MoIconKind } from "@focusflow/mo/step-icons";
import { MoSpecIcon } from "@/components/shared/mo-spec-icon";
import { itemIconKeyFor } from "@/lib/item-icons";

export function ItemIcon({
  value,
  label,
  name,
  kind = "step",
  size = 24,
  className,
}: {
  value?: string | null;
  label?: string;
  name?: string;
  kind?: MoIconKind;
  size?: number;
  className?: string;
}) {
  const key = itemIconKeyFor(value);
  const emoji = key ? ITEM_ICON_STORED[key] : value;
  const spec = moSpecForItem({ label: name ?? "", emoji, kind });
  return <MoSpecIcon spec={spec} size={size} label={label} className={className} seed={`${spec.name}:${name ?? ""}`} />;
}

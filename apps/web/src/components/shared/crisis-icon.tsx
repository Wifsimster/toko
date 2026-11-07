import { moSpecFor, moSpecForCrisis } from "@focusflow/mo/step-icons";
import { MoSpecIcon } from "@/components/shared/mo-spec-icon";

export function CrisisIcon({
  emoji,
  name,
  size = 24,
  className,
}: {
  emoji?: string | null;
  name?: string;
  size?: number;
  className?: string;
}) {
  const spec = moSpecFor({ label: name ?? "", emoji, kind: "crisis" }) ?? moSpecForCrisis(emoji);
  return <MoSpecIcon spec={spec} size={size} className={className} seed={`${spec.name}:${name ?? ""}`} />;
}
